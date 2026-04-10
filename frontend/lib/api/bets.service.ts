import { apiClient } from './client';
import { Bet, BetResponse, CreateBetRequest, UpdateBetRequest, CreateProofRequest, ProofUploadResponse } from '@/lib/types';

const ENDPOINTS = {
  BETS: '/api/bets',
} as const;

export const betsService = {
  getAllBets(): Promise<BetResponse[]> {
    return apiClient.get(ENDPOINTS.BETS);
  },

  getBetById(id: string): Promise<BetResponse> {
    return apiClient.get(`${ENDPOINTS.BETS}/${id}`);
  },

  createBet(data: CreateBetRequest): Promise<BetResponse> {
    return apiClient.post(ENDPOINTS.BETS, data);
  },

  addProofToBet(id: string, data: CreateProofRequest): Promise<ProofUploadResponse> {
    return apiClient.post(`${ENDPOINTS.BETS}/${id}/proofs`, data);
  },

  acceptBet(id: string): Promise<BetResponse> {
    return apiClient.post(`${ENDPOINTS.BETS}/${id}/accept`);
  },

  declineBet(id: string): Promise<BetResponse> {
    return apiClient.post(`${ENDPOINTS.BETS}/${id}/decline`);
  },

  updateBet(id: string, data: UpdateBetRequest): Promise<BetResponse> {
    return apiClient.put(`${ENDPOINTS.BETS}/${id}`, data);
  },

  deleteBet(id: string): Promise<void> {
    return apiClient.delete(`${ENDPOINTS.BETS}/${id}`);
  },
};
