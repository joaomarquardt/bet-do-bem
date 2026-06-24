import { apiClient } from './client';
import { Proof, UpdateProofRequest, CreateVoteRequest, VotePercentageResponse } from '@/lib/types';

const ENDPOINTS = {
  PROOFS: '/api/proofs',
} as const;

export const proofService = {
  getAllProofs(): Promise<Proof[]> {
    return apiClient.get(ENDPOINTS.PROOFS);
  },

  getProofById(id: string): Promise<Proof> {
    return apiClient.get(`${ENDPOINTS.PROOFS}/${id}`);
  },

  voteInProof(id: string, data: CreateVoteRequest): Promise<VotePercentageResponse> {
    return apiClient.post(`${ENDPOINTS.PROOFS}/${id}/votes`, data);
  },

  updateProof(id: string, data: UpdateProofRequest): Promise<Proof> {
    return apiClient.put(`${ENDPOINTS.PROOFS}/${id}`, data);
  },

  deleteProof(id: string): Promise<void> {
    return apiClient.delete(`${ENDPOINTS.PROOFS}/${id}`);
  },
};
