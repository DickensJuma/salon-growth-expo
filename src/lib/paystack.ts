import Paystack from '@paystack/paystack-sdk';
import { getPaystackSecretKey } from './env';
import { getClientPaystackPublicKey, getClientBaseUrl } from './client-env';

// Only initialize Paystack on the server side
let paystack: any = null;
if (typeof window === 'undefined') {
  paystack = new Paystack({
    key: getPaystackSecretKey(),
    hostname: 'api.paystack.co',
  });
}

// Client-side initialization helper
export const getPaystackClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('getPaystackClient should only be called on the client side');
  }
  
  const publicKey = getClientPaystackPublicKey();
  if (!publicKey) {
    console.error('Paystack public key is not configured');
    throw new Error('Payment service is not properly configured. Please try again later.');
  }
  
  const baseUrl = getClientBaseUrl();
  
  return {
    publicKey,
    initializePayment: async (args: {
      email: string;
      amount: number;
      reference: string;
      metadata?: Record<string, any>;
      callback_url?: string;
      currency?: string;
      channels?: string[];
    }) => {
      try {
        const response = await fetch(`${baseUrl}/api/paystack/initialize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(args),
          credentials: 'same-origin',
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({
            message: 'Failed to process payment request',
          }));
          
          throw new Error(
            errorData.message || 
            errorData.error?.message || 
            'Failed to initialize payment. Please try again.'
          );
        }
        
        return await response.json();
      } catch (error) {
        console.error('Payment initialization error:', error);
        throw error instanceof Error 
          ? error 
          : new Error('An unexpected error occurred while initializing payment');
      }
    },
  };
};

export interface InitializePaymentArgs {
  email: string;
  amount: number; // amount in the smallest currency unit (e.g., kobo for NGN, cents for USD)
  reference: string;
  callback_url: string;
  metadata?: Record<string, any>;
  currency?: string; // e.g., 'NGN', 'USD', 'KES', etc.
  channels?: string[]; // e.g., ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer']
  subaccount?: string; // subaccount code
  transaction_charge?: number; // override subaccount percentage charge
  bearer?: 'account' | 'subaccount'; // who bears Paystack charges?
}

export interface InitializePaymentResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export const initializePayment = async (args: InitializePaymentArgs): Promise<InitializePaymentResponse> => {
  // This should only be called server-side
  if (typeof window !== 'undefined') {
    throw new Error('initializePayment should only be called server-side');
  }

  try {
    const response = await paystack.transaction.initialize({
      ...args,
      amount: Math.round(args.amount * 100), // Convert to kobo
      currency: args.currency || 'KES', // Default to KES if not specified
    });
    
    if (!response.status) {
      throw new Error(response.message || 'Failed to initialize payment');
    }
    
    return response;
  } catch (error) {
    console.error('Payment initialization failed:', error);
    throw new Error('Failed to initialize payment. Please try again.');
  }
};

export interface VerifyPaymentResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    reference: string;
    amount: number;
    currency: string;
    metadata: Record<string, any>;
    // Add other fields from Paystack response as needed
  };
}

export const verifyPayment = async (reference: string): Promise<VerifyPaymentResponse> => {
  // This should only be called server-side
  if (typeof window !== 'undefined') {
    throw new Error('verifyPayment should only be called server-side');
  }

  try {
    const response = await paystack.transaction.verify(reference);
    return response.data;
  } catch (error) {
    console.error('Payment verification failed:', error);
    throw new Error('Payment verification failed. Please try again.');
  }
};

export const listTransactions = async (params: any = {}) => {
  try {
    const response = await paystack.transaction.list({
      perPage: 10,
      ...params,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    throw error;
  }
};

export default paystack;
