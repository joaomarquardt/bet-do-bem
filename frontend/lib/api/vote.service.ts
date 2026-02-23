import { apiClient } from './client';
import { Vote, UpdateVoteRequest } from '@/lib/types';

const ENDPOINTS = {
  VOTES: '/votes',
} as const;

export const voteService = {
  getAllVotes(): Promise<Vote[]> {
    return apiClient.get(ENDPOINTS.VOTES);
  },

  getVoteById(id: string): Promise<Vote> {
    return apiClient.get(`${ENDPOINTS.VOTES}/${id}`);
  },

  updateVote(id: string, data: UpdateVoteRequest): Promise<Vote> {
    return apiClient.put(`${ENDPOINTS.VOTES}/${id}`, data);
  },

  deleteVote(id: string): Promise<void> {
    return apiClient.delete(`${ENDPOINTS.VOTES}/${id}`);
  },
};
