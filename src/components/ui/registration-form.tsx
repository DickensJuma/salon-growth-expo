"use client";

import React, { useState, FC, useCallback, useEffect } from "react";
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
  price: number;
  location: string;
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
  const [activeTab, setActiveTab] = useState<"details" | "payment" | "success">("details");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<'standard' | 'premium' | 'vip'>('standard');
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
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
      try {
        const response = await fetch('/api/events');
        const data = await response.json();

        if (data.success && data.events.length > 0) {
          setEvents(data.events);
          setSelectedEventId(data.events[0].id); // Select first event by default
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast({
          title: "Error",
          description: "Failed to load available events.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingEvents(false);
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
    const required = ["businessName", "ownerName", "phone", "email", "location"];
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
        firstName: formData.ownerName.split(' ')[0] || formData.ownerName,
        lastName: formData.ownerName.split(' ').slice(1).join(' ') || 'Unknown',
        email: formData.email,
        password: 'temp_' + Date.now(), // Temporary password, will be updated in production
        phone: formData.phone,
        businessName: formData.businessName,
        ownerName: formData.ownerName,
        location: formData.location,
        ticketType: selectedTicket,
        amount: TICKET_TYPES[selectedTicket],
        eventId: selectedEventId, // Include the selected event ID
      };
  
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseText = await response.text();
      let responseData: any;
      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(`Server returned an invalid response (${response.status})`);
      }

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to process registration");
      }
      setRegistrationId(responseData.registrationId);
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
            Thank you for registering for the Salon Growth Summit!
          </p>
          <p>
            We've sent a confirmation email to {formData.email}.
          </p>
          <p>We look forward to seeing you at the event!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Register for the Business Summit</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab}   onValueChange={(val) => setActiveTab(val as "details" | "payment" | "success")} className="w-full">
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
                          {event.title} - {new Date(event.date).toLocaleDateString()} - KES {event.price}
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
                    {events[0]?.title} - {events[0]?.date ? new Date(events[0].date).toLocaleDateString() : ''} - KES {events[0]?.price || 0}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <Input
                    id="businessName"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    required
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
                  <Label htmlFor="email">Email *</Label>
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
                  <Label htmlFor="location">Business Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
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
                <h3 className="text-lg font-medium">Complete Your Registration</h3>
                <p className="text-muted-foreground">
                  Please enter your payment details to secure your spot.
                </p>
                <PaymentForm
                  email={formData.email}
                  amount={TICKET_TYPES[selectedTicket]} // in kobo
                  onSuccess={handlePaymentSuccess}
                  metadata={{
                    registrationId,
                    businessName: formData.businessName,
                    ownerName: formData.ownerName,
                    phone: formData.phone,
                    email: formData.email,
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setActiveTab("details")}
                >
                  Back to Details
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-muted/50 p-4 border-t">
        <p className="text-sm text-muted-foreground text-center w-full">
          Secure payment processing by Paystack. Your payment information is encrypted.
        </p>
      </CardFooter>
    </Card>
  );
};
