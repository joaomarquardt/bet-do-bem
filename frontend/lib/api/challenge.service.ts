import { apiClient } from './client';
import { ChallengeResponse, CreateChallengeRequest, UpdateChallengeRequest, CreateProofRequest, ProofUploadResponse } from '@/lib/types';

const ENDPOINTS = {
  CHALLENGES: '/api/challenges',
} as const;

export const challengeService = {
  getAllChallenges(): Promise<ChallengeResponse[]> {
    return apiClient.get(ENDPOINTS.CHALLENGES);
  },

  createChallenge(data: CreateChallengeRequest): Promise<ChallengeResponse> {
    return apiClient.post(ENDPOINTS.CHALLENGES, data);
  },

  buyChallengeRight(): Promise<void> {
    return apiClient.post(`${ENDPOINTS.CHALLENGES}/buy`);
  },

  addProofToChallenge(id: string, data: CreateProofRequest): Promise<ProofUploadResponse> {
    return apiClient.post(`${ENDPOINTS.CHALLENGES}/${id}/proofs`, data);
  },

  acceptChallenge(id: string): Promise<ChallengeResponse> {
    return apiClient.post(`${ENDPOINTS.CHALLENGES}/${id}/accept`);
  },

  declineChallenge(id: string): Promise<ChallengeResponse> {
    return apiClient.post(`${ENDPOINTS.CHALLENGES}/${id}/decline`);
  },

  getChallengeById(id: string): Promise<ChallengeResponse> {
    return apiClient.get(`${ENDPOINTS.CHALLENGES}/${id}`);
  },

  updateChallenge(id: string, data: UpdateChallengeRequest): Promise<ChallengeResponse> {
    return apiClient.put(`${ENDPOINTS.CHALLENGES}/${id}`, data);
  },

  deleteChallenge(id: string): Promise<void> {
    return apiClient.delete(`${ENDPOINTS.CHALLENGES}/${id}`);
  },
};
