# Email Setup (Brevo / SMTP)

This project uses a provider-agnostic SMTP layer (currently Brevo) with:

- Centralized HTML templates: `backend/services/emailTemplates.js`
- Consolidated send helpers with retry: `backend/services/emailService.js`
- Environment-driven configuration with graceful fallbacks

## 1. Environment Variables

Add the following to your `.env` (server side / backend):

```
# Brevo (recommended)
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your_brevo_login@example.com
BREVO_SMTP_PASS=your_brevo_generated_smtp_key
BREVO_FROM="Salons Assured <noreply@yourdomain.com>"
MAIL_FROM="Salons Assured Elevate Summit <noreply@yourdomain.com>"

# Optional legacy / fallback names
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
```

Priority order (first non-empty wins):

1. `BREVO_*`
2. `SMTP_*`
3. Internal defaults (host: `smtp-relay.brevo.com`, from: `noreply@salonsassured.com`)

## 2. Files Overview

| File                                 | Purpose                                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------- |
| `backend/services/emailTemplates.js` | Pure functions that return HTML strings for each email type.                                   |
| `backend/services/emailService.js`   | Transport creation, retry logic, and exported send helpers.                                    |
| `src/lib/email/...` (frontend)       | Frontend-side abstraction (if SSR / Next API used). Backend now directly uses its own service. |

## 3. Adding a New Template

1. Create a new function in `emailTemplates.js` that accepts a data object and returns HTML.
2. Export it from that file.
3. In `emailService.js`, create a new `async function sendXyz(data)`:
   - Build `html` using the template.
   - Define a `subject` string.
   - Call `sendWithRetry({ from: FROM_ADDRESS, to: data.email, subject, html })`.
4. Use the new function wherever needed (e.g., after registration or payment).

## 4. Retry Logic

Implemented in `sendWithRetry`:

- Default attempts: 3
- Progressive delay: `delayMs * attemptIndex` (basic linear backoff)
- Logs each failed attempt

Customize by passing options: `sendWithRetry(mailOptions, { attempts: 5, delayMs: 1500 })` (extend function signature if needed).

## 5. Transport Caching

`getTransporter()` memoizes the Nodemailer transporter to avoid re-creating a new connection per email. If credentials change at runtime, restart the server.

## 6. Branding & Consistency

- Footer and structural styles live inside template builders.
- Update summit branding (dates, names, styling tokens) centrally in templates.
- From address is resolved once via `FROM_ADDRESS` constant.

## 7. Local Development Testing

You can test without sending real emails by using an Ethereal test account:

```js
import nodemailer from "nodemailer";
const testAccount = await nodemailer.createTestAccount();
// Override env vars temporarily:
process.env.BREVO_SMTP_HOST = "smtp.ethereal.email";
process.env.BREVO_SMTP_PORT = "587";
process.env.BREVO_SMTP_USER = testAccount.user;
process.env.BREVO_SMTP_PASS = testAccount.pass;
```

Then send any email and inspect the preview URL logged by Nodemailer.

## 8. Common Issues

| Symptom                            | Likely Cause           | Fix                                                 |
| ---------------------------------- | ---------------------- | --------------------------------------------------- |
| `Missing SMTP credentials` warning | Env vars not loaded    | Ensure `.env` is in backend root and restart server |
| Connection timeout                 | Firewall / wrong port  | Use port 587 (TLS STARTTLS) or 465 (secure)         |
| Auth failed                        | Bad API key / password | Regenerate Brevo SMTP key                           |
| Emails in spam                     | Missing SPF/DKIM/DMARC | Configure DNS records for sending domain            |

## 9. Production Recommendations

- Set up SPF & DKIM for the domain you use in `MAIL_FROM`.
- Add DMARC policy (monitor initially using `p=none`).
- Rotate SMTP keys periodically.
- Log `messageId` and user/email meta for traceability (extend send helpers to persist logs if needed).
- Consider rate limiting or queueing (BullMQ / RabbitMQ) if volume increases.

## 10. Extending to Another Provider

Abstract the provider selection by:

1. Creating a new file e.g. `emailProviderSendgrid.js` that exports a `createTransporter()` or direct `send()` function.
2. Add a simple switch (env variable like `MAIL_PROVIDER=brevo|sendgrid|ses`).
3. Map provider-specific config resolution in a new resolver.

## 11. Security Notes

- Never commit real API keys.
- Use `.env.local` in development, secrets manager in production (Vault, AWS SSM, Doppler, etc.).
- Validate all dynamic fields before interpolating into HTML.

## 12. Trigger Points in Code

- Registration: `POST /api/register` → sends registration confirmation.
- Payment success: Paystack webhook or manual verify endpoint → sends payment confirmation & ticket.
- (Optional) Scheduled reminders: Call `sendPaymentReminder` for pending registrations via a cron job.

## 13. Future Enhancements

- Add text-only alternative (`text:`) for better deliverability.
- Add open/click tracking with Brevo API (not SMTP-only).
- Inline CSS with a premailer step if design complexity grows.
- Queue + worker process for non-blocking email dispatch at scale.

---

Maintainer Notes: Keep HTML lean; avoid heavy layout tables unless necessary. For significant visual upgrades, consider a templating engine (MJML → HTML build step) but keep logic separated from transport.
