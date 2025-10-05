import QRCode from "qrcode";
// backend/services/emailService.js (refactored)
import nodemailer from "nodemailer";
import logger from "../utils/logger.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import {
  registrationConfirmationTemplate,
  paymentConfirmationTemplate,
  paymentReminderTemplate,
} from "./emailTemplates.js";

import PDFDocument from "pdfkit";

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generates an elegant, professional ticket PDF buffer with QR code
 * Modern design with better typography, spacing, and visual hierarchy
 */
async function generateTicketPDF(data) {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate QR code
      const qrPayload = JSON.stringify({
        ticketNumber: data.ticketNumber,
        registrationId: data.registrationId,
        email: data.email || `${data.firstName}@event.com`,
        event: data.eventTitle,
        date: data.eventDate,
      });

      let qrDataURL;
      try {
        qrDataURL = await QRCode.toDataURL(qrPayload, {
          width: 120,
          margin: 1,
          color: {
            dark: "#4a1d7e",
            light: "#FFFFFF",
          },
        });
      } catch (qrError) {
        logger.warn("ticket.qr.generation_failed", {
          ticketNumber: data.ticketNumber,
          error: qrError.message,
        });
      }

      const doc = new PDFDocument({
        size: [800, 380],
        margins: { top: 0, bottom: 0, left: 0, right: 0 },
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // ============ LEFT SECTION - BRAND AREA ============
      const leftWidth = 320;

      // Gradient background (simulated with overlapping rectangles)
      doc.rect(0, 0, leftWidth, 380).fill("#4a1d7e");
      doc.rect(0, 0, leftWidth, 380).fillOpacity(0.8).fill("#6b2d9e");
      doc.rect(0, 100, leftWidth, 280).fillOpacity(0.3).fill("#d83565");
      doc.fillOpacity(1);

      // Decorative circles
      doc
        .circle(leftWidth - 40, 40, 60)
        .fillOpacity(0.05)
        .fill("#FFFFFF");
      doc.circle(40, 340, 50).fillOpacity(0.05).fill("#FFFFFF");
      doc.fillOpacity(1);

      // Brand Logo/Name Area (top)
      doc
        .roundedRect(30, 30, 180, 35, 6)
        .fillOpacity(0.15)
        .fill("#FFFFFF")
        .fillOpacity(1);

      doc
        .fontSize(16)
        .fillColor("#FFFFFF")
        .font("Helvetica-Bold")
        .text("SALONS ASSURED", 45, 40, { width: 150 });

      doc
        .fontSize(8)
        .fillColor("#FFD700")
        .font("Helvetica")
        .text("★ ELEVATE SUMMIT", 45, 55, { width: 150 });

      // QR Code Section (center)
      if (qrDataURL) {
        try {
          const qrBuffer = Buffer.from(
            qrDataURL.replace(/^data:image\/png;base64,/, ""),
            "base64"
          );

          // White rounded background for QR
          doc.roundedRect(90, 140, 140, 140, 10).fill("#FFFFFF");

          doc.image(qrBuffer, 100, 150, { width: 120, height: 120 });

          doc
            .fontSize(9)
            .fillColor("#FFFFFF")
            .font("Helvetica")
            .text("SCAN TO VERIFY", 70, 295, {
              width: 180,
              align: "center",
              characterSpacing: 1.5,
            });
        } catch (imgError) {
          logger.warn("ticket.qr.embed_failed", {
            ticketNumber: data.ticketNumber,
            error: imgError.message,
          });
        }
      }

      // Ticket Number (bottom)
      doc
        .fontSize(8)
        .fillColor("rgba(255, 255, 255, 0.6)")
        .font("Helvetica")
        .text("TICKET NO.", 30, 330, { align: "left" });

      doc
        .fontSize(10)
        .fillColor("#FFFFFF")
        .font("Courier-Bold")
        .text(data.ticketNumber, 30, 345, { align: "left" });

      // ============ PERFORATION LINE ============
      const perfX = leftWidth + 1;
      doc.strokeColor("#E0E0E0").lineWidth(1);

      // Dashed line
      for (let y = 10; y < 370; y += 15) {
        doc
          .moveTo(perfX, y)
          .lineTo(perfX, y + 8)
          .stroke();
      }

      // Perforation circles
      for (let y = 10; y < 380; y += 20) {
        doc.circle(perfX, y, 4).fill("#F5F5F5");
      }

      // ============ RIGHT SECTION - EVENT DETAILS ============
      const rightX = leftWidth + 20;
      const rightWidth = 800 - leftWidth - 40;

      // Subtle background gradient
      doc.rect(leftWidth, 0, 800 - leftWidth, 380).fill("#FAFAFA");
      doc
        .rect(leftWidth, 0, 800 - leftWidth, 380)
        .fillOpacity(0.5)
        .fill("#FFFFFF")
        .fillOpacity(1);

      // Date Header Section with border
      doc
        .roundedRect(rightX, 30, rightWidth, 60, 8)
        .lineWidth(2)
        .strokeColor("#E8D5F2")
        .stroke();

      // Calendar icon (simple rectangle representation)
      doc
        .rect(rightX + 15, 45, 24, 24)
        .lineWidth(2)
        .strokeColor("#6b2d9e")
        .stroke();
      doc.rect(rightX + 15, 45, 24, 8).fill("#6b2d9e");

      // Date text
      const eventDate = new Date(data.eventDate);
      doc
        .fontSize(8)
        .fillColor("#808080")
        .font("Helvetica")
        .text("DATE", rightX + 50, 42, { characterSpacing: 1 });

      doc
        .fontSize(12)
        .fillColor("#2d2d2d")
        .font("Helvetica-Bold")
        .text(
          eventDate.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          }),
          rightX + 50,
          55
        );

      // Doors open (right side)
      doc
        .fontSize(8)
        .fillColor("#808080")
        .font("Helvetica")
        .text("DOORS OPEN", rightX + rightWidth - 80, 42, {
          width: 80,
          align: "right",
          characterSpacing: 1,
        });

      doc
        .fontSize(11)
        .fillColor("#2d2d2d")
        .font("Helvetica-Bold")
        .text(data.doorsOpen || "7:00 PM", rightX + rightWidth - 80, 55, {
          width: 80,
          align: "right",
        });

      // Event Title Section
      doc
        .fontSize(32)
        .fillColor("#4a1d7e")
        .font("Helvetica-Bold")
        .text(data.eventTitle, rightX, 120, {
          width: rightWidth,
          align: "left",
          lineGap: 5,
        });

      doc
        .fontSize(16)
        .fillColor("#d83565")
        .font("Helvetica-Bold")
        .text(data.eventSubtitle || "2025", rightX, 165, {
          width: rightWidth,
          align: "left",
        });

      // Details Box
      doc
        .roundedRect(rightX, 205, rightWidth, 110, 8)
        .fill("#FFFFFF")
        .lineWidth(1)
        .strokeColor("#E0E0E0")
        .stroke();

      let detailY = 220;

      // Time icon and text
      doc.circle(rightX + 15, detailY + 5, 3).fill("#6b2d9e");
      doc
        .fontSize(8)
        .fillColor("#808080")
        .font("Helvetica")
        .text("TIME", rightX + 30, detailY - 2);

      doc
        .fontSize(11)
        .fillColor("#2d2d2d")
        .font("Helvetica-Bold")
        .text(
          data.eventTime || "8:00 PM - 11:00 PM",
          rightX + 30,
          detailY + 10
        );

      detailY += 35;

      // Location icon and text
      doc.circle(rightX + 15, detailY + 5, 3).fill("#6b2d9e");
      doc
        .fontSize(8)
        .fillColor("#808080")
        .font("Helvetica")
        .text("VENUE", rightX + 30, detailY - 2);

      doc
        .fontSize(10)
        .fillColor("#2d2d2d")
        .font("Helvetica-Bold")
        .text(data.location || "Event Venue", rightX + 30, detailY + 10, {
          width: rightWidth - 50,
        });

      detailY += 35;

      // Attendee info
      doc.circle(rightX + 15, detailY + 5, 3).fill("#6b2d9e");
      doc
        .fontSize(8)
        .fillColor("#808080")
        .font("Helvetica")
        .text("ATTENDEE", rightX + 30, detailY - 2);

      doc
        .fontSize(11)
        .fillColor("#2d2d2d")
        .font("Helvetica-Bold")
        .text(`${data.firstName} ${data.lastName}`, rightX + 30, detailY + 10);

      // Registration ID (bottom right, subtle)
      doc
        .fontSize(7)
        .fillColor("#B0B0B0")
        .font("Courier")
        .text(`REG: ${data.registrationId}`, rightX, 340, {
          width: rightWidth,
          align: "right",
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Resolve SMTP/Brevo environment variables with graceful fallback.
function resolveMailConfig() {
  const host =
    process.env.BREVO_SMTP_HOST ||
    process.env.SMTP_HOST ||
    "smtp-relay.brevo.com";
  const port = Number(
    process.env.BREVO_SMTP_PORT || process.env.SMTP_PORT || 587
  );
  const user = process.env.BREVO_SMTP_USER || process.env.SMTP_USER;
  const pass = process.env.BREVO_SMTP_PASS || process.env.SMTP_PASS;
  return { host, port, user, pass };
}

let cachedTransporter = null;
function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const { host, port, user, pass } = resolveMailConfig();
  if (!user || !pass) {
    logger.warn("mail.missing_credentials", {
      msg: "SMTP credentials missing; emails will fail",
    });
  }
  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: user && pass ? { user, pass } : undefined,
  });
  return cachedTransporter;
}

