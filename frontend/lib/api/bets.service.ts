import { apiClient } from './client';
import { Bet, CreateBetRequest, UpdateBetRequest, CreateProofRequest } from '@/lib/types';

const ENDPOINTS = {
  BETS: '/bets',
  ACCEPT: (id: string) => `/bets/${id}/accept`,
  DECLINE: (id: string) => `/bets/${id}/decline`,
} as const;

export const betsService = {
  getAllBets(): Promise<Bet[]> {
    return apiClient.get(ENDPOINTS.BETS);
  },

  getBetById(id: string): Promise<Bet> {
    return apiClient.get(`${ENDPOINTS.BETS}/${id}`);
  },

  createBet(data: CreateBetRequest): Promise<Bet> {
    return apiClient.post(ENDPOINTS.BETS, data);
  },

  addProofToBet(id: string, data: CreateProofRequest): Promise<Bet> {
    return apiClient.post(`${ENDPOINTS.BETS}/${id}/proofs`, data);
  },

  acceptBet(betId: string): Promise<Bet> {
    return apiClient.post(ENDPOINTS.ACCEPT(betId));
  },

  declineBet(betId: string): Promise<void> {
    return apiClient.post(ENDPOINTS.DECLINE(betId));
  },

  updateBet(id: string, data: UpdateBetRequest): Promise<Bet> {
    return apiClient.put(`${ENDPOINTS.BETS}/${id}`, data);
  },

  deleteBet(id: string): Promise<void> {
    return apiClient.delete(`${ENDPOINTS.BETS}/${id}`);
  },
};
