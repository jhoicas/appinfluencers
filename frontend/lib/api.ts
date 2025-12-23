import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Usar proxy interno de Next.js (/api/* redirige al backend)
// Esto elimina CORS y permite desarrollo local sin problemas
// Para producción separada, solo cambiar NEXT_PUBLIC_API_URL en .env
const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // CRITICAL: Send httpOnly cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
  // Force JSON serialization to avoid array -> object issues through proxies
  transformRequest: [
    (data, headers) => {
      if (data === undefined || data === null) return data as any;
      // If already a string, pass through
      if (typeof data === 'string') return data as any;
      try {
        return JSON.stringify(data);
      } catch {
        return data as any;
      }
    },
  ],
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You can add additional headers here if needed
    // For example, CSRF token from meta tag
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized: try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh token
        await api.post('/auth/refresh');
        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;