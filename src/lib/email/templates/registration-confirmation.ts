export function registrationConfirmationTemplate(params: {
    name?: string;
    amount?: string;
}) {
    return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#222;line-height:1.5">
    <h2 style="color:#d72660;margin:0 0 16px">Registration Confirmed ✅</h2>
    <p>Hello ${params.name || 'Participant'},</p>
    <p>Thank you for registering for the <strong>Salons Assured Elevate Summit</strong>.</p>
    <p><strong>Dates:</strong> 17–18 Nov 2025<br/>
       <strong>Venue:</strong> Glee Hotel, Nairobi<br/>
       ${params.amount ? `<strong>Amount:</strong> ${params.amount}<br/>` : ''}</p>
    <p>We'll share logistics and preparation material as the summit approaches.</p>
    <p>If you have any questions reply to this email.</p>
    <p style="margin-top:32px;font-size:12px;opacity:.65">Salon Assured Kenya • Automated Notification</p>
  </div>
  `;
}
