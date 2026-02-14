/**
 * Determines if user has access based on campus scope
 */
export function hasCampusAccess(options) {
    const { user, resourceCampusId, resourceUserId } = options;
    const role = user.role;
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
        if (!resourceCampusId)
            return true; // No campus restriction on resource
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
export function buildCampusWhereClause(user, baseWhere = {}, campusIdField = 'campusId') {
    const role = user.role;
    // DEVELOPER and SUPER_ADMIN: No restrictions
    if (role === 'DEVELOPER' || role === 'SUPER_ADMIN') {
        return baseWhere;
    }
    // ADMIN: Filter by their campus
    if (role === 'ADMIN' && user.campus_id) {
        return {
            ...baseWhere,
            [campusIdField]: user.campus_id,
        };
    }
    // Regular users: Will need user-based filtering at service level
    return baseWhere;
}
/**
 * Middleware helper to check campus access for single resource
 * Returns 403 if access denied
 */
export function checkResourceAccess(user, resourceCampusId, resourceUserId) {
    const role = user.role;
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
//# sourceMappingURL=campusScope.js.map