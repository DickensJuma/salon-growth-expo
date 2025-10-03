# Ticket Verification API

This document describes the ticket verification feature, QR code payload, and endpoint usage.

## Overview

After a successful payment, the system generates a unique ticket number (format: `TICKET_<LAST8OFID>`) and emails a PDF ticket containing a QR code. The QR encodes a JSON payload with essential metadata.

## QR Code Payload Structure

```
{
  "v": 1,                 // schema version
  "t": "<ticketNumber>",  // ticket number
  "r": "<registrationId>",// registration ID (Mongo ObjectId)
  "e": "<eventId>",       // event ID (if available)
  "ts": 1700000000000      // issued timestamp (ms epoch)
}
```

Clients scanning the QR can either:

1. Decode locally and call the verification endpoint with `t` (ticket number), OR
2. (Future) Use a signed payload for offline validation.

## Verification Endpoint

`GET /api/tickets/verify/:ticketNumber`

### Response (Valid Ticket)

```
200 OK
{
  "success": true,
  "valid": true,
  "data": {
    "ticketNumber": "TICKET_AB12CD34",
    "registrationId": "...",
    "event": {
      "id": "...",
      "title": "Elevate Summit 2025",
      "date": "2025-01-15T08:00:00.000Z",
      "location": "Nairobi"
    },
    "attendee": {
      "id": "...",
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@example.com"
    },
    "paymentStatus": "paid",
    "paymentEmailSent": true,
    "ticketSent": true,
    "amountPaid": 5000,
    "createdAt": "2025-01-01T12:00:00.000Z"
  }
}
```

### Response (Not Found)

```
404 Not Found
{ "success": true, "valid": false, "reason": "not_found" }
```

### Response (Unpaid / Invalid Status)

```
200 OK
{ "success": true, "valid": false, "reason": "unpaid" }
```

### Response (Server Error)

```
500 Internal Server Error
{ "success": false, "valid": false, "reason": "error", "error": "Details" }
```

## Validation Rules

- Ticket must exist.
- Registration `paymentStatus` must be `paid`.
- Additional business rules (expiration, revocation) can be layered later.

## Logging

Verification attempts are logged with structured events:

- `ticket.verify.not_found`
- `ticket.verify.error`

Extend logging for successful scans if needed (privacy considerations may apply).

## Future Enhancements

- Signed QR payload (HMAC) to reduce server round-trips.
- Rate limiting on verification endpoint.
- Revocation list / manual invalidation.
- Scan session telemetry & analytics.

## Testing Tips

1. Complete a full payment flow to receive a ticket.
2. Extract the `ticketNumber` from the email or PDF filename.
3. Call the endpoint: `GET /api/tickets/verify/TICKET_XXXXXX`.
4. Simulate unpaid state by creating a registration without processing payment and verifying its ticket.

---

For issues or suggestions, update this doc and open a task in the backlog.
