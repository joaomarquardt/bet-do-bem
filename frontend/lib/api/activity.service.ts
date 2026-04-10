import { apiClient } from './client';
import { CreatedActivityResponse, CreateActivityRequest, UpdateActivityRequest, ActivityResponse } from '@/lib/types';

const ENDPOINTS = {
  ACTIVITIES: '/api/activities',
} as const;

export const activityService = {
  getAllActivities(): Promise<ActivityResponse[]> {
    return apiClient.get(ENDPOINTS.ACTIVITIES);
  },

  createActivity(data: CreateActivityRequest): Promise<CreatedActivityResponse> {
    return apiClient.post(ENDPOINTS.ACTIVITIES, data);
  },

  getActivityById(id: string): Promise<ActivityResponse> {
    return apiClient.get(`${ENDPOINTS.ACTIVITIES}/${id}`);
  },

  updateActivity(id: string, data: UpdateActivityRequest): Promise<ActivityResponse> {
    return apiClient.put(`${ENDPOINTS.ACTIVITIES}/${id}`, data);
  },

  deleteActivity(id: string): Promise<void> {
    return apiClient.delete(`${ENDPOINTS.ACTIVITIES}/${id}`);
  },
};
