import apiClient from './client';
import type { Incident, IncidentStatus } from '../types';

export const incidentsApi = {
  getAll: async (params?: { status?: string; labId?: string }): Promise<{ incidents: Incident[] }> => {
    const response = await apiClient.get('/incidents', { params });
    return response.data;
  },

  getById: async (id: string): Promise<{ incident: Incident }> => {
    const response = await apiClient.get(`/incidents/${id}`);
    return response.data;
  },

  create: async (data: { title: string; description: string; equipmentId?: string; labId?: string }): Promise<{ message: string; incident: Incident }> => {
    const response = await apiClient.post('/incidents', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Incident>): Promise<{ message: string; incident: Incident }> => {
    const response = await apiClient.put(`/incidents/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, status: IncidentStatus, resolution?: string): Promise<{ message: string; incident: Incident }> => {
    const response = await apiClient.patch(`/incidents/${id}/status`, { status, resolution });
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/incidents/${id}`);
    return response.data;
  },
};
