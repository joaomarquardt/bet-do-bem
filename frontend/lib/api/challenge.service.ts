import { apiClient } from './client';
import { Challenge, CreateChallengeRequest, UpdateChallengeRequest, CreateProofRequest } from '@/lib/types';

const ENDPOINTS = {
  CHALLENGES: '/challenges',
} as const;

export const challengeService = {
  getAllChallenges(): Promise<Challenge[]> {
    return apiClient.get(ENDPOINTS.CHALLENGES);
  },

  createChallenge(data: CreateChallengeRequest): Promise<Challenge> {
    return apiClient.post(ENDPOINTS.CHALLENGES, data);
  },

  addProofToChallenge(id: string, data: CreateProofRequest): Promise<Challenge> {
    return apiClient.post(`${ENDPOINTS.CHALLENGES}/${id}/proofs`, data);
  },

  acceptChallenge(id: string): Promise<Challenge> {
    return apiClient.post(`${ENDPOINTS.CHALLENGES}/${id}/accept`);
  },

  declineChallenge(id: string): Promise<Challenge> {
    return apiClient.post(`${ENDPOINTS.CHALLENGES}/${id}/decline`);
  },

  getChallengeById(id: string): Promise<Challenge> {
    return apiClient.get(`${ENDPOINTS.CHALLENGES}/${id}`);
  },

  updateChallenge(id: string, data: UpdateChallengeRequest): Promise<Challenge> {
    return apiClient.put(`${ENDPOINTS.CHALLENGES}/${id}`, data);
  },

  deleteChallenge(id: string): Promise<void> {
    return apiClient.delete(`${ENDPOINTS.CHALLENGES}/${id}`);
  },
};
