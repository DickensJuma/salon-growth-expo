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

    // Validate amount vs event price if available
    if (
      registration.event &&
      registration.event.price &&
      paystackData?.amount
    ) {
      const paidAmount = paystackData.amount / 100; // kobo -> KES
      if (paidAmount !== registration.event.price) {
        logger.warn("payment.amount_mismatch", {
          expected: registration.event.price,
          actual: paidAmount,
          reference,
        });
      }
    }

    // Update payment status & amount
    const amountPaid = paystackData?.amount
      ? paystackData.amount / 100
      : registration.amountPaid;
    await Registration.findByIdAndUpdate(registration._id, {
      paymentStatus: "paid",
      amountPaid,
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
          location: registration.event?.location || "Glee Hotel, Nairobi",
          amount: amountPaid,
          registrationId: registration._id,
          ticketNumber,
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
