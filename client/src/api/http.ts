/// <reference types="vite/client" />
import { useAuthStore } from '@/stores/useAuthStore';
const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'https://telechat-jhp1.onrender.com';

export const getApiBaseUrl = () => API_BASE_URL;

const getAuthToken = () => {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('telechat_token');
};

export const requestJson = async <T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = true
): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ? (options.headers as Record<string, string>) : {}),
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    if (response.status === 401 && requiresAuth) {
      const { setSessionExpired } = useAuthStore.getState();
      setSessionExpired();
      message = 'Session expired, please login again';
    }
    try {
      const errorBody = await response.json();
      if (errorBody?.message && response.status !== 401) message = errorBody.message;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
};
