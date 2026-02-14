import { Response } from 'express';
import { AuthRequest } from '../middleware';
export declare class MaintenanceController {
    findAll(req: AuthRequest, res: Response): Promise<void>;
    findById(req: AuthRequest, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    updateStatus(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
    restore(req: AuthRequest, res: Response): Promise<void>;
}
export declare const maintenanceController: MaintenanceController;
//# sourceMappingURL=maintenance.controller.d.ts.map