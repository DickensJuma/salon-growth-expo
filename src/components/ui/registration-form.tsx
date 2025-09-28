import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle } from 'lucide-react';

interface FormData {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  location: string;
  registrationNumber: string;
}

export const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    ownerName: '',
    phone: '',
    email: '',
    location: '',
    registrationNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const required = ['businessName', 'ownerName', 'phone', 'email', 'location'];
    for (const field of required) {
      if (!formData[field as keyof FormData].trim()) {
        return false;
      }
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return false;
    }
    
    // Basic phone validation (Kenya format)
    const phoneRegex = /^(\+254|0)[1-9]\d{8}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid information.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate form submission (replace with actual Paystack integration)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      toast({
        title: "Registration Successful!",
        description: "You will be redirected to payment shortly.",
      });
      
      // Here you would integrate with Paystack
      // PaystackPop.setup({
      //   key: 'your-paystack-public-key',
      //   email: formData.email,
      //   amount: 500000, // Amount in kobo (5000 KES)
      //   currency: 'KES',
      //   callback: function(response) {
      //     // Handle successful payment
      //   }
      // }).openIframe();
      
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card className="gradient-card max-w-md mx-auto">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Registration Submitted!</h3>
          <p className="text-muted-foreground mb-4">
            Thank you for registering. You will receive payment instructions shortly.
          </p>
          <Button className="glow-effect w-full">
            Proceed to Payment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="gradient-card max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-center gradient-text">
          Business Registration Form
        </CardTitle>
        <p className="text-center text-muted-foreground">
          Register your salon for the training event
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="businessName">Business Name *</Label>
            <Input
              id="businessName"
              name="businessName"
              value={formData.businessName}
              onChange={handleInputChange}
              placeholder="Your Salon Name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerName">Owner/Manager Name *</Label>
            <Input
              id="ownerName"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleInputChange}
              placeholder="Full Name"
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
              placeholder="+254 712 345 678"
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
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Salon Location (City/Town) *</Label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Nairobi, Mombasa, Kisumu"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Business Registration Number (Optional)</Label>
            <Input
              id="registrationNumber"
              name="registrationNumber"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              placeholder="Business registration number if available"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full glow-effect" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Registration...
              </>
            ) : (
              'Register & Proceed to Payment'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};