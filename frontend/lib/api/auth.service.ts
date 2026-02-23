import { apiClient } from './client';

export const authService = {
  login: async (data: any) => {
    return apiClient.post('/auth/login', data);
  },
  register: async (data: any) => {
    return apiClient.post('/auth/register', data);
  },
};
