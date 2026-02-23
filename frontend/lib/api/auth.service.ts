import { apiClient } from './client';

export const authService = {
  login: (data: any) => apiClient.post<{ token: string }>('/api/auth/login', data, { skipAuth: true }),
  register: (data: any) => apiClient.post<void>('/api/auth/register', data, { skipAuth: true }),
};
