import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from './auth.middleware';
export type { ExtendedRole } from '../lib/campusScope';
/**
 * Require specific roles (basic role check without campus)
 */
export declare function requireRole(...allowedRoles: Role[]): (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Require authentication only
 */
export declare function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void;
/**
 * Require SUPER_ADMIN or DEVELOPER (full access)
 */
export declare function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction): void;
/**
 * Require ADMIN with campus scope (admins can only access their campus)
 * Use this for routes that should filter by campus
 */
export declare function requireAdminWithCampus(req: AuthRequest, res: Response, next: NextFunction): void;
/**
 * Middleware to check campus access for a specific resource
 * Use after requireAuth, before controller
 */
export declare function checkCampusAccess(getResourceCampusId?: (req: AuthRequest) => string | undefined, getResourceUserId?: (req: AuthRequest) => string | undefined): (req: AuthRequest, res: Response, next: NextFunction) => void;
/**
 * Require ownership or elevated privileges
 * Users can only access their own records unless they are admin/super_admin/developer
 */
export declare function requireOwnershipOrElevated(getResourceUserId: (req: AuthRequest) => string | undefined): (req: AuthRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=role.middleware.d.ts.map