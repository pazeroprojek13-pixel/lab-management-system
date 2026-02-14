import apiClient from './client';
export const reportsApi = {
    async getIncidentsSummary() {
        const response = await apiClient.get('/reports/incidents-summary');
        return response.data.data;
    },
    async getEquipmentHealth() {
        const response = await apiClient.get('/reports/equipment-health');
        return response.data.data;
    },
    async getMaintenanceCost() {
        const response = await apiClient.get('/reports/maintenance-cost');
        return response.data.data;
    },
};
//# sourceMappingURL=reports.js.map