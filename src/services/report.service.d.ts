import { ProblemScope, Severity } from '@prisma/client';
export type AgingCategory = '0-24h' | '24-72h' | '3-7d' | '>7d';
export interface IncidentSummaryResult {
    totalIncidents: number;
    byStatus: {
        open: number;
        in_progress: number;
        resolved: number;
        verified: number;
        closed: number;
    };
    bySeverity: Array<{
        severity: Severity;
        count: number;
    }>;
    byProblemScope: Array<{
        problemScope: ProblemScope;
        count: number;
    }>;
    aging: {
        byCategory: Array<{
            agingCategory: AgingCategory;
            count: number;
        }>;
        details: Array<{
            incidentId: string;
            openHours: number;
            agingCategory: AgingCategory;
        }>;
    };
}
export interface EquipmentHealthResult {
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
export interface MaintenanceCostSummaryResult {
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
export interface CapaExportRow {
    incidentId: string;
    severity: string;
    rootCause: string;
    correctiveAction: string;
    preventiveAction: string;
    resolvedAt: string;
    verifiedAt: string;
}
export declare class ReportService {
    getIncidentSummary(campusId?: string): Promise<IncidentSummaryResult>;
    getEquipmentHealth(campusId?: string): Promise<EquipmentHealthResult>;
    getMaintenanceCostSummary(campusId?: string): Promise<MaintenanceCostSummaryResult>;
    getCapaExportRows(campusId?: string): Promise<CapaExportRow[]>;
}
export declare const reportService: ReportService;
//# sourceMappingURL=report.service.d.ts.map