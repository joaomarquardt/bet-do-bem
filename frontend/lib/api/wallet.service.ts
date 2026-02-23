import { apiClient } from './client';
import { Wallet, Transaction, PaginatedResponse } from '@/lib/types';

const ENDPOINTS = {
  WALLET: '/wallet',
  TRANSACTIONS: '/wallet/transactions',
} as const;

export const walletService = {
  async getWallet(): Promise<Wallet> {
    return apiClient.get<Wallet>(ENDPOINTS.WALLET);
  },

  async getTransactions(page = 0, size = 20): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>(ENDPOINTS.TRANSACTIONS, {
      params: { page, size },
    });
  },
};
