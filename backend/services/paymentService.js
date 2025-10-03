// services/paymentService.js
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

// Initialize payment with Paystack
async function initializePayment(paymentData) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY environment variable is required");
  }
  try {
    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.message || "Payment initialization failed",
      };
    }
    return { success: true, data: data.data };
  } catch (error) {
    console.error("[payment:init] Error initializing payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Verify payment (no side effects)
async function verifyPayment(reference) {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error("PAYSTACK_SECRET_KEY environment variable is required");
  }
  try {
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference
      )}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await response.json();
    if (!data.status || data.data?.status !== "success") {
      return {
        success: false,
        error: data.message || "Payment verification failed",
        raw: data,
      };
    }
    return { success: true, data: data.data, raw: data };
  } catch (error) {
    console.error("[payment:verify] Error verifying payment:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      raw: null,
    };
  }
}

export { initializePayment, verifyPayment };
