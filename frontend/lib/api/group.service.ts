import { apiClient } from './client';
import { Group, CreateGroupRequest } from '@/lib/types';

const ENDPOINTS = {
  GROUPS: '/api/groups',
} as const;

export const groupService = {
  getAllGroups(): Promise<Group[]> {
    return apiClient.get(ENDPOINTS.GROUPS);
  },

  createGroup(data: CreateGroupRequest): Promise<Group> {
    return apiClient.post(ENDPOINTS.GROUPS, data);
  },

  getGroupById(id: string): Promise<Group> {
    return apiClient.get(`${ENDPOINTS.GROUPS}/${id}`);
  },

  updateGroup(id: string, data: Partial<CreateGroupRequest>): Promise<Group> {
    return apiClient.put(`${ENDPOINTS.GROUPS}/${id}`, data);
  },

  deleteGroup(id: string): Promise<void> {
    return apiClient.delete(`${ENDPOINTS.GROUPS}/${id}`);
  },
};
