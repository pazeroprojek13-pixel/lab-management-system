import { Incident, IncidentStatus } from '../types';
export declare const incidentsApi: {
    getAll: (params?: {
        status?: string;
        labId?: string;
    }) => Promise<{
        incidents: Incident[];
    }>;
    getById: (id: string) => Promise<{
        incident: Incident;
    }>;
    create: (data: {
        title: string;
        description: string;
        equipmentId?: string;
        labId?: string;
    }) => Promise<{
        message: string;
        incident: Incident;
    }>;
    update: (id: string, data: Partial<Incident>) => Promise<{
        message: string;
        incident: Incident;
    }>;
    updateStatus: (id: string, status: IncidentStatus, resolution?: string) => Promise<{
        message: string;
        incident: Incident;
    }>;
    delete: (id: string) => Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=incidents.d.ts.map