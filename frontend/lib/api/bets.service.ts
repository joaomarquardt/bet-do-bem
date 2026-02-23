import { apiClient } from './client';
import { Bet, CreateBetRequest, PaginatedResponse, VoteRequest, UploadProofRequest } from '@/lib/types';

const ENDPOINTS = {
  FEED: '/feed',
  MY_BETS: '/bets/me',
  BETS: '/bets',
  VOTE: '/votes',
  PROOFS: '/proofs',
  ACCEPT: (id: string) => `/bets/${id}/accept`,
  DECLINE: (id: string) => `/bets/${id}/decline`,
} as const;

export const betsService = {
  async getFeed(page = 0, size = 10): Promise<PaginatedResponse<Bet>> {
    return apiClient.get<PaginatedResponse<Bet>>(ENDPOINTS.FEED, {
      params: { page, size },
    });
  },

  async getMyBets(page = 0, size = 20): Promise<PaginatedResponse<Bet>> {
    return apiClient.get<PaginatedResponse<Bet>>(ENDPOINTS.MY_BETS, {
      params: { page, size },
    });
  },

  async getBetById(id: string): Promise<Bet> {
    return apiClient.get<Bet>(`${ENDPOINTS.BETS}/${id}`);
  },

  async createBet(data: CreateBetRequest): Promise<Bet> {
    return apiClient.post<Bet>(ENDPOINTS.BETS, data);
  },

  async acceptBet(betId: string): Promise<Bet> {
    return apiClient.post<Bet>(ENDPOINTS.ACCEPT(betId));
  },

  async declineBet(betId: string): Promise<void> {
    return apiClient.post<void>(ENDPOINTS.DECLINE(betId));
  },

  async vote(data: VoteRequest): Promise<void> {
    return apiClient.post<void>(ENDPOINTS.VOTE, data);
  },

  async uploadProof(data: UploadProofRequest): Promise<void> {
    return apiClient.post<void>(ENDPOINTS.PROOFS, data);
  },
};
