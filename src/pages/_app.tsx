// src/pages/_app.tsx
"use client";

import { PaystackProvider } from "@/contexts/PaystackProvider";
import { useRouter } from "next/router";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { useEffect, useState } from "react";
import "@/styles/globals.css";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  console.log("MyApp rendering");

  // Only render the provider after mounting to ensure window is available
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handlePaystackSuccess = (reference: string) => {
    console.log("Payment successful, reference:", reference);
    // You can add any success logic here
  };

  const handlePaystackClose = () => {
    console.log("Payment modal closed");
    // You can add any close logic here
  };

  const handlePaystackError = (error: any) => {
    console.error("Paystack error:", error);
    // You can add any error handling logic here
  };

  // Get the Paystack key safely after mounting
  const paystackPublicKey =
    typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || ""
      : "";

  // Don't render until we're on the client side
  if (!isMounted) {
    return null;
  }

  // If Paystack key is not available, show an error message
  if (!paystackPublicKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>
            Error: Paystack is not properly configured. Please check your
            environment variables.
          </p>
          <p>
            Make sure NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is set in your .env.local
            file.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PaystackProvider
      publicKey={paystackPublicKey}
      onSuccess={handlePaystackSuccess}
      onClose={handlePaystackClose}
      onError={handlePaystackError}
    >
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Component {...pageProps} />
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </ThemeProvider>
    </PaystackProvider>
  );
}

export default MyApp;
