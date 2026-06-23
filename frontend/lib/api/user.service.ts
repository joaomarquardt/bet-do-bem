import { apiClient } from './client';
import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  TransactionResponse,
  PaginatedResponse,
  UploadPictureRequest,
  UploadPictureResponse,
} from '@/lib/types';

const ENDPOINTS = {
  USERS: '/api/users',
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

  getMyProfile(): Promise<User> {
    return apiClient.get(`${ENDPOINTS.USERS}/me`);
  },

  updateProfilePicture(data: UploadPictureRequest): Promise<UploadPictureResponse> {
    return apiClient.put(`${ENDPOINTS.USERS}/me/profile-picture`, data);
  },

  getUserTransactions(
    id: string,
    params?: { page?: number; size?: number; sortBy?: string; sortDirection?: string },
  ): Promise<PaginatedResponse<TransactionResponse>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size !== undefined) query.set('size', String(params.size));
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortDirection) query.set('sortDirection', params.sortDirection);
    const qs = query.toString();
    return apiClient.get(`${ENDPOINTS.USERS}/${id}/transactions${qs ? `?${qs}` : ''}`);
  },

  getMyTransactions(
    params?: { page?: number; size?: number; sortBy?: string; sortDirection?: string },
  ): Promise<PaginatedResponse<TransactionResponse>> {
    const query = new URLSearchParams();
    if (params?.page !== undefined) query.set('page', String(params.page));
    if (params?.size !== undefined) query.set('size', String(params.size));
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortDirection) query.set('sortDirection', params.sortDirection);
    const qs = query.toString();
    return apiClient.get(`${ENDPOINTS.USERS}/me/transactions${qs ? `?${qs}` : ''}`);
  },

  updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    return apiClient.put(`${ENDPOINTS.USERS}/${id}`, data);
  },

  deleteUser(id: string): Promise<void> {
    return apiClient.delete(`${ENDPOINTS.USERS}/${id}`);
  },
};
