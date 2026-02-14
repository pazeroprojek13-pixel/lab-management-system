import apiClient from './client';
import type { Event } from '../types';

export const eventsApi = {
  getAll: async (): Promise<{ events: Event[] }> => {
    const response = await apiClient.get('/events');
    const payload = response.data?.data ?? response.data;
    return { events: payload?.events ?? payload ?? [] };
  },

  getById: async (id: string): Promise<{ event: Event }> => {
    const response = await apiClient.get(`/events/${id}`);
    const payload = response.data?.data ?? response.data;
    return { event: payload?.event ?? payload };
  },

  create: async (data: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'createdById'>): Promise<{ message: string; event: Event }> => {
    const response = await apiClient.post('/events', data);
    const payload = response.data?.data ?? response.data;
    return {
      message: response.data?.message ?? 'Event created',
      event: payload?.event ?? payload,
    };
  },

  update: async (id: string, data: Partial<Event>): Promise<{ message: string; event: Event }> => {
    const response = await apiClient.put(`/events/${id}`, data);
    const payload = response.data?.data ?? response.data;
    return {
      message: response.data?.message ?? 'Event updated',
      event: payload?.event ?? payload,
    };
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  },
};
