import { apiClient } from './client';
import { GroupInvite } from '@/lib/types';

const ENDPOINTS = {
  GROUP_INVITES: '/api/group-invites',
} as const;

export const groupInviteService = {
  getMyPendingInvites(): Promise<GroupInvite[]> {
    return apiClient.get(`${ENDPOINTS.GROUP_INVITES}/me/pending`);
  },

  acceptInvite(inviteId: number): Promise<GroupInvite> {
    return apiClient.put(`${ENDPOINTS.GROUP_INVITES}/${inviteId}/accept`, {});
  },

  declineInvite(inviteId: number): Promise<GroupInvite> {
    return apiClient.put(`${ENDPOINTS.GROUP_INVITES}/${inviteId}/decline`, {});
  },
};
