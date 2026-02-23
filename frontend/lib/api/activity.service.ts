import { apiClient } from './client';
import { Activity, CreateActivityRequest, UpdateActivityRequest, CreateProofRequest } from '@/lib/types';

const ENDPOINTS = {
  ACTIVITIES: '/activities',
} as const;

export const activityService = {
  getAllActivities(): Promise<Activity[]> {
    return apiClient.get(ENDPOINTS.ACTIVITIES);
  },

  createActivity(data: CreateActivityRequest): Promise<Activity> {
    return apiClient.post(ENDPOINTS.ACTIVITIES, data);
  },

  addProofToActivity(id: string, data: CreateProofRequest): Promise<Activity> {
    return apiClient.post(`${ENDPOINTS.ACTIVITIES}/${id}/proofs`, data);
  },

  getActivityById(id: string): Promise<Activity> {
    return apiClient.get(`${ENDPOINTS.ACTIVITIES}/${id}`);
  },

  updateActivity(id: string, data: UpdateActivityRequest): Promise<Activity> {
    return apiClient.put(`${ENDPOINTS.ACTIVITIES}/${id}`, data);
  },

  deleteActivity(id: string): Promise<void> {
    return apiClient.delete(`${ENDPOINTS.ACTIVITIES}/${id}`);
  },
};
