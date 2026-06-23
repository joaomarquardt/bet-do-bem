import { apiClient } from './client';
import { FeedItemResponse } from '@/lib/types';

const ENDPOINTS = {
  FEED: '/api/feed',
} as const;

export const feedService = {
  getMyFeed(): Promise<FeedItemResponse[]> {
    return apiClient.get(`${ENDPOINTS.FEED}/me/home`);
  },
  getMyPendingInvites(): Promise<FeedItemResponse[]> {
    return apiClient.get(`${ENDPOINTS.FEED}/me/pending-invites`);
  },
  getMyInProgressItems(): Promise<FeedItemResponse[]> {
    return apiClient.get(`${ENDPOINTS.FEED}/me/in-progress-items`);
  },
  getMyWaitingOpponentAcceptanceItems(): Promise<FeedItemResponse[]> {
    return apiClient.get(`${ENDPOINTS.FEED}/me/waiting-opponent-acceptance`);
  },
};
