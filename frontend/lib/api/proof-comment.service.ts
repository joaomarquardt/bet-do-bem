import { apiClient } from './client';
import { Comment, CreateCommentRequest } from '@/lib/types';

const ENDPOINTS = {
  COMMENTS: (proofId: string) => `/api/proofs/${proofId}/comments`,
} as const;

export const proofCommentService = {
  getCommentsByProofId(proofId: string): Promise<Comment[]> {
    return apiClient.get(ENDPOINTS.COMMENTS(proofId));
  },

  addComment(proofId: string, data: CreateCommentRequest): Promise<Comment> {
    return apiClient.post(ENDPOINTS.COMMENTS(proofId), data);
  },
};
