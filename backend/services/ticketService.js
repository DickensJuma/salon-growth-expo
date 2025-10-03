// backend/services/ticketService.js
import Registration from "../models/Registration.js";
import logger from "../utils/logger.js";

/**
 * Verify a ticket by its ticketNumber.
 * @param {string} ticketNumber
 * @returns {Promise<{success:boolean; valid:boolean; reason?:string; data?:object}>}
 */
export async function verifyTicket(ticketNumber) {
  if (!ticketNumber) {
    return { success: false, valid: false, reason: "ticketNumber required" };
  }
  try {
    const registration = await Registration.findOne({ ticketNumber })
      .populate("event")
      .populate("user");

    if (!registration) {
      logger.info("ticket.verify.not_found", { ticketNumber });
      return { success: true, valid: false, reason: "not_found" };
    }

    // Basic validity rules
    if (registration.paymentStatus !== "paid") {
      return { success: true, valid: false, reason: "unpaid" };
    }

    return {
      success: true,
      valid: true,
      data: {
        ticketNumber: registration.ticketNumber,
        registrationId: registration._id,
        event: registration.event
          ? {
              id: registration.event._id,
              title: registration.event.title,
              date: registration.event.date,
              location: registration.event.location,
            }
          : null,
        attendee: registration.user
          ? {
              id: registration.user._id,
              firstName: registration.user.firstName,
              lastName: registration.user.lastName,
              email: registration.user.email,
            }
          : null,
        paymentStatus: registration.paymentStatus,
        paymentEmailSent: registration.paymentEmailSent,
        ticketSent: registration.ticketSent,
        amountPaid: registration.amountPaid,
        createdAt: registration.registrationDate,
      },
    };
  } catch (error) {
    logger.error("ticket.verify.error", { ticketNumber, error: error.message });
    return {
      success: false,
      valid: false,
      reason: "error",
      error: error.message,
    };
  }
}
