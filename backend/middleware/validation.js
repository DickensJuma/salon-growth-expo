// backend/middleware/validation.js
import { body, param, validationResult } from "express-validator";

/**
 * Middleware to check validation results
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

/**
 * Registration validation rules
 */
export const validateRegistration = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("firstName")
    .trim()
    .notEmpty()
    .isLength({ min: 2, max: 50 })
    .escape()
    .withMessage("First name must be 2-50 characters"),
  body("lastName")
    .trim()
    .notEmpty()
    .isLength({ min: 2, max: 50 })
    .escape()
    .withMessage("Last name must be 2-50 characters"),
  body("phone")
    .trim()
    .matches(/^[0-9+\-\s()]+$/)
    .isLength({ min: 10, max: 15 })
    .withMessage("Valid phone number is required"),
  body("eventId")
    .optional()
    .isMongoId()
    .withMessage("Valid event ID is required"),
  validate,
];

/**
 * Payment initialization validation rules
 */
export const validatePaymentInit = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("amount")
    .isNumeric()
    .isInt({ min: 1 })
    .withMessage("Valid amount is required"),
  body("registrationId")
    .optional()
    .isMongoId()
    .withMessage("Valid registration ID is required"),
  validate,
];

/**
 * Payment verification validation rules
 */
export const validatePaymentVerify = [
  body("reference")
    .trim()
    .notEmpty()
    .isLength({ min: 10, max: 100 })
    .withMessage("Valid payment reference is required"),
  validate,
];

/**
 * Ticket verification validation rules
 */
export const validateTicketNumber = [
  param("ticketNumber")
    .trim()
    .notEmpty()
    .matches(/^TICKET_[A-Z0-9]+$/)
    .withMessage("Valid ticket number is required"),
  validate,
];
