import { apiClient } from './client';

const ENDPOINTS = {
  AUTH: '/api/auth',
} as const;

export const authService = {
  login: (data: any) => apiClient.post<{ token: string }>(`${ENDPOINTS.AUTH}/login`, data, { skipAuth: true }),
  register: (data: any) => apiClient.post<void>(`${ENDPOINTS.AUTH}/register`, data, { skipAuth: true }),
  refresh: () => apiClient.post<{ token: string }>(`${ENDPOINTS.AUTH}/refresh`, undefined, { skipAuth: true }),
  logout: () => apiClient.post<void>(`${ENDPOINTS.AUTH}/logout`),
};
