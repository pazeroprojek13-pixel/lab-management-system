import apiClient from './client';

export interface IncidentSummaryData {
  totalIncidents: number;
  byStatus: {
    open: number;
    in_progress: number;
    resolved: number;
    verified: number;
    closed: number;
  };
  bySeverity: Array<{ severity: string; count: number }>;
  byProblemScope: Array<{ problemScope: string; count: number }>;
  aging: {
    byCategory: Array<{ agingCategory: '0-24h' | '24-72h' | '3-7d' | '>7d'; count: number }>;
    details: Array<{ incidentId: string; openHours: number; agingCategory: string }>;
  };
}

export interface EquipmentHealthData {
  totalEquipment: number;
  byStatus: {
    active: number;
    damaged: number;
    maintenance: number;
    retired: number;
  };
  warrantyExpired: number;
  warrantyExpiringWithin30Days: number;
}

export interface MaintenanceCostData {
  totalCostPerCampus: Array<{
    campusId: string;
    campusName: string | null;
    campusCode: string | null;
    totalCost: number;
    mttrHours: number;
  }>;
  totalCostPerEquipment: Array<{
    equipmentId: string;
    equipmentName: string | null;
    equipmentCode: string | null;
    totalCost: number;
  }>;
  mttrHours: number;
}

export const reportsApi = {
  async getIncidentsSummary(): Promise<IncidentSummaryData> {
    const response = await apiClient.get('/reports/incidents-summary');
    return response.data.data;
  },

  async getEquipmentHealth(): Promise<EquipmentHealthData> {
    const response = await apiClient.get('/reports/equipment-health');
    return response.data.data;
  },

  async getMaintenanceCost(): Promise<MaintenanceCostData> {
    const response = await apiClient.get('/reports/maintenance-cost');
    return response.data.data;
  },
};
