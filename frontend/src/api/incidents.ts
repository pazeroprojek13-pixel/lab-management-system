import apiClient from './client';
import type { Incident, IncidentStatus } from '../types';

export const incidentsApi = {
  getAll: async (params?: { status?: string; labId?: string }): Promise<{ incidents: Incident[] }> => {
    const response = await apiClient.get('/incidents', { params });
    const payload = response.data?.data ?? response.data;
    return { incidents: payload?.incidents ?? payload ?? [] };
  },

  getById: async (id: string): Promise<{ incident: Incident }> => {
    const response = await apiClient.get(`/incidents/${id}`);
    const payload = response.data?.data ?? response.data;
    return { incident: payload?.incident ?? payload };
  },

  create: async (data: { title: string; description: string; equipmentId?: string; labId?: string }): Promise<{ message: string; incident: Incident }> => {
    const response = await apiClient.post('/incidents', data);
    const payload = response.data?.data ?? response.data;
    return {
      message: response.data?.message ?? 'Incident created',
      incident: payload?.incident ?? payload,
    };
  },

  update: async (id: string, data: Partial<Incident>): Promise<{ message: string; incident: Incident }> => {
    const response = await apiClient.put(`/incidents/${id}`, data);
    const payload = response.data?.data ?? response.data;
    return {
      message: response.data?.message ?? 'Incident updated',
      incident: payload?.incident ?? payload,
    };
  },

  updateStatus: async (id: string, status: IncidentStatus, resolution?: string): Promise<{ message: string; incident: Incident }> => {
    const response = await apiClient.patch(`/incidents/${id}/status`, { status, resolution });
    const payload = response.data?.data ?? response.data;
    return {
      message: response.data?.message ?? 'Incident status updated',
      incident: payload?.incident ?? payload,
    };
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/incidents/${id}`);
    return response.data;
  },
};
