import apiClient from './client';
import type { Maintenance } from '../types';

export const maintenanceApi = {
  getAll: async (params?: { status?: string; labId?: string }): Promise<{ maintenances: Maintenance[] }> => {
    const response = await apiClient.get('/maintenance', { params });
    const payload = response.data?.data ?? response.data;
    return { maintenances: payload?.maintenances ?? payload ?? [] };
  },

  getById: async (id: string): Promise<{ maintenance: Maintenance }> => {
    const response = await apiClient.get(`/maintenance/${id}`);
    const payload = response.data?.data ?? response.data;
    return { maintenance: payload?.maintenance ?? payload };
  },

  create: async (data: { title: string; description: string; scheduledDate: string; equipmentId?: string; labId?: string }): Promise<{ message: string; maintenance: Maintenance }> => {
    const response = await apiClient.post('/maintenance', data);
    const payload = response.data?.data ?? response.data;
    return {
      message: response.data?.message ?? 'Maintenance created',
      maintenance: payload?.maintenance ?? payload,
    };
  },

  update: async (id: string, data: Partial<Maintenance>): Promise<{ message: string; maintenance: Maintenance }> => {
    const response = await apiClient.put(`/maintenance/${id}`, data);
    const payload = response.data?.data ?? response.data;
    return {
      message: response.data?.message ?? 'Maintenance updated',
      maintenance: payload?.maintenance ?? payload,
    };
  },

  complete: async (id: string, notes?: string): Promise<{ message: string; maintenance: Maintenance }> => {
    const response = await apiClient.patch(`/maintenance/${id}/complete`, { notes });
    const payload = response.data?.data ?? response.data;
    return {
      message: response.data?.message ?? 'Maintenance completed',
      maintenance: payload?.maintenance ?? payload,
    };
  },

  cancel: async (id: string, reason?: string): Promise<{ message: string; maintenance: Maintenance }> => {
    const response = await apiClient.patch(`/maintenance/${id}/cancel`, { reason });
    const payload = response.data?.data ?? response.data;
    return {
      message: response.data?.message ?? 'Maintenance cancelled',
      maintenance: payload?.maintenance ?? payload,
    };
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/maintenance/${id}`);
    return response.data;
  },
};
