"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast"; // ✅ keep only one
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 as CheckCircle, CreditCard } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaymentForm } from "@/components/registration/payment-form";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  price: number; // original/base price
  location: string;
  originalPrice?: number;
  discountPercent?: number;
  discountedPrice?: number;
  discountAmount?: number;
  discountEffectiveAt?: string | null;
  discountSuppressed?: boolean;
}

interface FormData {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  location: string;
}

export const RegistrationForm = () => {
  const { toast } = useToast();

  // Form state
  const [activeTab, setActiveTab] = useState<"details" | "payment" | "success">(
    "details"
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [lockedDiscountPercent, setLockedDiscountPercent] = useState<
    number | null
  >(null);
  const [lockedOriginalAmount, setLockedOriginalAmount] = useState<
    number | null
  >(null);
  const [lockedDiscountedAmount, setLockedDiscountedAmount] = useState<
    number | null
  >(null);
  // Selected ticket retained for potential future tier pricing; currently single event pricing.
  const selectedTicket: "standard" | "premium" | "vip" = "standard"; // static ticket type for current event model
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const isLoadingEvents = false; // events fetch sets list; legacy state simplified
  const [paymentType, setPaymentType] = useState<"full" | "partial">("full");
  const [partialAmount, setPartialAmount] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    businessName: "",
    ownerName: "",
    phone: "",
    email: "",
    location: "",
  });

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      const base =
        (import.meta as any).env?.VITE_API_BASE_URL ||
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.VITE_API_BASE_URL ||
        "http://localhost:3000"; // backend default
      const url = `${base.replace(/\/$/, "")}/api/events`;

      let attempts = 0;
      const maxAttempts = 2;
      while (attempts < maxAttempts) {
        attempts++;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000);
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }
          const data = await response.json();
          if (data.success && data.events?.length > 0) {
            setEvents(data.events);
            setSelectedEventId(data.events[0].id);
          }
          return; // success exit
        } catch (err: any) {
          const isLast = attempts === maxAttempts;
          // Heuristic for CORS vs network
          if (isLast) {
            console.error("Failed to fetch events:", err);
            toast({
              title: "Load Error",
              description:
                err?.name === "AbortError"
                  ? "Fetching events timed out."
                  : "Failed to load events. If this is CORS-related, ensure the frontend origin is allowed on the API server.",
              variant: "destructive",
            });
          } else {
            await new Promise((r) => setTimeout(r, 500));
          }
        }
      }
    };
    fetchEvents();
  }, [toast]);

  // Ticket prices
  const TICKET_TYPES = {
    standard: 1, // KES 5,000
    premium: 100, // KES 10,000
    vip: 200, // KES 20,000
  } as const;

  // Handle input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate form
  const validateForm = () => {
    const required = ["ownerName", "phone", "email"];
    for (const field of required) {
      if (!formData[field as keyof FormData].trim()) {
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return false;

    const phoneRegex = /^(\+254|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) return false;

    return true;
  };

  // Continue to payment
  const handleContinue = async () => {
    if (!validateForm()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
      return;
    }

    // Event selection validation removed since we only have one event

    setIsSubmitting(true);

    const newRegistrationId = `REG-${Date.now()}`;
    setRegistrationId(newRegistrationId);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const requestData = {
        // Map frontend fields to backend expected fields
        firstName: formData.ownerName.split(" ")[0] || formData.ownerName,
        lastName: formData.ownerName.split(" ").slice(1).join(" ") || "Unknown",
        email: formData.email,
        password: "temp_" + Date.now(), // Temporary password, will be updated in production
        phone: formData.phone,
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        location: formData.location,
        ticketType: selectedTicket,
        amount: TICKET_TYPES[selectedTicket],
        eventId: selectedEventId, // Include the selected event ID
      };

      const response = await fetch(
        "https://api.salons-assured.com/api/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(requestData),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      const responseText = await response.text();
      let responseData: any;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(
          `Server returned an invalid response (${response.status})`
        );
      }

      if (!response.ok) {
        throw new Error(
          responseData.message || "Failed to process registration"
        );
      }
      setRegistrationId(responseData.registrationId);
      // Capture pricing lock from backend if present
      if (responseData?.pricing) {
        setLockedOriginalAmount(responseData.pricing.originalAmount ?? null);
        setLockedDiscountedAmount(responseData.pricing.totalAmount ?? null);
        setLockedDiscountPercent(
          responseData.pricing.appliedDiscountPercent ?? null
        );
      } else if (responseData?.event?.discountedPrice) {
        setLockedOriginalAmount(
          responseData.event.originalPrice ?? responseData.event.price ?? null
        );
        setLockedDiscountedAmount(responseData.event.discountedPrice ?? null);
        setLockedDiscountPercent(responseData.event.discountPercent ?? null);
      }
      setActiveTab("payment");

      toast({
        title: "Registration Successful!",
        description: "You can now proceed to payment.",
      });
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message || "Unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Payment success
  const handlePaymentSuccess = useCallback(() => {
    setIsSubmitted(true);
    setActiveTab("success");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    toast({
      title: "Payment Successful!",
      description: "A confirmation email has been sent to you.",
    });
  }, [toast]);

  // After submission success screen
  if (isSubmitted) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center space-y-6">
          <div className="flex justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <p className="text-lg">
            Thank you for registering for the Managers Training - Operational Excellence 2026!
          </p>
          <p>We've sent a confirmation email to {formData.email}.</p>
          <p>We look forward to seeing you at the event!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register for Managers Training</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(val) =>
            setActiveTab(val as "details" | "payment" | "success")
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Registration Details</TabsTrigger>
            <TabsTrigger value="payment" disabled={activeTab !== "payment"}>
              Payment
            </TabsTrigger>
          </TabsList>

          {/* Registration Details */}
          <TabsContent value="details" className="pt-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleContinue();
              }}
              className="space-y-6"
            >
              {/* Event Selection - Hidden for now since we only have one event */}
              {events.length > 1 && (
                <div className="space-y-2">
                  <Label htmlFor="event">Select Event *</Label>
                  {isLoadingEvents ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Loading events...</span>
                    </div>
                  ) : events.length > 0 ? (
                    <select
                      id="event"
                      aria-label="Select Event"
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full p-2 border rounded-md"
                      required
                    >
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.title} - {event.title} -{" "}
                          {new Date(event.date).toLocaleDateString()} -{" "}
                          {(event.discountPercent && event.discountPercent > 0) ||
                          (event.discountedPrice != null && event.discountedPrice < event.price) ? (
                            <>
                              <span className="line-through text-muted-foreground mr-1">
                                KES {event.price}
                              </span>
                              <span className="text-green-600 font-medium">
                                KES {event.discountedPrice ?? event.price}
                              </span>
                            </>
                          ) : (
                            <>KES {event.price}</>
                          )}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-red-500">No events available</p>
                  )}
                </div>
              )}

              {/* Show selected event info if only one event */}
              {events.length === 1 && !isLoadingEvents && (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900">Selected Event</h3>
                  <p className="text-blue-700">
                    <span>
                      {events[0]?.title} -{" "}
                      {events[0]?.date
                        ? new Date(events[0].date).toLocaleDateString()
                        : ""}{" "}
                      -
                    </span>
                    {((events[0]?.discountPercent && events[0].discountPercent > 0) ||
                      (events[0]?.discountedPrice != null &&
                        events[0].discountedPrice < events[0].price)) &&
                    !events[0]?.discountSuppressed ? (
                      <span>
                        <span className="line-through mr-1">
                          KES {events[0].price}
                        </span>
                        <span className="text-green-700 font-semibold">
                          KES {events[0].discountedPrice ?? events[0].price}
                        </span>
                        <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          -{events[0].discountPercent}%
                        </span>
                      </span>
                    ) : (
                      <span>KES {events[0]?.price || 0}</span>
                    )}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    placeholder="Business Name (optional)"
                    value={formData.businessName}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner's Full Name *</Label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Business Location</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Business Location (optional)"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* Payment */}
          <TabsContent value="payment" className="pt-6" id="payment-section">
            {registrationId && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium">
                  Complete Your Registration
                </h3>
                <p className="text-muted-foreground">
                  Please select your payment option and complete the payment.
                </p>

                {/* Payment Type Selection */}
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                  <Label className="text-base font-medium">
                    Payment Option
                  </Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        id="full-payment"
                        name="paymentType"
                        value="full"
                        checked={paymentType === "full"}
                        onChange={(e) =>
                          setPaymentType(e.target.value as "full" | "partial")
                        }
                        className="h-4 w-4"
                        aria-label="Full payment option"
                      />
                      <Label
                        htmlFor="full-payment"
                        className="cursor-pointer font-normal"
                      >
                        Full Payment - KES Full Payment -{" "}
                        {lockedDiscountPercent &&
                        lockedDiscountedAmount &&
                        lockedOriginalAmount &&
                        lockedDiscountPercent > 0 &&
                        // Suppress discount display if backend indicates suppression
                        !events.find((e) => e.id === selectedEventId)?.discountSuppressed ? (
                          <span>
                            <span className="line-through mr-1">
                              KES {lockedOriginalAmount.toLocaleString()}
                            </span>
                            <span className="text-green-600 font-medium">
                              KES {lockedDiscountedAmount.toLocaleString()}
                            </span>
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              -{lockedDiscountPercent}%
                            </span>
                          </span>
                        ) : (
                          <span>
                            KES{" "}
                            {(
                              events.find((e) => e.id === selectedEventId)
                                ?.price || TICKET_TYPES[selectedTicket]
                            ).toLocaleString()}
                          </span>
                        )}
                      </Label>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="partial-payment"
                          name="paymentType"
                          value="partial"
                          checked={paymentType === "partial"}
                          onChange={(e) =>
                            setPaymentType(e.target.value as "full" | "partial")
                          }
                          className="h-4 w-4"
                          aria-label="Partial payment option"
                        />
                        <Label
                          htmlFor="partial-payment"
                          className="cursor-pointer font-normal"
                        >
                          Partial Payment (Pay Part Now)
                        </Label>
                      </div>

                      {paymentType === "partial" && (
                        <div className="ml-7 space-y-2">
                          <Label htmlFor="partial-amount" className="text-sm">
                            Enter Amount to Pay Now (KES)
                          </Label>
                          <div className="space-y-1">
                            <Input
                              id="partial-amount"
                              type="number"
                              min="10000"
                              max={
                                events.find((e) => e.id === selectedEventId)
                                  ?.price || TICKET_TYPES[selectedTicket]
                              }
                              value={partialAmount}
                              onChange={(e) => {
                                const value = e.target.value;
                                const maxAmount =
                                  events.find((e) => e.id === selectedEventId)
                                    ?.price || TICKET_TYPES[selectedTicket];

                                // Allow any input but validate on submission
                                if (
                                  value === "" ||
                                  (Number(value) > 0 &&
                                    Number(value) <= maxAmount)
                                ) {
                                  setPartialAmount(value);
                                }
                              }}
                              placeholder="Minimum KES 10,000"
                              className="max-w-xs"
                            />
                            {partialAmount &&
                              Number(partialAmount) > 0 &&
                              Number(partialAmount) < 10000 && (
                                <p className="text-xs text-red-500 font-medium">
                                  ⚠️ Amount must be at least KES 10,000
                                </p>
                              )}
                            {partialAmount &&
                              Number(partialAmount) >= 10000 && (
                                <p className="text-xs text-green-600">
                                  ✓ Valid partial payment amount
                                </p>
                              )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Total:{" "}
                            {lockedDiscountedAmount &&
                            lockedOriginalAmount &&
                            lockedDiscountPercent &&
                            lockedDiscountPercent > 0 &&
                            !events.find((e) => e.id === selectedEventId)?.discountSuppressed ? (
                              <span>
                                <span className="line-through mr-1">
                                  KES {lockedOriginalAmount.toLocaleString()}
                                </span>
                                <span className="text-green-600 font-medium">
                                  KES {lockedDiscountedAmount.toLocaleString()}
                                </span>
                              </span>
                            ) : (
                              <span>
                                KES{" "}
                                {(
                                  events.find((e) => e.id === selectedEventId)
                                    ?.price || TICKET_TYPES[selectedTicket]
                                ).toLocaleString()}
                              </span>
                            )}
                            {partialAmount && Number(partialAmount) > 0 && (
                              <span className="block mt-1">
                                Remaining: KES{" "}
                                {(lockedDiscountedAmount ||
                                  events.find((e) => e.id === selectedEventId)
                                    ?.discountedPrice ||
                                  events.find((e) => e.id === selectedEventId)
                                    ?.price ||
                                  TICKET_TYPES[selectedTicket]) -
                                  Number(partialAmount)}
                              </span>
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {(() => {
                    // Validate amount before showing payment form
                    const basePrice =
                      lockedDiscountedAmount ||
                      events.find((e) => e.id === selectedEventId)
                        ?.discountedPrice ||
                      events.find((e) => e.id === selectedEventId)?.price ||
                      TICKET_TYPES[selectedTicket];
                    const paymentAmount =
                      paymentType === "partial" && partialAmount
                        ? Number(partialAmount)
                        : basePrice;

                    const isValidAmount =
                      paymentType === "full" ||
                      (paymentType === "partial" &&
                        Number(partialAmount) >= 10000);

                    if (!isValidAmount && paymentType === "partial") {
                      return (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800 font-medium">
                            Please enter a valid partial payment amount (minimum
                            KES 10,000) to proceed.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <PaymentForm
                        email={formData.email}
                        amount={paymentAmount}
                        originalAmount={lockedOriginalAmount || undefined}
                        discountPercent={lockedDiscountPercent || undefined}
                        onSuccess={handlePaymentSuccess}
                        onError={(error) => {
                          toast({
                            title: "Payment Error",
                            description:
                              error.message ||
                              "An error occurred during payment",
                            variant: "destructive",
                          });
                        }}
                        metadata={{
                          registrationId,
                          pricingLocked: true,
                          originalAmount: lockedOriginalAmount,
                          discountedAmount: lockedDiscountedAmount,
                          discountPercent: lockedDiscountPercent,
                        }}
                      />
                    );
                  })()}
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab("details")}
                  >
                    Back to Details
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 border-t">
        <p className="text-sm text-muted-foreground text-center w-full">
          Secure payment processing by Paystack. Your payment information is
          encrypted.
        </p>
      </CardFooter>
    </Card>
  );
};
