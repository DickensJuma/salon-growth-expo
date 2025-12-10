/**
 * Client-side environment variable access
 * This ensures safe access to environment variables in the browser
 */

// Define the shape of our client-side environment variables
type ClientEnv = {
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: string;
  NEXT_PUBLIC_BASE_URL: string;
};

// Default values for client-side environment variables
const defaultEnv: ClientEnv = {
  NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY: '',
  NEXT_PUBLIC_BASE_URL: 'http://localhost:3001',
};

// Get client environment variables
export function getClientEnv(): ClientEnv {
  // In the browser, get from window.ENV or fall back to defaults
  if (typeof window !== 'undefined') {
    return {
      NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY:
        (window as any).ENV?.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ||
        defaultEnv.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      NEXT_PUBLIC_BASE_URL:
        (window as any).ENV?.NEXT_PUBLIC_BASE_URL ||
        defaultEnv.NEXT_PUBLIC_BASE_URL,
    };
  }

  // On the server, return the default values
  return defaultEnv;
}

// Individual getters for each environment variable
export const getClientPaystackPublicKey = (): string =>
  getClientEnv().NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

export const getClientBaseUrl = (): string =>
  getClientEnv().NEXT_PUBLIC_BASE_URL;

// Validate that all required client environment variables are set
export function validateClientEnv() {
  const env = getClientEnv();
  const missingVars: string[] = [];

  if (!env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
    missingVars.push('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY');
  }

  if (missingVars.length > 0) {
    console.error('Missing required client environment variables:', missingVars.join(', '));
    return false;
  }

  return true;
}

// Validate environment variables on module load
if (typeof window !== 'undefined') {
  validateClientEnv();
}
