import { LabStatus } from '@prisma/client';
export interface CreateLabInput {
    name: string;
    code: string;
    type?: string;
    capacity: number;
    location?: string;
    description?: string;
    campusId: string;
}
export interface UpdateLabInput {
    name?: string;
    code?: string;
    type?: string;
    capacity?: number;
    location?: string;
    description?: string;
    status?: LabStatus;
    campusId?: string;
}
export interface FindAllOptions {
    page?: number;
    limit?: number;
    campusId?: string;
    status?: LabStatus;
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
export declare class LabService {
    findAll(options?: FindAllOptions): Promise<PaginatedResult<any>>;
    findById(id: string, includeDeleted?: boolean): Promise<any>;
    findByCodeAndCampus(code: string, campusId: string, includeDeleted?: boolean): Promise<any>;
    create(input: CreateLabInput): Promise<any>;
    update(id: string, input: UpdateLabInput): Promise<any>;
    softDelete(id: string): Promise<any>;
    restore(id: string): Promise<any>;
    hardDelete(id: string): Promise<any>;
}
export declare const labService: LabService;
//# sourceMappingURL=lab.service.d.ts.map