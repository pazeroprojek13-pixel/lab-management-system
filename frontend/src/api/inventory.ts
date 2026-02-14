import apiClient from './client';
import type { Equipment, Lab } from '../types';

export const inventoryApi = {
  // Equipment
  getAllEquipment: async (params?: { labId?: string; status?: string }): Promise<{ equipments: Equipment[] }> => {
    const response = await apiClient.get('/inventory/equipment', { params });
    const payload = response.data?.data ?? response.data;
    return { equipments: payload?.equipments ?? payload ?? [] };
  },

  getEquipmentById: async (id: string): Promise<{ equipment: Equipment }> => {
    const response = await apiClient.get(`/inventory/equipment/${id}`);
    const payload = response.data?.data ?? response.data;
    return { equipment: payload?.equipment ?? payload };
  },

  createEquipment: async (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ message: string; equipment: Equipment }> => {
    const response = await apiClient.post('/inventory/equipment', data);
    const payload = response.data?.data ?? response.data;
    return {
      message: response.data?.message ?? 'Equipment created',
      equipment: payload?.equipment ?? payload,
    };
  },

  updateEquipment: async (id: string, data: Partial<Equipment>): Promise<{ message: string; equipment: Equipment }> => {
    const response = await apiClient.put(`/inventory/equipment/${id}`, data);
    const payload = response.data?.data ?? response.data;
    return {
      message: response.data?.message ?? 'Equipment updated',
      equipment: payload?.equipment ?? payload,
    };
  },

  deleteEquipment: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/inventory/equipment/${id}`);
    return response.data;
  },

  // Labs
  getAllLabs: async (): Promise<{ labs: Lab[] }> => {
    const response = await apiClient.get('/inventory/labs');
    const payload = response.data?.data ?? response.data;
    return { labs: payload?.labs ?? payload ?? [] };
  },

  getLabById: async (id: string): Promise<{ lab: Lab }> => {
    const response = await apiClient.get(`/inventory/labs/${id}`);
    const payload = response.data?.data ?? response.data;
    return { lab: payload?.lab ?? payload };
  },
};
