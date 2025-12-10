'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { usePaystack } from '@/contexts/PaystackProvider';

// Helper function to generate a unique reference
const generateReference = () => {
  return 'PAYSTACK_' + Math.random().toString(36).substring(2, 15);
};

// Helper function to get payment reference from URL
const getPaymentReferenceFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const url = new URL(window.location.href);
  return url.searchParams.get('reference');
};

export interface UsePaystackPaymentProps {
  /**
   * Callback function that will be called when payment is successful
   * @param reference - The payment reference from Paystack
   */
  onSuccess?: (reference: string) => void;
  
  /**
   * Callback function that will be called when payment is closed by the user
   */
  onClose?: () => void;
  
  /**
   * Callback function that will be called when an error occurs
   * @param error - The error that occurred
   */
  onError?: (error: Error) => void;
  
  /**
   * Whether to automatically check for payment reference in the URL
   * and verify the payment status when the component mounts
   * @default true
   */
  autoCheckStatus?: boolean;
}

export const usePaystackPayment = (props?: UsePaystackPaymentProps) => {
  const { 
    onSuccess, 
    onClose, 
    onError,
    autoCheckStatus = true
  } = props || {};
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { initializePayment } = usePaystack();
  
  // Check for payment reference in the URL when component mounts
  useEffect(() => {
    if (!autoCheckStatus || typeof window === 'undefined') return;
    
    const reference = getPaymentReferenceFromUrl();
    if (reference) {
      setPaymentReference(reference);
      onSuccess?.(reference);
    }
  }, [autoCheckStatus, onSuccess]);

  /**
   * Initialize a new payment
   * @param email - Customer's email address
   * @param amount - Amount to charge in the smallest currency unit (e.g., kobo for NGN, cents for USD)
   * @param metadata - Additional metadata to include with the payment
   */
  const handlePayment = useCallback((
    email: string, 
    amount: number, 
    metadata: Record<string, any> = {},
    options: {
      reference?: string;
      currency?: string;
      channels?: string[];
      callbackUrl?: string;
    } = {}
  ) => {
    setIsLoading(true);
    setError(null);

    console.log('Initializing payment with:', {
      email,
      amount,
      metadata,
      ...options
    });

    try {
      // Ensure we have a valid reference
      const reference = options.reference || generateReference();
      
      // Initialize payment
      initializePayment({
        email,
        amount: amount * 100, // Convert to kobo/cent
        reference,
        currency: options.currency || 'NGN',
        channels: options.channels || ['card', 'bank', 'mobile_money'],
        metadata: {
          ...metadata,
          custom_fields: [
            {
              display_name: 'Paid via',
              variable_name: 'paid_via',
              value: 'website'
            }
          ]
        },
        onSuccess: (response: any) => {
          console.log('Payment successful:', response);
          onSuccess?.(response.reference || response.trxref);
        },
        onClose: () => {
          console.log('Payment closed');
          onClose?.();
        }
      });
      
      // Set the payment reference
      setPaymentReference(reference);
      
      // If a callback URL is provided, redirect after a short delay
      if (options.callbackUrl) {
        setTimeout(() => {
          window.location.href = `${options.callbackUrl}?reference=${reference}`;
        }, 2000);
      }
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment initialization failed';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
      
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [initializePayment, onSuccess, onClose, onError, toast]);

  /**
   * Verify a payment using its reference
   * @param reference - The payment reference to verify
   */
  const verifyPayment = useCallback(async (reference: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://api.salons-assured.com/api/paystack/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }
      
      const data = await response.json();
      
      if (data.status === 'success') {
        onSuccess?.(reference);
        return data.data;
      } else {
        throw new Error(data.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment verification failed';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
      
      toast({
        title: 'Verification Error',
        description: errorMessage,
        variant: 'destructive',
      });
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, toast]);

  return {
    initializePayment: handlePayment,
    verifyPayment,
    isLoading,
    error,
    paymentReference,
  };
};

export default usePaystackPayment;
