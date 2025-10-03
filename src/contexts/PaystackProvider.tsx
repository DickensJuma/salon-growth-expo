// src/contexts/PaystackProvider.tsx
"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export interface PaystackConfig {
  email: string;
  amount: number;
  reference: string;
  currency?: string;
  channels?: string[];
  metadata?: Record<string, any>;
  onSuccess?: (response: any) => void;
  onClose?: () => void;
  onError?: (error: any) => void;
  callback_url?: string;
  plan?: string;
  quantity?: number;
  subaccount?: string;
  transaction_charge?: number;
  bearer?: "account" | "subaccount";
}

export interface PaystackContextType {
  initializePayment: (config: PaystackConfig) => void;
  isScriptLoaded: boolean;
}

const PaystackContext = createContext<PaystackContextType | undefined>(
  undefined
);

export const PaystackProvider = ({
  children,
  publicKey,
  onSuccess,
  onClose,
  onError,
}: {
  children: ReactNode;
  publicKey: string;
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
  onError?: (error: any) => void;
}) => {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const handleScriptLoad = useCallback(() => {
    setIsScriptLoaded(true);
  }, []);

  const handleScriptError = useCallback(() => {
    const error = new Error('Failed to load Paystack script');
    console.error(error);
    onError?.(error);
  }, [onError]);

  useEffect(() => {
    if (typeof window === 'undefined' || window.PaystackPop) {
      handleScriptLoad();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = handleScriptLoad;
    script.onerror = handleScriptError;

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [handleScriptLoad, handleScriptError]);

  const initializePayment = useCallback(
    async (config: PaystackConfig) => {
      if (!window.PaystackPop?.setup) {
        const error = new Error('Paystack script not loaded');
        console.error(error);
        onError?.(error);
        return;
      }

      try {
        const paymentConfig = {
          ...config,
          key: publicKey,
          ref: config.reference || `PAYSTACK_${Date.now()}`,
          callback: (response: any) => {
            // Client-side callback (not reliable for verification)
            console.log('Payment callback:', response);
            config.onSuccess?.(response);
          },
          onClose: () => {
            console.log('Payment window closed');
            config.onClose?.();
          },
        };

        const handler = window.PaystackPop.setup(paymentConfig);
        handler.openIframe();
      } catch (error) {
        console.error('Payment initialization error:', error);
        onError?.(error as Error);
      }
    },
    [publicKey, onError]
  );

  return (
    <PaystackContext.Provider value={{ initializePayment, isScriptLoaded }}>
      {children}
    </PaystackContext.Provider>
  );
};

export const usePaystack = () => {
  const context = useContext(PaystackContext);
  if (context === undefined) {
    throw new Error("usePaystack must be used within a PaystackProvider");
  }
  return context;
};
