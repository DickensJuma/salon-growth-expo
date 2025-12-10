"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { usePaystackPayment } from "@/hooks/usePaystackPayment";

interface PaymentFormProps {
  email: string;
  amount: number; // final payable (discounted)
  originalAmount?: number; // pre-discount (for display)
  discountPercent?: number; // applied discount percent
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  metadata?: Record<string, any>;
  className?: string;
}

export function PaymentForm({
  email,
  amount,
  originalAmount,
  discountPercent,
  onSuccess,
  onError,
  metadata = {},
  className,
}: PaymentFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();

  const { handlePayment, isLoading, error, isScriptLoaded } =
    usePaystackPayment({
      onSuccess: (reference: string) => {
        // Instead of navigating, just call the success callback
        console.log("Payment successful, reference:", reference);
        onSuccess?.();
      },
      onClose: () => {
        toast({
          title: "Payment Cancelled",
          description: "You can complete your payment later.",
          variant: "default",
        });
      },
      onError: (err: Error) => {
        toast({
          title: "Payment Error",
          description: err.message || "An error occurred during payment",
          variant: "destructive",
        });
        onError?.(err);
      },
    });

  const onPay = useCallback(() => {
    if (!name || !phone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    handlePayment(
      email,
      amount,
      { ...metadata, name, phone },
      {
        callbackUrl: `${window.location.origin}/payment/callback`,
        currency: "KES",
        channels: ["card", "bank", "mobile_money"],
      }
    );
  }, [email, amount, name, phone, metadata, handlePayment, toast]);

  if (!isScriptLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading payment system...</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+254 700 000000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="bg-muted p-4 rounded-lg space-y-2">
          {originalAmount && originalAmount > amount ? (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Original Price</span>
                <span className="line-through">
                  KES {originalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Discount{discountPercent ? ` (${discountPercent}%)` : ""}
                </span>
                <span className="text-green-600">
                  - KES {(originalAmount - amount).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t mt-2">
                <span className="font-medium">You Pay</span>
                <span className="text-lg font-bold">
                  KES {amount.toLocaleString()}
                </span>
              </div>
            </>
          ) : (
            <div className="flex justify-between items-center">
              <span className="font-medium">Amount</span>
              <span className="text-lg font-bold">
                KES {amount.toLocaleString()}
              </span>
            </div>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
            {error}
          </div>
        )}

        <Button
          type="button"
          onClick={onPay}
          disabled={isLoading || !isScriptLoaded}
          className="w-full mt-6 text-lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay KES ${amount.toLocaleString()}`
          )}
        </Button>
      </div>
    </div>
  );
}
