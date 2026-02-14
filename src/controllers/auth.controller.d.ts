import { Request, Response } from 'express';
import { AuthRequest } from '../middleware';
export declare class AuthController {
    login(req: Request, res: Response): Promise<void>;
    register(req: AuthRequest, res: Response): Promise<void>;
    me(req: AuthRequest, res: Response): Promise<void>;
    updateUser(req: AuthRequest, res: Response): Promise<void>;
    deleteUser(req: AuthRequest, res: Response): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map