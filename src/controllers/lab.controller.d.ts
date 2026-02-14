import { Response } from 'express';
import { AuthRequest } from '../middleware';
export declare class LabController {
    findAll(req: AuthRequest, res: Response): Promise<void>;
    findById(req: AuthRequest, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
    restore(req: AuthRequest, res: Response): Promise<void>;
}
export declare const labController: LabController;
//# sourceMappingURL=lab.controller.d.ts.map