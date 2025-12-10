import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { RegistrationForm } from "@/components/ui/registration-form";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Sparkles,
} from "lucide-react";
import salonHeroImage from "@/assets/sak-2.jpg";
import salonWorkspaceImage from "@/assets/sak-2.jpg";
import salonsAssuredLogo from "@/assets/Salons-Assured-logo.png";

const Index = () => {
  // Event start date (countdown to event)
  const eventDate = "2026-01-05T08:00:00";

  const trainingTopics = [
    {
      icon: Users,
      title: "Leadership & Professionalism",
      description: "Develop strong leadership skills and maintain professional standards in your salon, barbershop, or spa.",
    },
    {
      icon: Settings,
      title: "Staff Discipline & Communication",
      description: "Learn effective communication strategies and discipline systems to manage your team successfully.",
    },
    {
      icon: CheckCircle,
      title: "Daily Operations & Reporting",
      description: "Master daily operational procedures and implement effective reporting systems.",
    },
    {
      icon: Heart,
      title: "2026 Client Experience",
      description: "Design and deliver exceptional client experiences that drive loyalty and growth.",
    },
    {
      icon: Sparkles,
      title: "Sales & Accountability",
      description: "Boost sales performance and establish accountability frameworks for your team.",
    },
    {
      icon: Calendar,
      title: "Conflict Management",
      description: "Develop skills to handle conflicts professionally and maintain a positive work environment.",
    },
    {
      icon: Smartphone,
      title: "Running the Business When You're Away",
      description: "Create systems and processes that allow your business to thrive even in your absence.",
    },
  ];

  const testimonials = [
    {
      name: "Grace Wanjiku",
      salon: "Elegance Beauty Lounge",
      location: "Nairobi",
      text: "The training completely transformed how I manage my salon. My revenue increased by 40% within 3 months!",
      rating: 5,
    },
    {
      name: "Mary Achieng",
      salon: "Glamour Studio",
      location: "Kisumu",
      text: "I learned invaluable skills in staff management and client relations. Highly recommend this training!",
      rating: 5,
    },
    {
      name: "Faith Nyambura",
      salon: "Royal Touch Salon",
      location: "Mombasa",
      text: "The social media marketing session was a game-changer. My online bookings have tripled!",
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: "What should I bring to the training?",
      answer:
        "Bring a notepad, pen, your business cards, and any specific challenges you're facing in your salon. We'll provide all training materials and refreshments.",
    },
    {
      question: "Is there a dress code?",
      answer:
        "Business casual or professional attire is recommended. This is a professional development event, so dress to network and make connections.",
    },
    {
      question: "Will I receive a certificate?",
      answer:
        "Yes! All attendees will receive a Certificate of Completion from Salon Assured Kenya, which you can display in your salon.",
    },
    {
      question: "Can I bring my staff members?",
      answer:
        "Each registration is for one person. However, you can register multiple staff members separately. We offer group discounts for 3+ registrations from the same salon.",
    },
    {
      question: "What if I can't attend after paying?",
      answer:
        "We offer full refunds up to 7 days before the event. After that, you can transfer your registration to another person or use it for future training events.",
    },
    {
      question: "Is lunch provided?",
      answer:
        "Yes! We provide refreshments, lunch, and networking snacks throughout the day. Please inform us of any dietary restrictions during registration.",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center bg-gradient-hero overflow-hidden"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: `url(${salonHeroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary-glow/10 to-gold/20" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="animate-float mb-6">
            <img
              src={salonsAssuredLogo}
              alt="Salons Assured Logo"
              className="h-24 w-auto mx-auto drop-shadow-lg animate-pulse-glow"
            />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 gradient-text leading-tight drop-shadow-lg text-white">
            Managers Training
          </h1>
          <p className="text-xl md:text-2xl mb-6 text-white/90 max-w-3xl mx-auto drop-shadow">
            Operational Excellence 2026 • 5th January 2026 • Salons Assured Offices
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 text-lg">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gold" />
              <span className="font-semibold text-white">5th January 2026</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gold" />
              <span className="text-white/90">9:00 AM - 5:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gold" />
              <span className="text-white/90">Salons Assured Offices</span>
            </div>
          </div>
          <CountdownTimer targetDate={eventDate} className="mb-8" />
          <Button
            size="lg"
            variant="hero"
            className="text-lg px-8 py-6 animate-pulse-glow"
            style={{
              background: "var(--gradient-hero)",
              boxShadow: "0 0 15px var(--gold)",
            }}
            onClick={() =>
              document
                .getElementById("registration")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Register Now – KES 12,500
          </Button>
          <p className="mt-4 text-white/80">
            Limited to 35 slots • Certificate • Networking • Premium content
          </p>
        </div>
      </section>

      {/* Event Overview */}
      <section className="py-20 bg-gradient-to-br from-background to-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
              Why Attend Managers Training?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Give your manager the skills to run your salon, barbershop, or spa with strong leadership, better systems, and improved daily operations in 2026.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold mb-6">Training Topics</h3>
              <div className="space-y-6">
                {trainingTopics.map((topic, index) => (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <topic.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">{topic.title}</h4>
                      <p className="text-muted-foreground">
                        {topic.description}
                      </p>
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
                  Learn from industry leaders with 15+ years of salon management
                  experience
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
                  Connect with fellow salon owners and build lasting business
                  relationships
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section
        id="registration"
        className="py-20 bg-gradient-to-br from-secondary/10 to-background"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
              Secure Your Training Pass
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              Investment:{" "}
              <span className="font-semibold text-primary">KES 12,500</span>{" "}
              (Taking only 35 slots) – Includes meals, certificate, networking & premium content.
            </p>
            <p className="text-lg font-semibold text-primary mb-6 max-w-2xl mx-auto">
              Prepare your business for a stronger 2026.
            </p>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left mb-10">
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">
                  What You'll Learn
                </h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                  <li>Leadership & Professionalism</li>
                  <li>Staff Discipline & Communication</li>
                  <li>Daily Operations & Reporting</li>
                  <li>2026 Client Experience</li>
                  <li>Sales & Accountability</li>
                  <li>Conflict Management</li>
                  <li>Running the Business When You're Away</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Payment Details</h4>
                <div className="rounded-md border p-4 text-sm bg-card/50 backdrop-blur">
                  <p>
                    <span className="font-medium">Paybill:</span> 542542
                  </p>
                  <p>
                    <span className="font-medium">Account:</span> 100831
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    After payment, complete the registration form below.
                  </p>
                </div>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold">Need Help?</p>
                  <p className="text-muted-foreground">
                    Call: 0715 500 268 / 0715 500 134
                  </p>
                </div>
              </div>
            </div>
          </div>

          <RegistrationForm />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-background to-accent/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 gradient-text">
              What Past Participants Say
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
                      <Star
                        key={i}
                        className="w-5 h-5 text-gold fill-current"
                      />
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
      <footer
        className="py-12 bg-gradient-hero text-primary-foreground"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Salon Assured Kenya</h3>
          <p className="mb-6 opacity-90">
            Empowering Kenya's beauty industry through professional development
            and training
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-sm opacity-80">
            <span>📧 info@salonassuredkenya.com</span>
            <span>📱 +254 700 123 456</span>
            <span>📍 Nairobi, Kenya</span>
          </div>
          <div className="mt-8 pt-8 border-t border-primary-foreground/20">
            <p className="text-sm opacity-70">
              © 2025 Salon Assured Kenya. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
