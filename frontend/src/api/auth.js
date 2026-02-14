import apiClient from './client';
export const authApi = {
    login: async (data) => {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
    },
    register: async (data) => {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
    },
    me: async () => {
        const response = await apiClient.get('/auth/me');
        return response.data;
    },
};
//# sourceMappingURL=auth.js.map