async function sendWithRetry(
  mailOptions,
  { attempts = 3, delayMs = 1000 } = {}
) {
  const transporter = getTransporter();
  let lastError;
  for (let i = 1; i <= attempts; i++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      logger.info("mail.sent", {
        to: mailOptions.to,
        messageId: info.messageId,
      });
      if (i > 1) {
        logger.info("mail.retry.success", {
          to: mailOptions.to,
          retries: i - 1,
        });
      }
      return { success: true, messageId: info.messageId };
    } catch (err) {
      lastError = err;
      logger.warn("mail.attempt.failed", {
        attempt: i,
        to: mailOptions.to,
        error: err.message,
      });
      if (i < attempts) {
        await new Promise((r) => setTimeout(r, delayMs * i)); // Exponential-ish backoff
      }
    }
  }
  return { success: false, error: lastError?.message || "Unknown email error" };
}

const FROM_ADDRESS =
  process.env.MAIL_FROM ||
  process.env.BREVO_FROM ||
  process.env.SMTP_FROM ||
  "support@salons-assured.com";
//   "<support@salons-assured.com>"
const BRAND = "Salons Assured Elevate Summit";

async function sendRegistrationConfirmation(data) {
  try {
    logger.info("email.registration.build", {
      to: data.email,
      event: data.eventTitle,
    });
    const html = registrationConfirmationTemplate(data);
    const subject = `Registration Confirmed – ${data.eventTitle}`;
    return await sendWithRetry({
      from: FROM_ADDRESS,
      to: data.email,
      subject,
      html,
    });
  } catch (error) {
    logger.error("email.registration.build_error", {
      to: data.email,
      error: error.message,
    });
    return { success: false, error: error.message };
  }
}

