import { apiClient } from './client';
import { FeedItem } from '@/lib/types';

const ENDPOINTS = {
  FEED: '/feed',
} as const;

export const feedService = {
  getMyFeed(userId: string): Promise<FeedItem[]> {
    return apiClient.get(`${ENDPOINTS.FEED}/home/${userId}`);
  },
};
