import apiClient from './client';
export const eventsApi = {
    getAll: async () => {
        const response = await apiClient.get('/events');
        return response.data;
    },
    getById: async (id) => {
        const response = await apiClient.get(`/events/${id}`);
        return response.data;
    },
    create: async (data) => {
        const response = await apiClient.post('/events', data);
        return response.data;
    },
    update: async (id, data) => {
        const response = await apiClient.put(`/events/${id}`, data);
        return response.data;
    },
    delete: async (id) => {
        const response = await apiClient.delete(`/events/${id}`);
        return response.data;
    },
};
//# sourceMappingURL=events.js.map