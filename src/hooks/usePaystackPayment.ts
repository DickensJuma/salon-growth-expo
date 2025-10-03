// src/hooks/usePaystackPayment.ts
'use client';

import { useCallback, useState } from 'react';
import { usePaystack } from '@/contexts/PaystackProvider';

export interface UsePaystackPaymentProps {
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  autoCheckStatus?: boolean;
}

export const usePaystackPayment = (props?: UsePaystackPaymentProps) => {
  const { onSuccess, onClose, onError, autoCheckStatus = true } = props || {};
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const { initializePayment, isScriptLoaded } = usePaystack();

  const handlePayment = useCallback((
    email: string,
    amount: number,
    metadata: Record<string, any> = {},
    options: {
      reference?: string;
      currency?: string;
      channels?: string[];
      callbackUrl?: string;
      plan?: string;
      quantity?: number;
      subaccount?: string;
      transaction_charge?: number;
      bearer?: 'account' | 'subaccount';
    } = {}
  ) => {
    if (!isScriptLoaded) {
      const error = new Error('Payment system is still initializing. Please wait a moment and try again.');
      setError(error.message);
      onError?.(error);
      return;
    }

    console.log("usePaystackPayment hook running");


    setIsLoading(true);
    setError(null);

    const reference = options.reference || `PAYSTACK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      initializePayment({
        email,
        amount: amount * 100, // Convert to kobo/cent
        reference,
        currency: options.currency || 'KES',
        channels: options.channels || ['card', 'bank', 'mobile_money'],
        ...(options.callbackUrl && { callback_url: options.callbackUrl }),
        ...(options.plan && { plan: options.plan }),
        ...(options.quantity && { quantity: options.quantity }),
        ...(options.subaccount && { subaccount: options.subaccount }),
        ...(options.transaction_charge && { transaction_charge: options.transaction_charge }),
        ...(options.bearer && { bearer: options.bearer }),
        metadata: {
          ...metadata,
          custom_fields: [
            ...(metadata.custom_fields || []),
            {
              display_name: 'Paid At',
              variable_name: 'paid_at',
              value: new Date().toISOString()
            }
          ]
        },
        onSuccess: (response: any) => {
          setPaymentReference(reference);
          setIsLoading(false);
          onSuccess?.(response.reference || reference);
          
          if (options.callbackUrl) {
            const url = new URL(options.callbackUrl, window.location.origin);
            url.searchParams.set('reference', reference);
            window.location.href = url.toString();
          }
        },
        onClose: () => {
          setIsLoading(false);
          onClose?.();
        }
      });
    } catch (err) {
      console.error('Payment error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Payment initialization failed';
      setError(errorMessage);
      onError?.(new Error(errorMessage));
      setIsLoading(false);
    }
  }, [initializePayment, isScriptLoaded, onSuccess, onClose, onError]);

  return {
    handlePayment,
    isLoading,
    error,
    paymentReference,
    isScriptLoaded
  };
};

export default usePaystackPayment;