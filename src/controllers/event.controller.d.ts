import { Response } from 'express';
import { AuthRequest } from '../middleware';
export declare class EventController {
    findAll(req: AuthRequest, res: Response): Promise<void>;
    findById(req: AuthRequest, res: Response): Promise<void>;
    create(req: AuthRequest, res: Response): Promise<void>;
    update(req: AuthRequest, res: Response): Promise<void>;
    delete(req: AuthRequest, res: Response): Promise<void>;
}
export declare const eventController: EventController;
//# sourceMappingURL=event.controller.d.ts.map