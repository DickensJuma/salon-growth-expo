// components/PaymentVerification.tsx
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaymentVerificationProps {
  status: 'verifying' | 'success' | 'failed';
  error?: string | null;
  onRetry: () => void;
}

export function PaymentVerification({ status, error, onRetry }: PaymentVerificationProps) {
  return (
    <div className="text-center p-8 max-w-md w-full bg-white rounded-lg shadow-md">
      {status === 'verifying' && (
        <>
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Verifying your payment</h2>
          <p className="text-gray-600">Please wait while we verify your transaction...</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
          <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Go to Dashboard
          </Button>
        </>
      )}

      {status === 'failed' && (
        <>
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}
          <p className="text-gray-600 mb-6">
            We couldn't process your payment. Please try again.
          </p>
          <div className="space-x-4">
            <Button variant="outline" onClick={() => window.history.back()}>
              Back
            </Button>
            <Button onClick={onRetry}>Try Again</Button>
          </div>
        </>
      )}
    </div>
  );
}