import { IncidentStatus, ProblemScope, Severity } from '@prisma/client';
export interface CreateIncidentInput {
    problemScope: ProblemScope;
    category: string;
    severity: Severity;
    description: string;
    equipmentId?: string;
    labId?: string;
    campusId: string;
    reportedById: string;
}
export interface UpdateIncidentInput {
    problemScope?: ProblemScope;
    category?: string;
    severity?: Severity;
    description?: string;
    rootCause?: string;
    correctiveAction?: string;
    preventiveAction?: string;
    equipmentId?: string;
    labId?: string;
    campusId?: string;
}
export interface UpdateStatusInput {
    status: IncidentStatus;
    assignedToId?: string;
    rootCause?: string;
    correctiveAction?: string;
    preventiveAction?: string;
}
export interface FindAllOptions {
    page?: number;
    limit?: number;
    status?: IncidentStatus;
    severity?: Severity;
    labId?: string;
    equipmentId?: string;
    campusId?: string;
    reportedById?: string;
    assignedToId?: string;
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
export declare class IncidentService {
    findAll(options?: FindAllOptions): Promise<PaginatedResult<any>>;
    findById(id: string, includeDeleted?: boolean): Promise<any>;
    create(input: CreateIncidentInput): Promise<any>;
    update(id: string, input: UpdateIncidentInput): Promise<any>;
    updateStatus(id: string, input: UpdateStatusInput, performedById?: string): Promise<any>;
    softDelete(id: string): Promise<any>;
    restore(id: string): Promise<any>;
    hardDelete(id: string): Promise<any>;
}
export declare const incidentService: IncidentService;
//# sourceMappingURL=incident.service.d.ts.map