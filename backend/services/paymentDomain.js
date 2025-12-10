// backend/services/paymentDomain.js
// Shared domain logic for processing a successful Paystack payment.
import Registration from "../models/Registration.js";
import { sendPaymentConfirmation } from "./emailService.js";
import logger from "../utils/logger.js";

/**
 * Process a successful Paystack payment reference.
 * Idempotent: if already paid & payment email sent, returns early.
 * @param {string} reference Paystack transaction reference
 * @param {object} paystackData Raw data.data object from Paystack verify
 * @returns {Promise<{success:boolean; alreadyProcessed?:boolean; ticketNumber?:string; emailSent?:boolean; error?:string}>}
 */
export async function processSuccessfulPayment(reference, paystackData) {
  try {
    let registration = await Registration.findOne({
      paymentReference: reference,
    })
      .populate("event")
      .populate("user");

    // Fallback: use metadata.registrationId if provided by Paystack
    if (!registration && paystackData?.metadata?.registrationId) {
      try {
        const fallbackId = paystackData.metadata.registrationId;
        const fallback = await Registration.findById(fallbackId)
          .populate("event")
          .populate("user");
        if (fallback) {
          // Backfill missing paymentReference if absent
          if (!fallback.paymentReference) {
            await Registration.findByIdAndUpdate(fallback._id, {
              paymentReference: reference,
            });
            logger.info("payment.backfill", {
              registrationId: fallback._id.toString(),
              reference,
            });
          }
          registration = fallback;
        }
      } catch (fallbackErr) {
        logger.warn("payment.fallback.lookup_failed", {
          error: fallbackErr.message,
          reference,
        });
      }
    }

    if (!registration) {
      logger.warn("payment.registration_not_found", { reference });
      return { success: false, error: "Registration not found" };
    }

    const wasPaid = registration.paymentStatus === "paid";
    const paymentEmailSent = !!registration.paymentEmailSent;
    const ticketAlready = !!registration.ticketSent;

    if (wasPaid && paymentEmailSent) {
      return {
        success: true,
        alreadyProcessed: true,
        ticketNumber: registration.ticketNumber,
        emailSent: true,
      };
    }

    // Validate amount vs discounted registration total (authoritative)
    if (paystackData?.amount) {
      const paidAmount = paystackData.amount / 100; // minor -> major
      const authoritativeTotal =
        registration.totalAmount || registration.event?.price;
      if (registration.paymentType === "partial") {
        if (paidAmount > authoritativeTotal) {
          logger.warn("payment.amount_exceeds_total", {
            total: authoritativeTotal,
            actual: paidAmount,
            reference,
          });
        }
      } else {
        if (paidAmount !== authoritativeTotal) {
          logger.warn("payment.amount_mismatch", {
            expected: authoritativeTotal,
            actual: paidAmount,
            reference,
          });
        }
      }
    }

    // Update payment status & amount
    const amountPaid = paystackData?.amount
      ? paystackData.amount / 100
      : registration.amountPaid;

    // Calculate remaining balance
    const newTotalPaid = (registration.amountPaid || 0) + amountPaid;
    const remainingBalance =
      (registration.totalAmount || registration.event?.price || 0) -
      newTotalPaid;
    const paymentStatus = remainingBalance <= 0 ? "paid" : "pending";

    await Registration.findByIdAndUpdate(registration._id, {
      paymentStatus,
      amountPaid: newTotalPaid,
      remainingBalance: Math.max(0, remainingBalance),
    });

    // Ensure ticket number exists
    let ticketNumber = registration.ticketNumber;
    if (!ticketNumber) {
      ticketNumber = `TICKET_${registration._id
        .toString()
        .slice(-8)
        .toUpperCase()}`;
      await Registration.findByIdAndUpdate(registration._id, { ticketNumber });
    }

    // Send email only if not already sent (by paymentEmailSent)
    let emailSent = false;
    if (!paymentEmailSent) {
      try {
        const emailRes = await sendPaymentConfirmation({
          email: registration.user.email,
          firstName: registration.user.firstName,
          lastName: registration.user.lastName,
          eventTitle: registration.event?.title,
          eventDate: registration.event?.date,
          location: registration.event?.location || "Salons Assured Offices",
          amount: amountPaid,
          registrationId: registration._id,
          ticketNumber,
          paymentType: registration.paymentType,
          totalAmount: registration.totalAmount || registration.event?.price,
          remainingBalance: Math.max(0, remainingBalance),
        });
        emailSent = !!emailRes?.success;
        if (!emailRes?.success) {
          logger.error("payment.email.send_failed", {
            error: emailRes?.error,
            reference,
            registrationId: registration._id.toString(),
          });
        }
      } catch (err) {
        logger.error("payment.email.exception", {
          error: err.message,
          stack: err.stack,
          reference,
          registrationId: registration._id.toString(),
        });
      }
    } else {
      emailSent = true;
    }

    // Mark ticket + email sent flags
    await Registration.findByIdAndUpdate(registration._id, {
      ticketSent: true,
      paymentEmailSent: true,
    });

    return { success: true, ticketNumber, emailSent };
  } catch (error) {
    logger.error("payment.process.error", {
      error: error.message,
      stack: error.stack,
      reference,
    });
    return { success: false, error: error.message };
  }
}
