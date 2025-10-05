import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import services
import User from "./models/User.js";
import Event from "./models/Event.js";
import Registration from "./models/Registration.js";
import { sendRegistrationConfirmation } from "./services/emailService.js";
import { processSuccessfulPayment } from "./services/paymentDomain.js";
import { verifyTicket } from "./services/ticketService.js";
import logger from "./utils/logger.js";
import {
  validateEnvironment,
  verifyPaystackSignature,
} from "./utils/security.js";
import {
  apiLimiter,
  registrationLimiter,
  paymentLimiter,
  webhookLimiter,
} from "./middleware/rateLimiter.js";
import {
  validateRegistration,
  validatePaymentInit,
  validatePaymentVerify,
  validateTicketNumber,
} from "./middleware/validation.js";

dotenv.config();

// Environment variables validation
try {
  validateEnvironment();
} catch (error) {
  logger.error("startup.env_validation_failed", { error: error.message });
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3000;

// Database connection
const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/salon-growth-expo";
    await mongoose.connect(mongoURI);
    logger.info("db.connected");
  } catch (error) {
    logger.error("db.connection_error", { error: error.message });
    process.exit(1);
  }
};

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3001",
  "https://event.salons-assured.com",
  "https://www.event.salons-assured.com",
];

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, curl, mobile apps) when not in strict production
      const isStrictProduction =
        process.env.NODE_ENV === "production" &&
        process.env.STRICT_CORS === "true";

      if (!origin && !isStrictProduction) {
        // Allow in development or production without STRICT_CORS
        return callback(null, true);
      }

      // In strict production mode, reject requests with no origin
      if (!origin && isStrictProduction) {
        logger.warn("cors.no_origin_rejected", { ip: "unknown" });
        return callback(new Error("Origin required"));
      }

      // Check if origin is in allowed list
      if (origin && allowedOrigins.includes(origin)) {
        callback(null, true);
      } else if (origin) {
        logger.warn("cors.origin_rejected", { origin });
        callback(new Error("Not allowed by CORS"));
      } else {
        // Fallback - allow if no origin and not strict
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Body parser with size limits
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Apply rate limiting to all API routes
app.use("/api/", apiLimiter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  const health = {
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    mongodb:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  };
  const status = health.mongodb === "connected" ? 200 : 503;
  res.status(status).json(health);
});

// Ticket verification endpoint
app.get(
  "/api/tickets/verify/:ticketNumber",
  validateTicketNumber,
  async (req, res) => {
    const { ticketNumber } = req.params;
    const result = await verifyTicket(ticketNumber);
    if (result.success && result.valid) {
      return res.json(result);
    }
    if (result.success && !result.valid) {
      // 404 if explicitly not found
      const status = result.reason === "not_found" ? 404 : 200;
      return res.status(status).json(result);
    }
    return res.status(500).json(result);
  }
);

// Get all events
app.get("/api/events", async (req, res) => {
  try {
    const events = await Event.find({ isActive: true }).sort({ date: 1 });
    res.json({
      success: true,
      events: events.map((event) => ({
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        price: event.price,
        maxAttendees: event.maxAttendees,
        currentAttendees: event.currentAttendees,
        category: event.category,
        imageUrl: event.imageUrl,
      })),
    });
  } catch (error) {
    logger.error("events.fetch_error", { error: error.message });
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get single event
app.get("/api/events/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({
      success: true,
      event: {
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        location: event.location,
        price: event.price,
        maxAttendees: event.maxAttendees,
        currentAttendees: event.currentAttendees,
        category: event.category,
        imageUrl: event.imageUrl,
      },
    });
  } catch (error) {
    logger.error("event.fetch_error", {
      error: error.message,
      id: req.params.id,
    });
    res.status(500).json({ message: "Internal server error" });
  }
});

