import { Response } from 'express';
import { AuthRequest } from '../middleware';
export declare class EquipmentController {
    findAll(req: AuthRequest, res: Response): Promise<void>;
    findById(req: AuthRequest, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
    restore(req: AuthRequest, res: Response): Promise<void>;
}
export declare const equipmentController: EquipmentController;
//# sourceMappingURL=equipment.controller.d.ts.map