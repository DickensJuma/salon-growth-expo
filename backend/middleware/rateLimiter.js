// backend/middleware/rateLimiter.js
import rateLimit from "express-rate-limit";
import logger from "../utils/logger.js";

/**
 * General API rate limiter
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    logger.warn("rate_limit.exceeded", {
      ip: req.ip,
      path: req.path,
    });
    res.status(429).json({
      success: false,
      message: "Too many requests, please try again later.",
    });
  },
});

/**
 * Strict rate limiter for registration endpoints
 */
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registration attempts per hour
  skipSuccessfulRequests: true, // Don't count successful requests
  message: "Too many registration attempts, please try again later.",
  handler: (req, res) => {
    logger.warn("rate_limit.registration.exceeded", {
      ip: req.ip,
      email: req.body?.email,
    });
    res.status(429).json({
      success: false,
      message: "Too many registration attempts. Please try again in an hour.",
    });
  },
});

/**
 * Strict rate limiter for payment endpoints
 */
export const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 payment operations per 15 minutes
  message: "Too many payment requests, please try again later.",
  handler: (req, res) => {
    logger.warn("rate_limit.payment.exceeded", {
      ip: req.ip,
    });
    res.status(429).json({
      success: false,
      message: "Too many payment requests. Please try again in a few minutes.",
    });
  },
});

/**
 * Very strict rate limiter for webhook endpoints
 * (Paystack should only send a few per transaction)
 */
export const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // Max 20 webhooks per minute (generous for retries)
  skipFailedRequests: true,
  message: "Too many webhook requests",
  handler: (req, res) => {
    logger.error("rate_limit.webhook.exceeded", {
      ip: req.ip,
      signature: req.headers["x-paystack-signature"]?.substring(0, 10),
    });
    res.status(429).json({ error: "Rate limit exceeded" });
  },
});
