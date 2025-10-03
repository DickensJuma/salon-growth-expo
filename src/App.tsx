import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PaystackProvider } from "@/contexts/PaystackProvider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PaymentCallback from "./pages/payment/callback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PaystackProvider
      publicKey={import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || ''}
      onSuccess={(reference) => {
        console.log('Payment successful:', reference);
      }}
      onClose={() => {
        console.log('Payment modal closed');
      }}
      onError={(error) => {
        console.error('Paystack error:', error);
      }}
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/payment/callback" element={<PaymentCallback />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PaystackProvider>
  </QueryClientProvider>
);

export default App;
