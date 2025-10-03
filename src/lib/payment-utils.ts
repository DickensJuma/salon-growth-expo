import { getPaystackClient } from './paystack';

export interface PaymentDetails {
  email: string;
  amount: number;
  reference: string;
  metadata?: Record<string, any>;
  currency?: string;
  channels?: string[];
  callbackUrl?: string;
}

export async function initializePayment(paymentDetails: PaymentDetails) {
  try {
    const paystack = getPaystackClient();
    
    // Generate a unique reference if not provided
    const reference = paymentDetails.reference || `txn_${Date.now()}`;
    
    // Default to KES if currency is not provided
    const currency = paymentDetails.currency || 'KES';
    
    // Use ngrok URL for callbacks in development
    const baseUrl = window.location.hostname === 'localhost' 
      ? 'https://b97f8ebe008f.ngrok-free.app' 
      : window.location.origin;
      
    const callbackUrl = paymentDetails.callbackUrl || `${baseUrl}/payment/callback`;
    
    console.log('Initializing payment with callback URL:', callbackUrl);
    
    // Prepare the payment data
    const paymentData = {
      email: paymentDetails.email,
      amount: paymentDetails.amount * 100, // Convert to kobo
      reference,
      currency,
      callback_url: callbackUrl,
      metadata: {
        custom_fields: [
          {
            display_name: 'Paid Via',
            variable_name: 'paid_via',
            value: 'salon_growth_expo',
          },
        ],
        ...(paymentDetails.metadata || {}),
      },
      channels: paymentDetails.channels || ['card', 'bank', 'ussd', 'mobile_money'],
    };

    // Initialize the payment
    const response = await paystack.initializePayment(paymentData);
    
    if (!response?.authorization_url) {
      throw new Error('Failed to get payment URL');
    }
    
    // Store the reference in session storage for later use
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('paymentReference', reference);
      sessionStorage.setItem('paymentReturnUrl', window.location.pathname);
    }
    
    // Redirect to Paystack payment page
    window.location.href = response.authorization_url;
    
    return response;
  } catch (error) {
    console.error('Payment initialization failed:', error);
    throw error;
  }
}

// Helper function to format currency
export function formatCurrency(amount: number, currency: string = 'KES'): string {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

// Helper to check if a payment reference exists in the URL
export function getPaymentReferenceFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  
  const url = new URL(window.location.href);
  return url.searchParams.get('reference') || url.searchParams.get('trxref');
}