// async function sendPaymentConfirmation(data) {
//   try {
//     const html = paymentConfirmationTemplate(data);
//     const subject = `Payment Successful – Ticket for ${data.eventTitle}`;
//     const attachments = [
//       {
//         filename: "ticket.txt",
//         content: `TICKET DETAILS\nTicket Number: ${data.ticketNumber}\nEvent: ${
//           data.eventTitle
//         }\nDate: ${new Date(data.eventDate).toLocaleDateString()}\nName: ${
//           data.firstName
//         } ${data.lastName}\nRegistration ID: ${
//           data.registrationId
//         }\nAmount Paid: KES ${data.amount}`,
//       },
//     ];
//     return await sendWithRetry({
//       from: FROM_ADDRESS,
//       to: data.email,
//       subject,
//       html,
//       attachments,
//     });
//   } catch (error) {
//     console.error("Error building payment confirmation email:", error);
//     return { success: false, error: error.message };
//   }
// }
async function sendPaymentConfirmation(data) {
  try {
    const html = paymentConfirmationTemplate(data);
    const subject = `Payment Successful – Ticket for ${data.eventTitle}`;

    // Generate PDF ticket (graceful fallback if generation fails)
    let pdfBuffer = null;
    try {
      pdfBuffer = await generateTicketPDF(data);
    } catch (pdfErr) {
      logger.warn("ticket.pdf.failed", {
        ticketNumber: data.ticketNumber,
        error: pdfErr.message,
      });
    }

    const attachments = [];
    if (pdfBuffer) {
      attachments.push({
        filename: `ticket-${data.ticketNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      });
    }
    attachments.push({
      filename: "ticket-details.txt",
      content: `TICKET DETAILS\nTicket Number: ${data.ticketNumber}\nEvent: ${
        data.eventTitle
      }\nDate: ${new Date(data.eventDate).toLocaleDateString()}\nName: ${
        data.firstName
      } ${data.lastName}\nRegistration ID: ${data.registrationId}${
        data.totalAmount ? `\nTotal Amount: KES ${data.totalAmount}` : ""
      }\nAmount Paid: KES ${data.amount}${
        data.remainingBalance && data.remainingBalance > 0
          ? `\nRemaining Balance: KES ${data.remainingBalance}\n** PARTIAL PAYMENT - Balance pending **`
          : ""
      }`,
    });

    return await sendWithRetry({
      from: FROM_ADDRESS,
      to: data.email,
      subject,
      html,
      attachments,
    });
  } catch (error) {
    logger.error("email.payment.build_error", {
      to: data.email,
      error: error.message,
    });
    return { success: false, error: error.message };
  }
}

async function sendPaymentReminder(data) {
  try {
    const html = paymentReminderTemplate(data);
    const subject = `Payment Reminder – ${data.eventTitle}`;
    return await sendWithRetry({
      from: FROM_ADDRESS,
      to: data.email,
      subject,
      html,
    });
  } catch (error) {
    logger.error("email.reminder.build_error", {
      to: data.email,
      error: error.message,
    });
    return { success: false, error: error.message };
  }
}

export {
  sendRegistrationConfirmation,
  sendPaymentConfirmation,
  sendPaymentReminder,
};
