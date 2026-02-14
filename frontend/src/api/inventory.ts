import apiClient from './client';
import { Equipment, Lab } from '../types';

export const inventoryApi = {
  // Equipment
  getAllEquipment: async (params?: { labId?: string; status?: string }): Promise<{ equipments: Equipment[] }> => {
    const response = await apiClient.get('/inventory/equipment', { params });
    return response.data;
  },

  getEquipmentById: async (id: string): Promise<{ equipment: Equipment }> => {
    const response = await apiClient.get(`/inventory/equipment/${id}`);
    return response.data;
  },

  createEquipment: async (data: Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ message: string; equipment: Equipment }> => {
    const response = await apiClient.post('/inventory/equipment', data);
    return response.data;
  },

  updateEquipment: async (id: string, data: Partial<Equipment>): Promise<{ message: string; equipment: Equipment }> => {
    const response = await apiClient.put(`/inventory/equipment/${id}`, data);
    return response.data;
  },

  deleteEquipment: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/inventory/equipment/${id}`);
    return response.data;
  },

  // Labs
  getAllLabs: async (): Promise<{ labs: Lab[] }> => {
    const response = await apiClient.get('/inventory/labs');
    return response.data;
  },

  getLabById: async (id: string): Promise<{ lab: Lab }> => {
    const response = await apiClient.get(`/inventory/labs/${id}`);
    return response.data;
  },
};
