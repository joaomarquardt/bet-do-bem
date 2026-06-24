import { apiClient } from './client';
import { CommentResponse, CreateCommentRequest, ContextType, PaginatedResponse } from '@/lib/types';

const ENTITY_PATH_MAP: Record<ContextType, string> = {
  ACTIVITY: '/api/activities',
  BET: '/api/bets',
  CHALLENGE: '/api/challenges',
};

export const commentService = {
  addComment(
    entityType: ContextType,
    entityId: string,
    content: string,
  ): Promise<CommentResponse> {
    const basePath = ENTITY_PATH_MAP[entityType];
    const body: CreateCommentRequest = { content };
    return apiClient.post(`${basePath}/${entityId}/comments`, body);
  },

  getComments(
    entityType: ContextType,
    entityId: string,
    page: number = 0,
    size: number = 5,
  ): Promise<PaginatedResponse<CommentResponse>> {
    const basePath = ENTITY_PATH_MAP[entityType];
    return apiClient.get(`${basePath}/${entityId}/comments`, {
      params: { page, size },
    });
  },
};
