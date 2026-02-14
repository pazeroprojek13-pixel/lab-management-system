import { Response } from 'express';
import { AuthRequest } from '../middleware';
export declare class InventoryController {
    findAllEquipment(req: AuthRequest, res: Response): Promise<void>;
    findEquipmentById(req: AuthRequest, res: Response): Promise<void>;
    createEquipment(req: AuthRequest, res: Response): Promise<void>;
    updateEquipment(req: AuthRequest, res: Response): Promise<void>;
    deleteEquipment(req: AuthRequest, res: Response): Promise<void>;
    findAllLabs(req: AuthRequest, res: Response): Promise<void>;
    findLabById(req: AuthRequest, res: Response): Promise<void>;
}
export declare const inventoryController: InventoryController;
//# sourceMappingURL=inventory.controller.d.ts.map