import apiClient from './client';
import { Maintenance, MaintenanceStatus } from '../types';

export const maintenanceApi = {
  getAll: async (params?: { status?: string; labId?: string }): Promise<{ maintenances: Maintenance[] }> => {
    const response = await apiClient.get('/maintenance', { params });
    return response.data;
  },

  getById: async (id: string): Promise<{ maintenance: Maintenance }> => {
    const response = await apiClient.get(`/maintenance/${id}`);
    return response.data;
  },

  create: async (data: { title: string; description: string; scheduledDate: string; equipmentId?: string; labId?: string }): Promise<{ message: string; maintenance: Maintenance }> => {
    const response = await apiClient.post('/maintenance', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Maintenance>): Promise<{ message: string; maintenance: Maintenance }> => {
    const response = await apiClient.put(`/maintenance/${id}`, data);
    return response.data;
  },

  complete: async (id: string, notes?: string): Promise<{ message: string; maintenance: Maintenance }> => {
    const response = await apiClient.patch(`/maintenance/${id}/complete`, { notes });
    return response.data;
  },

  cancel: async (id: string, reason?: string): Promise<{ message: string; maintenance: Maintenance }> => {
    const response = await apiClient.patch(`/maintenance/${id}/cancel`, { reason });
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/maintenance/${id}`);
    return response.data;
  },
};
