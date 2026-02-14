import { JWTPayload } from './jwt';
export type ExtendedRole = 'SUPER_ADMIN' | 'DEVELOPER' | 'ADMIN' | 'LAB_ASSISTANT' | 'LECTURER' | 'STUDENT';
export interface CampusScopeOptions {
    user: JWTPayload;
    resourceCampusId?: string;
    resourceUserId?: string;
}
/**
 * Determines if user has access based on campus scope
 */
export declare function hasCampusAccess(options: CampusScopeOptions): boolean;
/**
 * Builds Prisma where clause for campus scoping
 * Use this helper in service layer to filter queries
 */
export declare function buildCampusWhereClause<T extends Record<string, unknown>>(user: JWTPayload, baseWhere?: T, campusIdField?: string): T;
/**
 * Middleware helper to check campus access for single resource
 * Returns 403 if access denied
 */
export declare function checkResourceAccess(user: JWTPayload, resourceCampusId?: string, resourceUserId?: string): {
    allowed: boolean;
    reason?: string;
};
//# sourceMappingURL=campusScope.d.ts.map