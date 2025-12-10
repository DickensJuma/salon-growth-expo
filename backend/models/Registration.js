// backend/models/Registration.js
import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  registrationDate: {
    type: Date,
    default: Date.now,
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed", "refunded"],
    default: "pending",
  },
  paymentReference: {
    type: String,
    // Allow multiple attempts / references per registration in future; no unique constraint
    // Index declared below using schema.index() to avoid duplicate warning
    sparse: true, // Still sparse so absent values don't bloat index
  },
  totalAmount: {
    type: Number,
    default: 0,
  },
  // Original (pre-discount) amount for audit/reference
  originalAmount: {
    type: Number,
    default: 0,
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  remainingBalance: {
    type: Number,
    default: 0,
  },
  paymentType: {
    type: String,
    enum: ["full", "partial"],
    default: "full",
  },
  // Percentage discount actually applied and locked at registration time
  appliedDiscountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  ticketNumber: {
    type: String,
    unique: true,
  },
  ticketSent: {
    type: Boolean,
    default: false,
  },
  paymentEmailSent: {
    type: Boolean,
    default: false,
  },
  confirmationSent: {
    type: Boolean,
    default: false,
  },
  attendeeInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phoneNumber: String,
    specialRequirements: String,
  },
});

// Compound index to ensure a user can only register once for an event
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

// Non-unique index for paymentReference (sparse to allow null/undefined)
registrationSchema.index({ paymentReference: 1 }, { sparse: true });

export default mongoose.model("Registration", registrationSchema);
