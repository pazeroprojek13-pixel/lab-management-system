import { Request, Response } from 'express';
import { AuthRequest } from '../middleware';
export declare class CampusController {
    findAll(req: Request, res: Response): Promise<void>;
    findById(req: Request, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
    restore(req: AuthRequest, res: Response): Promise<void>;
}
export declare const campusController: CampusController;
//# sourceMappingURL=campus.controller.d.ts.map