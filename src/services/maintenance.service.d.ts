import { MaintenanceStatus } from '@prisma/client';
export interface CreateMaintenanceInput {
    title: string;
    description?: string;
    incidentId: string;
    equipmentId: string;
    campusId: string;
    createdById: string;
    vendorName?: string;
    labId?: string;
    scheduledDate?: Date;
}
export interface UpdateMaintenanceInput {
    title?: string;
    description?: string;
    vendorName?: string;
    cost?: number;
    resolutionNotes?: string;
    notes?: string;
    scheduledDate?: Date;
}
export interface UpdateStatusInput {
    status: MaintenanceStatus;
    /** Required when transitioning to SENT */
    vendorName?: string;
    /** Required when transitioning to RETURNED: 'ACTIVE' | 'DAMAGED' */
    equipmentOutcome?: 'ACTIVE' | 'DAMAGED';
    cost?: number;
    resolutionNotes?: string;
}
export interface FindAllOptions {
    page?: number;
    limit?: number;
    status?: MaintenanceStatus;
    campusId?: string;
    equipmentId?: string;
    incidentId?: string;
    createdById?: string;
    includeDeleted?: boolean;
}
export interface PaginatedResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export declare class MaintenanceService {
    findAll(options?: FindAllOptions): Promise<PaginatedResult<any>>;
    findById(id: string, includeDeleted?: boolean): Promise<any>;
    create(input: CreateMaintenanceInput): Promise<any>;
    update(id: string, input: UpdateMaintenanceInput): Promise<any>;
    /**
     * Vendor lifecycle transition.
     * Side effects:
     *   PENDING → SENT:     equipment.status = MAINTENANCE
     *   SENT   → RETURNED:  equipment.status = ACTIVE | DAMAGED
     */
    updateStatus(id: string, input: UpdateStatusInput, performedById?: string): Promise<any>;
    softDelete(id: string): Promise<any>;
    restore(id: string): Promise<any>;
}
export declare const maintenanceService: MaintenanceService;
//# sourceMappingURL=maintenance.service.d.ts.map