import apiClient from './client';
export const maintenanceApi = {
    getAll: async (params) => {
        const response = await apiClient.get('/maintenance', { params });
        return response.data;
    },
    getById: async (id) => {
        const response = await apiClient.get(`/maintenance/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post('/maintenance', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/maintenance/${id}`, data);
        return response.data;
    },
    complete: async (id, notes) => {
        const response = await apiClient.patch(`/maintenance/${id}/complete`, { notes });
        return response.data;
    },
    cancel: async (id, reason) => {
        const response = await apiClient.patch(`/maintenance/${id}/cancel`, { reason });
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/maintenance/${id}`);
        return response.data;
    },
};
//# sourceMappingURL=maintenance.js.map