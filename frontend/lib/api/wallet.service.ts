import { apiClient } from './client';
import { Transaction, PaginatedResponse } from '@/lib/types';

const ENDPOINTS = {
  WALLET: '/api/wallet',
  TRANSACTIONS: '/api/wallet/transactions',
} as const;

export const walletService = {
  async getWallet(): Promise<Record<string, unknown>> {
    return apiClient.get<Record<string, unknown>>(ENDPOINTS.WALLET);
  },

  async getTransactions(page = 0, size = 20): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>(ENDPOINTS.TRANSACTIONS, {
      params: { page, size },
    });
  },
};