// User registration endpoint (enhanced for events)
app.post(
  "/api/register",
  registrationLimiter,
  validateRegistration,
  async (req, res) => {
    try {
      const {
        email,
        password,
        firstName,
        lastName,
        businessName,
        ownerName,
        phone,
        location,
        ticketType = "standard",
        eventId,
      } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      let user;

      if (existingUser) {
        user = existingUser;
      } else {
        // Hash password before storing
        const hashedPassword = password
          ? await bcrypt.hash(password, 10)
          : await bcrypt.hash(Math.random().toString(36), 10); // Generate random if not provided

        // Create new user
        user = new User({
          email: email.toLowerCase(),
          password: hashedPassword,
          firstName,
          lastName,
          phoneNumber: phone,
        });
        await user.save();
      }

      // If eventId is provided, create event registration
      if (eventId) {
        const event = await Event.findById(eventId);
        if (!event) {
          return res.status(404).json({ message: "Event not found" });
        }

        // Check if user already registered for this event
        const existingRegistration = await Registration.findOne({
          user: user._id,
          event: eventId,
        });

        if (existingRegistration) {
          return res
            .status(400)
            .json({ message: "User already registered for this event" });
        }

        // Create registration
        let registration = new Registration({
          user: user._id,
          event: eventId,
          attendeeInfo: {
            firstName,
            lastName,
            email: email.toLowerCase(),
            phoneNumber: phone,
          },
          totalAmount: event.price,
          amountPaid: 0,
          remainingBalance: event.price,
          paymentType: "full",
          paymentStatus: "pending",
          registrationDate: new Date(),
          ticketSent: false,
          confirmationSent: false,
        });

        // Now generate ticket number using _id
        registration.ticketNumber = `TICKET_${registration._id
          .toString()
          .slice(-8)
          .toUpperCase()}`;

        await registration.save();

        // Send registration confirmation email (Salons Assured Elevate Summit branding)
        try {
          await sendRegistrationConfirmation({
            email: email.toLowerCase(),
            firstName,
            lastName,
            eventTitle: event.title,
            eventDate: event.date,
            amount: event.price,
            registrationId: registration._id,
          });
        } catch (emailError) {
          logger.error("email.registration.send_failed", {
            error: emailError.message,
            registrationId: registration._id,
          });
          // Don't fail the registration if email fails
        }

        return res.status(201).json({
          success: true,
          message: "Registration created successfully",
          registrationId: registration._id,
          user: { email, firstName, lastName },
          event: {
            id: event._id,
            title: event.title,
            date: event.date,
            price: event.price,
          },
        });
      }

      // Regular user registration without event
      res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: { email, firstName, lastName },
      });
    } catch (error) {
      logger.error("registration.error", { error: error.message });
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Payment initialization endpoint
app.post(
  "/api/initialize-payment",
  paymentLimiter,
  validatePaymentInit,
  async (req, res) => {
    try {
      const {
        email,
        amount,
        registrationId,
        callbackUrl,
        metadata = {},
      } = req.body;

      if (!email || !amount) {
        return res
          .status(400)
          .json({ message: "Email and amount are required" });
      }

      // Generate unique payment reference
      const paymentReference = `PAY_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // If registrationId is provided, update the registration with payment reference and payment type
      if (registrationId) {
        const updateData = {
          paymentReference: paymentReference,
          paymentStatus: "pending",
        };

        // Update payment type if provided in metadata
        if (metadata.paymentType) {
          updateData.paymentType = metadata.paymentType;
        }

        await Registration.findByIdAndUpdate(registrationId, updateData);
      }

      // Initialize payment with Paystack
      const { initializePayment } = await import(
        "./services/paymentService.js"
      );

      const paymentData = {
        email,
        amount: Math.round(amount), // Amount in kobo (smallest currency unit)
        reference: paymentReference,
        callback_url:
          callbackUrl ||
          `${
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
          }/payment/callback`,
        currency: "KES",
        channels: ["card", "bank", "mobile_money"],
        metadata: {
          ...metadata,
          registrationId,
          paymentReference,
        },
      };

      const result = await initializePayment(paymentData);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: "Payment initialized successfully",
          data: result.data,
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error) {
      logger.error("payment.initialize.error", { error: error.message });
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Paystack webhook endpoint
app.post("/api/webhooks/paystack", webhookLimiter, async (req, res) => {
  try {
    // Verify webhook signature
    const signature = req.headers["x-paystack-signature"];
    const body = JSON.stringify(req.body);

    // Verify signature before processing
    if (!verifyPaystackSignature(body, signature)) {
      logger.error("webhook.signature.invalid", {
        event: req.body.event,
        ip: req.ip,
      });
      return res.status(401).json({ error: "Invalid signature" });
    }

    logger.info("webhook.received", {
      provider: "paystack",
      event: req.body.event,
    });

    const { event, data } = req.body;

    switch (event) {
      case "charge.success":
        // Handle successful payment
        const reference = data.reference;

        const processed = await processSuccessfulPayment(reference, data);
        if (!processed.success) {
          logger.error("webhook.process_failed", {
            reference,
            error: processed.error,
          });
        } else if (processed.alreadyProcessed) {
          logger.info("webhook.already_processed", { reference });
        } else {
          logger.info("webhook.processed", {
            reference,
            ticket: processed.ticketNumber,
            emailSent: processed.emailSent,
          });
        }
        break;

      case "charge.failed":
        // Handle failed payment
        const failedReference = data.reference;

        await Registration.findOneAndUpdate(
          { paymentReference: failedReference },
          { paymentStatus: "failed" }
        );

        logger.warn("payment.failed", { reference: failedReference });
        break;

      default:
        logger.warn("webhook.unhandled_event", { event });
    }

    // Always respond with 200 to acknowledge webhook
    res.status(200).json({ received: true });
  } catch (error) {
    logger.error("webhook.error", { error: error.message });
    res.status(500).json({ error: "Webhook processing failed" });
  }
});
// Payment verification endpoint
app.post(
  "/api/payments/verify",
  paymentLimiter,
  validatePaymentVerify,
  async (req, res) => {
    const { reference } = req.body;
    if (!reference)
      return res.status(400).json({ message: "Payment reference is required" });
    try {
      const { verifyPayment } = await import("./services/paymentService.js");
      const verify = await verifyPayment(reference);
      if (!verify.success) {
        return res.status(400).json({ success: false, error: verify.error });
      }
      const processed = await processSuccessfulPayment(reference, verify.data);
      if (!processed.success) {
        return res.status(400).json({ success: false, error: processed.error });
      }
      res.status(200).json({ success: true, data: verify.data, processed });
    } catch (err) {
      logger.error("payment.verify.error", { error: err.message, reference });
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  }
);
// Only serve static files that don't start with /api
if (process.env.NODE_ENV === "production") {
  app.use("/static", express.static(path.join(__dirname, "../dist")));
}

// Connect to database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    logger.info("server.started", { port: PORT });
  });
});

export default app;
