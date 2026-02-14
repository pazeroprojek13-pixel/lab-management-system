import { EquipmentStatus } from '@prisma/client';
export interface CreateEquipmentInput {
    name: string;
    code: string;
    category: string;
    description?: string;
    labId: string;
    status?: EquipmentStatus;
}
export interface UpdateEquipmentInput {
    name?: string;
    category?: string;
    description?: string;
    status?: EquipmentStatus;
    labId?: string;
}
export interface FindAllOptions {
    labId?: string;
    status?: EquipmentStatus;
    campusId?: string;
}
export interface FindAllLabsOptions {
    campusId?: string;
}
export declare class InventoryService {
    findAll(params?: FindAllOptions): Promise<any>;
    findById(id: string): Promise<any>;
    findByCode(code: string): Promise<any>;
    create(input: CreateEquipmentInput): Promise<any>;
    update(id: string, input: UpdateEquipmentInput, performedById?: string): Promise<any>;
    delete(id: string): Promise<any>;
    updateStatus(id: string, status: EquipmentStatus, performedById?: string): Promise<any>;
    findAllLabs(options?: FindAllLabsOptions): Promise<any>;
    findLabById(id: string): Promise<any>;
}
export declare const inventoryService: InventoryService;
//# sourceMappingURL=inventory.service.d.ts.map