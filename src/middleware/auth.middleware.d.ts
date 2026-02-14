import { Request, Response, NextFunction } from 'express';
import { JWTPayload } from '../lib/jwt';
export interface AuthRequest extends Request {
    user?: JWTPayload;
}
export declare function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.middleware.d.ts.map