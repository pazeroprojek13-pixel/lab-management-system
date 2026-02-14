import { Response } from 'express';
import { AuthRequest } from '../middleware';
export declare class NotificationController {
    findAll(req: AuthRequest, res: Response): Promise<void>;
    markRead(req: AuthRequest, res: Response): Promise<void>;
}
export declare const notificationController: NotificationController;
//# sourceMappingURL=notification.controller.d.ts.map