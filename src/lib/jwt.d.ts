import { ExtendedRole } from '../middleware';
export interface JWTPayload {
    user_id: string;
    role: ExtendedRole;
    campus_id?: string;
}
export declare function generateToken(payload: JWTPayload): string;
export declare function verifyToken(token: string): JWTPayload;
//# sourceMappingURL=jwt.d.ts.map