# Paystack Payment Integration

This document outlines how to integrate Paystack payments into the Salon Growth Summit application.

## Setup

1. **Environment Variables**
   Create a `.env.local` file in your project root with the following variables:

   ```bash
   # Paystack API Keys
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_public_key_here
   PAYSTACK_SECRET_KEY=your_secret_key_here

   # Base URL for callbacks
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

2. **Install Dependencies**
   ```bash
   npm install @paystack/paystack-sdk
   # or
   yarn add @paystack/paystack-sdk
   ```

## Components

### 1. PaymentButton

A reusable button component that initializes Paystack payments.

```tsx
import { PaymentButton } from "@/components/ui/payment-button";

function CheckoutPage() {
  const handleSuccess = (reference: string) => {
    console.log("Payment successful!", reference);
    // Handle successful payment (e.g., redirect to success page)
  };

  const handleError = (error: string) => {
    console.error("Payment error:", error);
    // Handle payment error
  };

  return (
    <PaymentButton
      email="customer@example.com"
      amount={1} // Amount in kobo (5000 = ₦50.00)
      onSuccess={handleSuccess}
      onError={handleError}
      metadata={{
        order_id: "ORDER_123",
        custom_fields: [
          {
            display_name: "Event",
            variable_name: "event",
            value: "Salon Growth Summit 2023",
          },
        ],
      }}
      className="w-full"
    >
      Pay ₦50,000.00
    </PaymentButton>
  );
}
```

### 2. Payment Callback Page

Handles the callback from Paystack after payment:

```tsx
// pages/payment/callback.tsx
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCallback() {
  const searchParams = useSearchParams();

  // ... implementation ...

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Payment status UI */}
    </div>
  );
}
```

## API Endpoints

### 1. Verify Payment

`POST /api/paystack/verify`

Verifies a payment with Paystack using a reference.

**Request Body:**

```json
{
  "reference": "txn_1234567890"
}
```

**Response:**

```json
{
  "status": true,
  "message": "Payment verified successfully",
  "data": {
    "id": 1234567,
    "status": "success",
    "reference": "txn_1234567890",
    "amount": 500000,
    "currency": "NGN",
    "metadata": {}
  }
}
```

### 2. Confirm Payment

`POST /api/payments/confirm`

Saves payment details to the database after successful verification.

**Request Body:**

```json
{
  "reference": "txn_1234567890",
  "amount": 500000,
  "currency": "KES",
  "status": "success",
  "paymentMethod": "card",
  "paidAt": "2023-10-01T12:00:00Z",
  "metadata": {
    "order_id": "ORDER_123"
  }
}
```

## Hooks

### usePaystackPayment

A custom hook for handling Paystack payments.

```tsx
import { usePaystackPayment } from "@/hooks/usePaystackPayment";

function CheckoutForm() {
  const { initializePayment, verifyPayment, isLoading, error } =
    usePaystackPayment({
      onSuccess: (reference) => {
        console.log("Payment successful!", reference);
      },
      onError: (error) => {
        console.error("Payment error:", error);
      },
    });

  const handleSubmit = async () => {
    try {
      await initializePayment(
        "customer@example.com",
        5000, // kes 50.00
        { order_id: "ORDER_123" },
        {
          currency: "KES",
          channels: ["card", "bank"],
          callbackUrl: `${window.location.origin}/payment/callback`,
        }
      );
    } catch (error) {
      console.error("Error initializing payment:", error);
    }
  };

  return (
    <button onClick={handleSubmit} disabled={isLoading}>
      {isLoading ? "Processing..." : "Pay Now"}
    </button>
  );
}
```

## Testing

### Test Cards

Use these test card numbers for testing:

- **Card Number:** 4084 0838 3084 0309
- **Expiry:** Any future date
- **CVV:** 408
- **OTP:** 12345
- **PIN:** 1234
- **Bank:** Test Bank

### Test Webhooks

You can test webhooks using the Paystack dashboard or the following test events:

- `charge.success` - Successful payment
- `charge.failed` - Failed payment
- `transfer.success` - Successful transfer

## Security Considerations

1. **API Keys**

   - Never expose your secret key in client-side code
   - Use environment variables for sensitive data
   - Rotate API keys regularly

2. **Webhooks**

   - Verify webhook signatures
   - Implement idempotency keys to prevent duplicate processing
   - Log all webhook events for auditing

3. **PCI Compliance**
   - Never store full card details
   - Use Paystack.js for secure card collection
   - Comply with PCI DSS requirements

## Troubleshooting

### Common Issues

1. **"Invalid public key" error**

   - Verify your public key in `.env.local`
   - Ensure it starts with `pk_`
   - Check for typos or extra spaces

2. **Payment not verifying**

   - Check the reference in the Paystack dashboard
   - Verify your webhook URL is correct
   - Ensure your server can make outbound HTTPS requests

3. **CORS issues**
   - Make sure your API routes are properly configured
   - Check the `Access-Control-Allow-Origin` headers
   - Test with Postman or curl to isolate the issue

## Support

For additional help, contact:

- **Paystack Support:** support@paystack.com
- **Developer Documentation:** https://paystack.com/docs
- **API Reference:** https://paystack.com/docs/api
