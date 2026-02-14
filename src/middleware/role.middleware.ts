import { Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from './auth.middleware';
import { checkResourceAccess, ExtendedRole } from '../lib/campusScope';

// Re-export ExtendedRole for use in controllers
export type { ExtendedRole } from '../lib/campusScope';

/**
 * Require specific roles (basic role check without campus)
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    // Cast for comparison since ExtendedRole includes all Role values
    if (!allowedRoles.includes(req.user.role as Role)) {
      res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      return;
    }

    next();
  };
}

/**
 * Require authentication only
 */
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    return;
  }
  next();
}

/**
 * Require SUPER_ADMIN or DEVELOPER (full access)
 */
export function requireSuperAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    return;
  }

  const role = req.user.role as ExtendedRole;
  if (role !== 'SUPER_ADMIN' && role !== 'DEVELOPER') {
    res.status(403).json({ error: 'Forbidden: Super Admin access required' });
    return;
  }

  next();
}

/**
 * Require ADMIN with campus scope (admins can only access their campus)
 * Use this for routes that should filter by campus
 */
export function requireAdminWithCampus(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    return;
  }

  const allowedRoles: ExtendedRole[] = ['ADMIN', 'SUPER_ADMIN', 'DEVELOPER'];
  const role = req.user.role as ExtendedRole;

  if (!allowedRoles.includes(role)) {
    res.status(403).json({ error: 'Forbidden: Admin access required' });
    return;
  }

  // Store campus scope info for controllers
  (req as any).campusScope = {
    role,
    campus_id: req.user.campus_id,
    user_id: req.user.user_id,
    isSuperAdmin: role === 'SUPER_ADMIN' || role === 'DEVELOPER',
  };

  next();
}

/**
 * Middleware to check campus access for a specific resource
 * Use after requireAuth, before controller
 */
export function checkCampusAccess(
  getResourceCampusId?: (req: AuthRequest) => string | undefined,
  getResourceUserId?: (req: AuthRequest) => string | undefined
) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    const resourceCampusId = getResourceCampusId?.(req);
    const resourceUserId = getResourceUserId?.(req);

    const access = checkResourceAccess(
      { ...req.user, campus_id: (req as any).campusScope?.campus_id },
      resourceCampusId,
      resourceUserId
    );

    if (!access.allowed) {
      res.status(403).json({ error: access.reason || 'Access denied' });
      return;
    }

    next();
  };
}

/**
 * Require ownership or elevated privileges
 * Users can only access their own records unless they are admin/super_admin/developer
 */
export function requireOwnershipOrElevated(
  getResourceUserId: (req: AuthRequest) => string | undefined
) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    const role = req.user.role as ExtendedRole;

    // Elevated roles bypass ownership check
    if (role === 'SUPER_ADMIN' || role === 'DEVELOPER' || role === 'ADMIN') {
      next();
      return;
    }

    // Regular users must own the resource
    const resourceUserId = getResourceUserId(req);
    if (resourceUserId && resourceUserId !== req.user.user_id) {
      res.status(403).json({ error: 'Access denied: not your record' });
      return;
    }

    next();
  };
}
