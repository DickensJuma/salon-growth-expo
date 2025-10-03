// backend/services/emailTemplates.js
// Centralized HTML template builders for transactional emails.
// Keep styling simple (table-less) and mobile-friendly.

const baseStyles = {
  wrapper:
    "font-family: Arial, sans-serif; max-width:600px; margin:0 auto; padding:20px; background-color:#f9f9f9;",
  card: "background:#ffffff; padding:32px; border-radius:12px; box-shadow:0 4px 16px rgba(0,0,0,0.06);",
  h1: "margin:0 0 24px; font-size:24px; line-height:1.25; letter-spacing:-0.5px; text-align:center;",
};

const footer = () => `
  <hr style="margin:40px 0 24px; border:none; border-top:1px solid #eee;" />
  <p style="font-size:12px; color:#666; text-align:center; line-height:1.4;">
    Salons Assured Elevate Summit • Nairobi, Kenya<br/>
    This is an automated email — please do not reply.<br/>
    © ${new Date().getFullYear()} Salons Assured. All rights reserved.
  </p>
`;

function registrationConfirmationTemplate({
  firstName,
  lastName,
  eventTitle,
  eventDate,
  amount,
  registrationId,
}) {
  return `
  <div style="${baseStyles.wrapper}">
    <div style="${baseStyles.card}">
      <h1 style="${baseStyles.h1}">Registration Received ✔️</h1>
      <p style="font-size:15px;">Hi <strong>${firstName} ${lastName}</strong>,</p>
      <p style="font-size:15px; line-height:1.5;">Thank you for registering for <strong>${eventTitle}</strong>. Your spot is reserved.</p>
      <div style="background:#f0f7ff; border:1px solid #d6e8ff; padding:16px 20px; border-radius:8px; margin:24px 0;">
        <h2 style="margin:0 0 12px; font-size:16px; color:#0b5cab;">Event Details</h2>
        <p style="margin:4px 0; font-size:14px;"><strong>Date:</strong> ${new Date(
          eventDate
        ).toLocaleDateString()}</p>
        <p style="margin:4px 0; font-size:14px;"><strong>Amount:</strong> KES ${amount}</p>
        <p style="margin:4px 0; font-size:14px;"><strong>Registration ID:</strong> ${registrationId}</p>
      </div>
      <p style="font-size:14px; line-height:1.5;">Next: Complete payment to unlock your summit pass and ticket.</p>
      ${footer()}
    </div>
  </div>`;
}

function paymentConfirmationTemplate({
  firstName,
  lastName,
  eventTitle,
  eventDate,
  amount,
  registrationId,
  ticketNumber,
}) {
  return `
  <div style="${baseStyles.wrapper}">
    <div style="${baseStyles.card}">
      <h1 style="${baseStyles.h1}; color:#138a36;">Payment Confirmed 🎉</h1>
      <p style="font-size:15px;">Hi <strong>${firstName} ${lastName}</strong>,</p>
      <p style="font-size:15px; line-height:1.5;">Your payment for <strong>${eventTitle}</strong> is successful. You're officially in!</p>
      <div style="background:#e6f9ed; border:1px solid #c3efd5; padding:16px 20px; border-radius:8px; margin:24px 0;">
        <h2 style="margin:0 0 12px; font-size:16px; color:#0f6b28;">Ticket & Payment</h2>
        <p style="margin:4px 0; font-size:14px;"><strong>Amount Paid:</strong> KES ${amount}</p>
        <p style="margin:4px 0; font-size:14px;"><strong>Ticket Number:</strong> ${ticketNumber}</p>
        <p style="margin:4px 0; font-size:14px;"><strong>Registration ID:</strong> ${registrationId}</p>
        <p style="margin:4px 0; font-size:14px;"><strong>Event Date:</strong> ${new Date(
          eventDate
        ).toLocaleDateString()}</p>
      </div>
      <div style="background:#fff; border:2px dashed #138a36; padding:20px; border-radius:10px; text-align:center; margin:16px 0;">
        <p style="margin:0 0 8px; font-size:13px; letter-spacing:1px; color:#138a36; text-transform:uppercase;">Your Summit Ticket</p>
        <p style="margin:0; font-size:22px; font-weight:600; color:#138a36;">${ticketNumber}</p>
      </div>
      <p style="font-size:13px; color:#555;">Bring this ticket (digital or printed) for check‑in.</p>
      ${footer()}
    </div>
  </div>`;
}

function paymentReminderTemplate({
  firstName,
  lastName,
  eventTitle,
  registrationId,
}) {
  return `
  <div style="${baseStyles.wrapper}">
    <div style="${baseStyles.card}">
      <h1 style="${baseStyles.h1}; color:#c27803;">Payment Pending ⏳</h1>
      <p style="font-size:15px;">Hi <strong>${firstName} ${lastName}</strong>,</p>
      <p style="font-size:15px; line-height:1.5;">This is a friendly reminder that your registration for <strong>${eventTitle}</strong> is awaiting payment.</p>
      <div style="background:#fff8e6; border:1px solid #f3dea7; padding:16px 20px; border-radius:8px; margin:24px 0;">
        <p style="margin:4px 0; font-size:14px;"><strong>Registration ID:</strong> ${registrationId}</p>
        <p style="margin:4px 0; font-size:14px;">Secure your seat now to avoid losing your slot.</p>
      </div>
      <p style="font-size:14px;">If you've already paid, please ignore this email.</p>
      ${footer()}
    </div>
  </div>`;
}

export {
  registrationConfirmationTemplate,
  paymentConfirmationTemplate,
  paymentReminderTemplate,
};
