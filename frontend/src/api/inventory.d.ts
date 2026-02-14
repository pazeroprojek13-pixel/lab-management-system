import { Equipment, Lab } from '../types';
export declare const inventoryApi: {
    getAllEquipment: (params?: {
        labId?: string;
        status?: string;
    }) => Promise<{
        equipments: Equipment[];
    }>;
    getEquipmentById: (id: string) => Promise<{
        equipment: Equipment;
    }>;
    createEquipment: (data: Omit<Equipment, "id" | "createdAt" | "updatedAt">) => Promise<{
        message: string;
        equipment: Equipment;
    }>;
    updateEquipment: (id: string, data: Partial<Equipment>) => Promise<{
        message: string;
        equipment: Equipment;
    }>;
    deleteEquipment: (id: string) => Promise<{
        message: string;
    }>;
    getAllLabs: () => Promise<{
        labs: Lab[];
    }>;
    getLabById: (id: string) => Promise<{
        lab: Lab;
    }>;
};
//# sourceMappingURL=inventory.d.ts.map