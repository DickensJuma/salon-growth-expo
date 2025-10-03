import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import usePaystackPayment from '@/hooks/usePaystackPayment';
import { toast } from '@/components/ui/use-toast';
import { useEffect } from 'react';

export interface PaymentButtonProps {
  /** Customer's email address */
  email: string;
  
  /** Amount to charge in the smallest currency unit (e.g., kobo for NGN, cents for USD) */
  amount: number;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Callback when payment is successful */
  onSuccess?: (reference?: string) => void;
  
  /** Callback when an error occurs */
  onError?: (error: string) => void;
  
  /** Additional metadata to include with the payment */
  metadata?: Record<string, any>;
  
  /** Button content */
  children: React.ReactNode;
  
  /** Currency code (default: 'KES') */
  currency?: string;
  
  /** Payment channels to enable (default: ['card', 'bank', 'ussd', 'mobile_money']) */
  channels?: string[];
  
  /** Custom callback URL (default: current URL + '/callback') */
  callbackUrl?: string;
  
  /** Reference for the payment (auto-generated if not provided) */
  reference?: string;
  
  /** Whether to disable the button */
  disabled?: boolean;
}

/**
 * A button component that initializes a Paystack payment when clicked
 */
export function PaymentButton({
  email,
  amount,
  className,
  onSuccess,
  onError,
  metadata,
  children,
  currency = 'KES',
  channels,
  callbackUrl,
  reference,
  disabled = false,
}: PaymentButtonProps) {
  const { 
    initializePayment, 
    isLoading, 
    error, 
    verifyPayment,
    paymentReference,
    clearError 
  } = usePaystackPayment({
    onSuccess: (ref) => {
      onSuccess?.(ref);
    },
    onError: (err) => {
      const errorMessage = err.message || 'Payment failed';
      onError?.(errorMessage);
      toast({
        title: 'Payment Error',
        description: errorMessage,
        variant: 'destructive',
      });
    },
  });

  // Show error toast when error state changes
  useEffect(() => {
    if (error) {
      toast({
        title: 'Payment Error',
        description: error,
        variant: 'destructive',
      });
      clearError();
    }
  }, [error, clearError]);

  const handleClick = async () => {
    if (!email) {
      onError?.('Please provide a valid email address');
      return;
    }

    if (amount <= 0) {
      onError?.('Invalid amount');
      return;
    }

    try {
      await initializePayment(
        email, 
        amount, 
        metadata,
        {
          reference,
          currency,
          channels,
          callbackUrl,
        }
      );
      
      // Note: onSuccess will be called after payment verification
      // The user will be redirected to Paystack's payment page
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      onError?.(errorMessage);
      console.error('Payment error:', err);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={className}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
