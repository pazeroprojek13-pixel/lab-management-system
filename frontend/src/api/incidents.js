import apiClient from './client';
export const incidentsApi = {
    getAll: async (params) => {
        const response = await apiClient.get('/incidents', { params });
        return response.data;
    },
    getById: async (id) => {
        const response = await apiClient.get(`/incidents/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post('/incidents', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/incidents/${id}`, data);
        return response.data;
    },
    updateStatus: async (id, status, resolution) => {
        const response = await apiClient.patch(`/incidents/${id}/status`, { status, resolution });
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/incidents/${id}`);
        return response.data;
    },
};
//# sourceMappingURL=incidents.js.map