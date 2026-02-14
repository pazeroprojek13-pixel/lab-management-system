import { EquipmentStatus } from '@prisma/client';
export interface CreateEquipmentInput {
    code: string;
    name: string;
    category: string;
    brand?: string;
    serialNumber?: string;
    purchaseDate?: Date;
    warrantyEndDate?: Date;
    status?: EquipmentStatus;
    condition?: string;
    description?: string;
    labId: string;
    campusId: string;
}
export interface UpdateEquipmentInput {
    code?: string;
    name?: string;
    category?: string;
    brand?: string;
    serialNumber?: string;
    purchaseDate?: Date;
    warrantyEndDate?: Date;
    status?: EquipmentStatus;
    condition?: string;
    description?: string;
    labId?: string;
    campusId?: string;
}
export interface FindAllOptions {
    page?: number;
    limit?: number;
    campusId?: string;
    labId?: string;
    status?: EquipmentStatus;
    category?: string;
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
export declare class EquipmentService {
    findAll(options?: FindAllOptions): Promise<PaginatedResult<any>>;
    findById(id: string, includeDeleted?: boolean): Promise<any>;
    findByCodeAndCampus(code: string, campusId: string, includeDeleted?: boolean): Promise<any>;
    create(input: CreateEquipmentInput): Promise<any>;
    update(id: string, input: UpdateEquipmentInput, performedById?: string): Promise<any>;
    softDelete(id: string): Promise<any>;
    restore(id: string): Promise<any>;
    hardDelete(id: string): Promise<any>;
}
export declare const equipmentService: EquipmentService;
//# sourceMappingURL=equipment.service.d.ts.map