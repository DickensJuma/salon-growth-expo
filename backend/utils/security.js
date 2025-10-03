// backend/utils/security.js
import crypto from "crypto";
import logger from "./logger.js";

/**
 * Verify Paystack webhook signature
 * @param {string} body - Raw request body (stringified JSON)
 * @param {string} signature - x-paystack-signature header
 * @returns {boolean}
 */
export function verifyPaystackSignature(body, signature) {
  if (!signature) {
    logger.warn("webhook.signature.missing");
    return false;
  }

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(body)
    .digest("hex");

  const isValid = hash === signature;

  if (!isValid) {
    logger.error("webhook.signature.invalid", {
      expected: hash.substring(0, 10) + "...",
      received: signature.substring(0, 10) + "...",
    });
  }

  return isValid;
}

/**
 * Validate required environment variables
 * @throws {Error} if critical env vars are missing
 */
export function validateEnvironment() {
  const required = [
    "MONGODB_URI",
    "PAYSTACK_SECRET_KEY",
    "BREVO_SMTP_USER",
    "BREVO_SMTP_PASS",
    "MAIL_FROM",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    logger.error("env.validation.failed", { missing });
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  logger.info("env.validation.passed");
}
