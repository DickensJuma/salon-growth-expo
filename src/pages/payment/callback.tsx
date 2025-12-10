import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle, AlertCircle } from "lucide-react";

type PaymentStatus = "verifying" | "success" | "error" | "cancelled";

const PaymentCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>("verifying");
  const [message, setMessage] = useState("Verifying your payment...");
  const [reference, setReference] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("reference");
    const statusParam = params.get("status");
    const txRef = params.get("tx_ref");

    if (!ref && !txRef) {
      setStatus("error");
      setMessage(
        "No payment reference found. Please contact support if you were charged."
      );
      return;
    }
    setReference(ref || txRef || null);

    if (statusParam === "cancelled") {
      setStatus("cancelled");
      setMessage(
        "Payment was cancelled. You can try again if you wish to complete your purchase."
      );
      return;
    }

    // Call backend API to verify payment
    const verifyPayment = async (paymentRef: string) => {
      setStatus("verifying");
      setMessage("Verifying your payment...");
      try {
        const response = await fetch("https://api.salons-assured.com/api/payments/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: paymentRef }),
        });
        console.log("Payment verifyPayment response:", response);
    
        const result = await response.json();
        if (response.ok) {
          setStatus("success");
          setMessage(
            "Payment verified successfully! Thank you for your purchase."
          );
          sessionStorage.removeItem("paymentReturnUrl");
        } else {
          setStatus("error");
          setMessage(
            result.message ||
              "Payment verification failed. Please contact support if you were charged."
          );
        }
      } catch (err) {
        setStatus("error");
        setMessage(
          "An error occurred while verifying your payment. Please contact support if you were charged."
        );
      }
    };

    if (ref || txRef) {
      verifyPayment(ref || txRef);
    }
  }, [location.search]);

  const StatusIcon = () => {
    switch (status) {
      case "verifying":
        return <Loader2 className="h-12 w-12 animate-spin text-blue-500" />;
      case "success":
        return <CheckCircle className="h-12 w-12 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="h-12 w-12 text-yellow-500" />;
      case "error":
        return <XCircle className="h-12 w-12 text-red-500" />;
      default:
        return null;
    }
  };

  const renderStatusContent = () => {
    switch (status) {
      case "success":
        return (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-green-800">Your payment was successful!</p>
              {reference && (
                <p className="text-sm text-green-700 mt-2">
                  Reference: <span className="font-mono">{reference}</span>
                </p>
              )}
            </div>
            <p className="text-gray-600">
              We've sent a confirmation email with your purchase details.
            </p>
          </div>
        );
      case "cancelled":
        return (
          <div className="space-y-4">
            <p className="text-gray-600">
              You cancelled the payment. No charges were made to your account.
            </p>
            <p className="text-sm text-gray-500">
              If you changed your mind, you can try the payment again.
            </p>
          </div>
        );
      case "error":
        return (
          <div className="space-y-4">
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500">
              If you were charged, the amount will be refunded within 3-5
              business days.
            </p>
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <p className="text-gray-600">
              Please wait while we verify your payment.
            </p>
            <p className="text-sm text-gray-500">This may take a moment...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full space-y-6 text-center bg-white p-8 rounded-lg shadow-sm">
        <div className="flex justify-center">
          <StatusIcon />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {status === "verifying" && "Verifying Payment"}
          {status === "success" && "Payment Successful!"}
          {status === "cancelled" && "Payment Cancelled"}
          {status === "error" && "Payment Error"}
        </h1>
        <div className="pt-2">{renderStatusContent()}</div>
        <div className="pt-6 space-y-3">
          {status === "success" && (
            <Button onClick={() => navigate("/")} className="w-full">
              Back to Home
            </Button>
          )}
          {(status === "error" || status === "cancelled") && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  const returnUrl =
                    sessionStorage.getItem("paymentReturnUrl") || "/";
                  navigate(returnUrl);
                }}
                className="w-full"
              >
                Try Again
              </Button>
              <Button
                variant="ghost"
                onClick={() => navigate("/contact")}
                className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Contact Support
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCallback;
