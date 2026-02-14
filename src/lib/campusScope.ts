import { Prisma } from '@prisma/client';
import { JWTPayload } from './jwt';

// Extended roles for campus-based access control
export type ExtendedRole = 'SUPER_ADMIN' | 'DEVELOPER' | 'ADMIN' | 'LAB_ASSISTANT' | 'LECTURER' | 'STUDENT';

export interface CampusScopeOptions {
  user: JWTPayload;
  resourceCampusId?: string;
  resourceUserId?: string;
}

/**
 * Determines if user has access based on campus scope
 */
export function hasCampusAccess(options: CampusScopeOptions): boolean {
  const { user, resourceCampusId, resourceUserId } = options;
  const role = user.role as ExtendedRole;

  // DEVELOPER: Bypass all restrictions
  if (role === 'DEVELOPER') {
    return true;
  }

  // SUPER_ADMIN: Access all campuses
  if (role === 'SUPER_ADMIN') {
    return true;
  }

  // ADMIN: Can only access their own campus
  if (role === 'ADMIN') {
    if (!resourceCampusId) return true; // No campus restriction on resource
    return resourceCampusId === user.campus_id;
  }

  // USER (LAB_ASSISTANT, LECTURER, STUDENT): Can only access their own records
  if (resourceUserId) {
    return resourceUserId === user.user_id;
  }

  // If no specific resource user, check campus
  if (resourceCampusId) {
    return resourceCampusId === user.campus_id;
  }

  return true;
}

/**
 * Builds Prisma where clause for campus scoping
 * Use this helper in service layer to filter queries
 */
export function buildCampusWhereClause<T extends Record<string, unknown>>(
  user: JWTPayload,
  baseWhere: T = {} as T,
  campusIdField: string = 'campusId'
): T {
  const role = user.role as ExtendedRole;

  // DEVELOPER and SUPER_ADMIN: No restrictions
  if (role === 'DEVELOPER' || role === 'SUPER_ADMIN') {
    return baseWhere;
  }

  // ADMIN: Filter by their campus
  if (role === 'ADMIN' && user.campus_id) {
    return {
      ...baseWhere,
      [campusIdField]: user.campus_id,
    } as T;
  }

  // Regular users: Will need user-based filtering at service level
  return baseWhere;
}

/**
 * Middleware helper to check campus access for single resource
 * Returns 403 if access denied
 */
export function checkResourceAccess(
  user: JWTPayload,
  resourceCampusId?: string,
  resourceUserId?: string
): { allowed: boolean; reason?: string } {
  const role = user.role as ExtendedRole;

  // DEVELOPER: Bypass all
  if (role === 'DEVELOPER') {
    return { allowed: true };
  }

  // SUPER_ADMIN: Access all
  if (role === 'SUPER_ADMIN') {
    return { allowed: true };
  }

  // ADMIN: Campus-only access
  if (role === 'ADMIN') {
    if (resourceCampusId && resourceCampusId !== user.campus_id) {
      return { allowed: false, reason: 'Access denied: different campus' };
    }
    return { allowed: true };
  }

  // USER roles: Own records only
  if (resourceUserId && resourceUserId !== user.user_id) {
    return { allowed: false, reason: 'Access denied: not your record' };
  }

  // Check campus for non-owned resources
  if (resourceCampusId && resourceCampusId !== user.campus_id) {
    return { allowed: false, reason: 'Access denied: different campus' };
  }

  return { allowed: true };
}
