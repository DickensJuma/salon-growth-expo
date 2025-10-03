/**
 * Safely access environment variables in both client and server components.
 * For client-side, it uses the NEXT_PUBLIC_ prefixed variables.
 * For server-side, it can access any environment variable.
 */

type EnvVarName =
  | 'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY'
  | 'NEXT_PUBLIC_BASE_URL'
  | 'PAYSTACK_SECRET_KEY';

/**
 * Get an environment variable value
 * @param key The environment variable name (must be prefixed with NEXT_PUBLIC_ for client-side)
 * @param defaultValue Optional default value if the variable is not set
 * @returns The environment variable value or the default value
 */
export function getEnv(key: EnvVarName, defaultValue: string = ''): string {
  // In Next.js, environment variables are replaced at build time
  // For client-side, we can only access NEXT_PUBLIC_ prefixed variables
  if (typeof window !== 'undefined') {
    // For client-side, we can only access NEXT_PUBLIC_ prefixed variables
    if (!key.startsWith('NEXT_PUBLIC_')) {
      console.warn(`Attempted to access non-public environment variable '${key}' from the browser`);
      return defaultValue;
    }

    // In Next.js, NEXT_PUBLIC_ variables are available through process.env
    // but we need to handle this carefully
    try {
      // @ts-expect-error - Next.js makes these available through process.env
      return process?.env?.[key] || defaultValue;
    } catch {
      // Fallback for environments where process.env isn't available
      return defaultValue;
    }
  }

  // On the server, we can access all environment variables
  return process.env[key] ?? defaultValue;
}

// Convenience functions for specific environment variables
export const getPaystackPublicKey = (): string =>
  getEnv('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY');

export const getPaystackSecretKey = (): string =>
  getEnv('PAYSTACK_SECRET_KEY');

export const getBaseUrl = (): string =>
  getEnv('NEXT_PUBLIC_BASE_URL', 'http://localhost:3000');

/**
 * Validate that all required environment variables are set
 * @throws Error if any required environment variables are missing
 */
export function validateEnv() {
  const requiredVars: EnvVarName[] = [
    'NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY',
    'PAYSTACK_SECRET_KEY',
  ];

  const missingVars = requiredVars.filter(
    (key) => !getEnv(key as EnvVarName)
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }
}

// Validate environment variables on server startup
if (typeof window === 'undefined') {
  try {
    validateEnv();
  } catch (error) {
    console.error('Environment validation failed:', error);
    // Don't crash in production
    if (process.env.NODE_ENV !== 'production') {
      throw error;
    }
  }
}
