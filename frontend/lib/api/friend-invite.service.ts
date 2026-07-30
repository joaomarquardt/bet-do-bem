import { apiClient } from './client';
import { FriendInvite } from '@/lib/types';

const ENDPOINTS = {
  FRIEND_INVITES: '/api/friend-invites',
} as const;

export const friendInviteService = {
  getMyPendingInvites(): Promise<FriendInvite[]> {
    return apiClient.get(`${ENDPOINTS.FRIEND_INVITES}/me/pending`);
  },

  acceptInvite(inviteId: number): Promise<FriendInvite> {
    return apiClient.put(`${ENDPOINTS.FRIEND_INVITES}/${inviteId}/accept`, {});
  },

  declineInvite(inviteId: number): Promise<FriendInvite> {
    return apiClient.put(`${ENDPOINTS.FRIEND_INVITES}/${inviteId}/decline`, {});
  },
};
