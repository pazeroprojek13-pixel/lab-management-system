import { Maintenance } from '../types';
export declare const maintenanceApi: {
    getAll: (params?: {
        status?: string;
        labId?: string;
    }) => Promise<{
        maintenances: Maintenance[];
    }>;
    getById: (id: string) => Promise<{
        maintenance: Maintenance;
    }>;
    create: (data: {
        title: string;
        description: string;
        scheduledDate: string;
        equipmentId?: string;
        labId?: string;
    }) => Promise<{
        message: string;
        maintenance: Maintenance;
    }>;
    update: (id: string, data: Partial<Maintenance>) => Promise<{
        message: string;
        maintenance: Maintenance;
    }>;
    complete: (id: string, notes?: string) => Promise<{
        message: string;
        maintenance: Maintenance;
    }>;
    cancel: (id: string, reason?: string) => Promise<{
        message: string;
        maintenance: Maintenance;
    }>;
    delete: (id: string) => Promise<{
        message: string;
    }>;
};
//# sourceMappingURL=maintenance.d.ts.map