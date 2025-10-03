import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import "./index.css";
import { PaystackProvider } from "@/contexts/PaystackProvider";
const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

createRoot(document.getElementById("root")!).render(
  <PaystackProvider publicKey={paystackPublicKey}>
    <App />
  </PaystackProvider>
);
