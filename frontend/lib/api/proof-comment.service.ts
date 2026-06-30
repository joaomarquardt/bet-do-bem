import { apiClient } from './client';
import { CommentResponse, CreateCommentRequest } from '@/lib/types';

const ENDPOINTS = {
  COMMENTS: (proofId: string) => `/api/proofs/${proofId}/comments`,
} as const;

export const proofCommentService = {
  getCommentsByProofId(proofId: string): Promise<CommentResponse[]> {
    return apiClient.get(ENDPOINTS.COMMENTS(proofId));
  },

  addComment(proofId: string, data: CreateCommentRequest): Promise<CommentResponse> {
    return apiClient.post(ENDPOINTS.COMMENTS(proofId), data);
  },
};
