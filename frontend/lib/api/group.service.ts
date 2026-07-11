import { apiClient } from './client';
import { Group, CreateGroupRequest, GroupResponse } from '@/lib/types';

const ENDPOINTS = {
  GROUPS: '/api/groups',
} as const;

export const groupService = {
  getAllGroups(): Promise<Group[]> {
    return apiClient.get(ENDPOINTS.GROUPS);
  },

  getMyGroups(): Promise<GroupResponse[]> {
    return apiClient.get(`${ENDPOINTS.GROUPS}/my`);
  },

  createGroup(data: CreateGroupRequest): Promise<GroupResponse> {
    return apiClient.post(ENDPOINTS.GROUPS, data);
  },

  getGroupById(id: string | number): Promise<GroupResponse> {
    return apiClient.get(`${ENDPOINTS.GROUPS}/${id}`);
  },

  updateGroup(id: string | number, data: Partial<CreateGroupRequest>): Promise<GroupResponse> {
    return apiClient.put(`${ENDPOINTS.GROUPS}/${id}`, data);
  },

  deleteGroup(id: string | number): Promise<void> {
    return apiClient.delete(`${ENDPOINTS.GROUPS}/${id}`);
  },

  leaveGroup(groupId: number): Promise<void> {
    return apiClient.delete(`${ENDPOINTS.GROUPS}/${groupId}/members/me`);
  },

  removeMember(groupId: number, memberId: number): Promise<void> {
    return apiClient.delete(`${ENDPOINTS.GROUPS}/${groupId}/members/${memberId}`);
  },

  sendInvites(groupId: number, inviteeIds: number[]): Promise<any[]> {
    return apiClient.post(`${ENDPOINTS.GROUPS}/${groupId}/invites`, { inviteeIds });
  },

  getGroupInvites(groupId: number): Promise<any[]> {
    return apiClient.get(`${ENDPOINTS.GROUPS}/${groupId}/invites`);
  },
};
