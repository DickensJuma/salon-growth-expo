# Partial Payment Feature

## Overview

Businesses can now pay in installments for event registration. This feature allows registrants to make a partial payment upfront and complete the balance later.

## Features

### 1. **Frontend (Registration Form)**

- **Payment Type Selection**: Radio buttons to choose between "Full Payment" or "Partial Payment"
- **Partial Amount Input**: When partial payment is selected, users can enter the amount they want to pay now
- **Real-time Balance Calculation**: Shows remaining balance as user enters partial amount
- **Validation**: Ensures partial amount doesn't exceed total event price

### 2. **Backend (Database Model)**

Updated `Registration` model with new fields:

- `totalAmount`: Total event registration cost (from event.price)
- `amountPaid`: Cumulative amount paid (supports multiple payments)
- `remainingBalance`: Outstanding amount to be paid
- `paymentType`: Either "full" or "partial"

### 3. **Payment Processing**

- **Payment Initialization**: Accepts payment type and processes the specified amount
- **Payment Verification**:
  - Calculates cumulative payments
  - Updates remaining balance
  - Marks status as "paid" only when balance is zero
  - Keeps status as "pending" if balance remains

### 4. **Email Notifications**

Enhanced payment confirmation emails include:

- **For Full Payments**: Standard confirmation with total amount
- **For Partial Payments**:
  - Shows total amount
  - Shows amount paid
  - Highlights remaining balance with warning banner
  - Includes instructions to contact for balance payment

### 5. **Ticket Details**

Ticket attachments (PDF and TXT) now show:

- Total Amount
- Amount Paid
- Remaining Balance (if applicable)
- Partial payment indicator

## How It Works

### User Flow

1. User fills registration form
2. Proceeds to payment page
3. Selects payment type:
   - **Full Payment**: Pays complete event price
   - **Partial Payment**: Enters custom amount (e.g., 50% upfront)
4. Completes payment via Paystack
5. Receives confirmation email with:
   - Payment receipt
   - Ticket (with partial payment notice if applicable)
   - Balance reminder (if applicable)

### Example Scenarios

#### Scenario 1: Full Payment (KES 40,000)

```
Payment Type: Full
Amount Paid: KES 40,000
Remaining Balance: KES 0
Status: PAID ✅
```

#### Scenario 2: Partial Payment (KES 20,000 upfront)

```
Payment Type: Partial
Total Amount: KES 40,000
Amount Paid: KES 20,000
Remaining Balance: KES 20,000
Status: PENDING ⏳
```

#### Scenario 3: Second Partial Payment (KES 15,000 more)

```
Payment Type: Partial
Total Amount: KES 40,000
Amount Paid: KES 35,000 (cumulative)
Remaining Balance: KES 5,000
Status: PENDING ⏳
```

#### Scenario 4: Final Payment (KES 5,000 balance)

```
Payment Type: Partial
Total Amount: KES 40,000
Amount Paid: KES 40,000 (cumulative)
Remaining Balance: KES 0
Status: PAID ✅
```

## Database Schema Changes

```javascript
{
  totalAmount: Number,      // NEW: Total registration cost
  amountPaid: Number,       // UPDATED: Now cumulative
  remainingBalance: Number, // NEW: Outstanding balance
  paymentType: String,      // NEW: "full" | "partial"
  paymentStatus: String,    // EXISTING: "pending" | "paid" | "failed" | "refunded"
}
```

## API Changes

### Payment Initialization (`POST /api/initialize-payment`)

**Request Body:**

```json
{
  "email": "user@example.com",
  "amount": 20000,
  "registrationId": "...",
  "metadata": {
    "paymentType": "partial",
    "totalAmount": 40000,
    "partialAmount": 20000
  }
}
```

### Payment Verification (`POST /api/verify-payment`)

**Response:**

```json
{
  "success": true,
  "ticketNumber": "TICKET_ABC123",
  "paymentStatus": "pending",
  "amountPaid": 20000,
  "remainingBalance": 20000,
  "emailSent": true
}
```

## Email Templates

### Full Payment Email

- Subject: "Payment Confirmed 🎉"
- Shows: Total amount paid, ticket number
- Status: "You're officially in!"

### Partial Payment Email

- Subject: "Partial Payment Received 🎉"
- Shows: Total amount, amount paid, remaining balance
- Warning banner: "Balance Pending - Please complete remaining payment"
- Status: "Payment received, balance pending"

## Testing

### Test Partial Payment

1. Register for event (KES 40,000)
2. Select "Partial Payment"
3. Enter amount: KES 1 (for testing)
4. Complete payment
5. Check email for partial payment confirmation
6. Verify database shows:
   - totalAmount: 40000
   - amountPaid: 1
   - remainingBalance: 39999
   - paymentType: "partial"
   - paymentStatus: "pending"

### Test Full Payment

1. Register for event (KES 40,000)
2. Select "Full Payment"
3. Complete payment
4. Check email for full payment confirmation
5. Verify database shows:
   - totalAmount: 40000
   - amountPaid: 40000
   - remainingBalance: 0
   - paymentType: "full"
   - paymentStatus: "paid"

## Future Enhancements

- [ ] Dashboard to track partial payments per registration
- [ ] Automated balance reminders (e.g., 7 days before event)
- [ ] Payment plan options (e.g., 3 installments)
- [ ] Payment history timeline
- [ ] Refund handling for partial payments
- [ ] Grace period for completing balance

## Notes

- Tickets are issued immediately for both full and partial payments
- Partial payments are valid; users can attend with pending balance (business decision)
- Balance payment can be arranged via direct contact
- All payment types go through Paystack security
- Multiple partial payments are supported (cumulative tracking)
