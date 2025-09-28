import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { RegistrationForm } from '@/components/ui/registration-form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Users, 
  Settings, 
  Heart, 
  Smartphone, 
  Calendar,
  MapPin,
  Clock,
  Star,
  Quote,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import salonHeroImage from '@/assets/salon-training-hero.jpg';
import salonWorkspaceImage from '@/assets/salon-workspace.jpg';

const Index = () => {
  // Event date - September 30th
  const eventDate = "2024-09-30T09:00:00";

  const trainingTopics = [
    {
      icon: Users,
      title: "Staff Management",
      description: "Learn effective team leadership and employee management strategies"
    },
    {
      icon: Settings,
      title: "Operations Management",
      description: "Streamline your salon operations for maximum efficiency and profitability"
    },
    {
      icon: Heart,
      title: "Client Experience Excellence",
      description: "Create memorable experiences that build customer loyalty and referrals"
    },
    {
      icon: Smartphone,
      title: "Social Media Marketing",
      description: "Master digital marketing strategies to grow your salon's online presence"
    }
  ];

  const testimonials = [
    {
      name: "Grace Wanjiku",
      salon: "Elegance Beauty Lounge",
      location: "Nairobi",
      text: "The training completely transformed how I manage my salon. My revenue increased by 40% within 3 months!",
      rating: 5
    },
    {
      name: "Mary Achieng",
      salon: "Glamour Studio",
      location: "Kisumu", 
      text: "I learned invaluable skills in staff management and client relations. Highly recommend this training!",
      rating: 5
    },
    {
      name: "Faith Nyambura",
      salon: "Royal Touch Salon",
      location: "Mombasa",
      text: "The social media marketing session was a game-changer. My online bookings have tripled!",
      rating: 5
    }
  ];

  const faqs = [
    {
      question: "What should I bring to the training?",
      answer: "Bring a notepad, pen, your business cards, and any specific challenges you're facing in your salon. We'll provide all training materials and refreshments."
    },
    {
      question: "Is there a dress code?",
      answer: "Business casual or professional attire is recommended. This is a professional development event, so dress to network and make connections."
    },
    {
      question: "Will I receive a certificate?",
      answer: "Yes! All attendees will receive a Certificate of Completion from Salon Assured Kenya, which you can display in your salon."
    },
    {
      question: "Can I bring my staff members?",
      answer: "Each registration is for one person. However, you can register multiple staff members separately. We offer group discounts for 3+ registrations from the same salon."
    },
    {
      question: "What if I can't attend after paying?",
      answer: "We offer full refunds up to 7 days before the event. After that, you can transfer your registration to another person or use it for future training events."
    },
    {
      question: "Is lunch provided?",
      answer: "Yes! We provide refreshments, lunch, and networking snacks throughout the day. Please inform us of any dietary restrictions during registration."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${salonHeroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary-glow/10 to-gold/20" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="animate-float">
            <Sparkles className="w-16 h-16 text-gold mx-auto mb-6 animate-pulse-glow" />
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 gradient-text leading-tight">
            Salon & Beauty Manager Training
          </h1>
          
          <p className="text-xl md:text-2xl mb-4 text-primary-foreground/90 max-w-3xl mx-auto">
            Empowering Salon Managers for Growth & Excellence
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 text-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold" />
              <span className="font-semibold text-primary-foreground">30th September 2024</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold" />
              <span className="text-primary-foreground/90">9:00 AM - 5:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold" />
              <span className="text-primary-foreground/90">Nairobi, Kenya</span>
            </div>
          </div>

          <CountdownTimer targetDate={eventDate} className="mb-8" />
          
          <Button 
            size="lg" 
            variant="hero"
            className="text-lg px-8 py-6 animate-pulse-glow"
            onClick={() => document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Register Now - KES 5,000
          </Button>
          
          <p className="mt-4 text-primary-foreground/80">
            Limited seats available • Early bird pricing ends soon
          </p>
        </div>
      </section>

      {/* Event Overview */}
      <section className="py-20 bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
              Transform Your Salon Business
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join Kenya's leading salon managers in this comprehensive training designed to elevate 
              your business skills, boost profitability, and create exceptional client experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-6">What You'll Master</h3>
              <div className="space-y-6">
                {trainingTopics.map((topic, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <topic.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{topic.title}</h4>
                      <p className="text-muted-foreground">{topic.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={salonWorkspaceImage} 
                alt="Professional salon workspace" 
                className="rounded-xl shadow-gold w-full animate-float"
              />
              <div className="absolute inset-0 bg-gradient-accent opacity-20 rounded-xl" />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="gradient-card text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h4 className="font-semibold mb-2">Expert Trainers</h4>
                <p className="text-sm text-muted-foreground">
                  Learn from industry leaders with 15+ years of salon management experience
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-gold/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-gold" />
                </div>
                <h4 className="font-semibold mb-2">Practical Tools</h4>
                <p className="text-sm text-muted-foreground">
                  Get ready-to-use templates, checklists, and management systems
                </p>
              </CardContent>
            </Card>

            <Card className="gradient-card text-center">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-secondary-accent" />
                </div>
                <h4 className="font-semibold mb-2">Networking</h4>
                <p className="text-sm text-muted-foreground">
                  Connect with fellow salon owners and build lasting business relationships
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section id="registration" className="py-20 bg-gradient-to-br from-secondary/10 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
              Secure Your Spot Today
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Investment: KES 5,000 per person (includes training materials, certificate, lunch & refreshments)
            </p>
          </div>
          
          <RegistrationForm />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
              What Our Past Participants Say
            </h2>
            <p className="text-xl text-muted-foreground">
              Real results from real salon owners across Kenya
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="gradient-card">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-gold fill-current" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  <div className="border-t pt-4">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.salon} • {testimonial.location}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-secondary/5 to-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about the training
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="gradient-card rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gradient-hero text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Salon Assured Kenya</h3>
          <p className="mb-6 opacity-90">
            Empowering Kenya's beauty industry through professional development and training
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm opacity-80">
            <span>📧 info@salonassuredkenya.com</span>
            <span>📱 +254 700 123 456</span>
            <span>📍 Nairobi, Kenya</span>
          </div>
          <div className="mt-8 pt-8 border-t border-primary-foreground/20">
            <p className="text-sm opacity-70">
              © 2024 Salon Assured Kenya. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;