// src/services/api.ts - Frontend API client
const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';

export const registerUser = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/api/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to register');
  }

  return response.json();
};

// Health check function
export const checkServerHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/api/health`);
  return response.json();
};