import apiClient from './client';
export const inventoryApi = {
    // Equipment
    getAllEquipment: async (params) => {
        const response = await apiClient.get('/inventory/equipment', { params });
        return response.data;
    },
    getEquipmentById: async (id) => {
        const response = await apiClient.get(`/inventory/equipment/${id}`);
        return response.data;
    },
    createEquipment: async (data) => {
        const response = await apiClient.post('/inventory/equipment', data);
        return response.data;
    },
    updateEquipment: async (id, data) => {
        const response = await apiClient.put(`/inventory/equipment/${id}`, data);
        return response.data;
    },
    deleteEquipment: async (id) => {
        const response = await apiClient.delete(`/inventory/equipment/${id}`);
        return response.data;
    },
    // Labs
    getAllLabs: async () => {
        const response = await apiClient.get('/inventory/labs');
        return response.data;
    },
    getLabById: async (id) => {
        const response = await apiClient.get(`/inventory/labs/${id}`);
        return response.data;
    },
};
//# sourceMappingURL=inventory.js.map