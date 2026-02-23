import { apiClient } from './client';
import { User, CreateUserRequest, UpdateUserRequest, Transaction } from '@/lib/types';

const ENDPOINTS = {
  USERS: '/users',
} as const;

export const userService = {
  getMe(): Promise<User> {
    return apiClient.get(`${ENDPOINTS.USERS}/me`);
  },

  getAllUsers(): Promise<User[]> {
    return apiClient.get(ENDPOINTS.USERS);
  },

  createUser(data: CreateUserRequest): Promise<User> {
    return apiClient.post(ENDPOINTS.USERS, data);
  },

  getUserById(id: string): Promise<User> {
    return apiClient.get(`${ENDPOINTS.USERS}/${id}`);
  },

  getUserTransactions(id: string): Promise<Transaction[]> {
    return apiClient.get(`${ENDPOINTS.USERS}/${id}/transactions`);
  },

  updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    return apiClient.put(`${ENDPOINTS.USERS}/${id}`, data);
  },

  deleteUser(id: string): Promise<void> {
    return apiClient.delete(`${ENDPOINTS.USERS}/${id}`);
  },
};
