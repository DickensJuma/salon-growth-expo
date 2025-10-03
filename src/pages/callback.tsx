// pages/payment/callback.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { PaymentVerification } from '@/components/PaymentVerification';

export default function PaymentCallback() {
  const router = useRouter();
  const { reference } = router.query;
  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!reference) return;

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/verify-payment`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reference }),
        });

        const result = await response.json();

        if (result.success) {
          setStatus('success');
          // Update your database here if needed
          console.log('Payment successful:', result.data);
        } else {
          setStatus('failed');
          setError(result.error || 'Payment verification failed');
        }
      } catch (err) {
        setStatus('failed');
        setError('An error occurred while verifying your payment');
        console.error('Verification error:', err);
      }
    }

    verify();
  }, [reference]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <PaymentVerification
        status={status}
        error={error}
        onRetry={() => window.location.reload()}
      />
    </div>
  );
}