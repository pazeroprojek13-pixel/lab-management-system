import { Role } from '@prisma/client';
import { authService } from '../services/auth.service';
import { checkResourceAccess } from '../lib/campusScope';
export class AuthController {
    async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                res.status(400).json({ error: 'Email and password are required' });
                return;
            }
            const result = await authService.login({ email, password });
            if (!result) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }
            res.json({
                message: 'Login successful',
                token: result.token,
                user: result.user,
            });
        }
        catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async register(req, res) {
        try {
            const { email, password, name, role, campusId } = req.body;
            if (!email || !password || !name) {
                res.status(400).json({ error: 'Email, password, and name are required' });
                return;
            }
            const currentUser = req.user;
            const currentRole = currentUser.role;
            // Validate role assignment based on current user's role
            const standardRoles = [Role.ADMIN, Role.LAB_ASSISTANT, Role.LECTURER, Role.STUDENT];
            const elevatedRoles = [Role.SUPER_ADMIN, Role.DEVELOPER];
            // Determine allowed roles based on current user's role
            let allowedRoles;
            if (currentRole === 'SUPER_ADMIN' || currentRole === 'DEVELOPER') {
                allowedRoles = [...elevatedRoles, ...standardRoles];
            }
            else {
                allowedRoles = standardRoles;
            }
            // Validate requested role
            const requestRole = role;
            let userRole;
            if (role && allowedRoles.includes(requestRole)) {
                userRole = requestRole;
            }
            else {
                userRole = Role.STUDENT; // Default fallback
            }
            // ADMIN can only create users for their own campus
            let userCampusId = campusId;
            if (currentRole === 'ADMIN') {
                userCampusId = currentUser.campus_id;
            }
            const existingUser = await authService.findUserByEmail(email);
            if (existingUser) {
                res.status(409).json({ error: 'User with this email already exists' });
                return;
            }
            const newUser = await authService.register({
                email,
                password,
                name,
                role: userRole,
                campusId: userCampusId,
            });
            res.status(201).json({
                message: 'User registered successfully',
                user: newUser,
            });
        }
        catch (error) {
            console.error('Register error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async me(req, res) {
        try {
            const user = await authService.findUserById(req.user.user_id);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            res.json({ user });
        }
        catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async updateUser(req, res) {
        try {
            const targetUserId = req.params.id;
            const { name, role, campusId } = req.body;
            const currentUser = req.user;
            const currentRole = currentUser.role;
            const targetUser = await authService.findUserById(targetUserId);
            if (!targetUser) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            // Check access rights
            const access = checkResourceAccess(currentUser, targetUser.campusId || undefined, targetUserId);
            if (!access.allowed) {
                res.status(403).json({ error: access.reason });
                return;
            }
            // Only SUPER_ADMIN can change roles to/from SUPER_ADMIN or DEVELOPER
            const targetUserRole = targetUser.role;
            const newRole = role;
            if ((newRole === 'SUPER_ADMIN' || newRole === 'DEVELOPER' || targetUserRole === 'SUPER_ADMIN' || targetUserRole === 'DEVELOPER') &&
                currentRole !== 'SUPER_ADMIN' && currentRole !== 'DEVELOPER') {
                res.status(403).json({ error: 'Forbidden: Cannot modify elevated roles' });
                return;
            }
            // ADMIN can only update users in their campus
            let updateCampusId = campusId;
            if (currentRole === 'ADMIN') {
                updateCampusId = currentUser.campus_id;
            }
            const updatedUser = await authService.updateUser(targetUserId, {
                name,
                role,
                campusId: updateCampusId,
            });
            res.json({
                message: 'User updated successfully',
                user: updatedUser,
            });
        }
        catch (error) {
            console.error('Update user error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    async deleteUser(req, res) {
        try {
            const targetUserId = req.params.id;
            const currentUser = req.user;
            const currentRole = currentUser.role;
            const targetUser = await authService.findUserById(targetUserId);
            if (!targetUser) {
                res.status(404).json({ error: 'User not found' });
                return;
            }
            // Check access rights
            const access = checkResourceAccess(currentUser, targetUser.campusId || undefined, targetUserId);
            if (!access.allowed) {
                res.status(403).json({ error: access.reason });
                return;
            }
            // Only SUPER_ADMIN can delete SUPER_ADMIN or DEVELOPER
            const targetUserRole = targetUser.role;
            if ((targetUserRole === 'SUPER_ADMIN' || targetUserRole === 'DEVELOPER') &&
                currentRole !== 'SUPER_ADMIN' && currentRole !== 'DEVELOPER') {
                res.status(403).json({ error: 'Forbidden: Cannot delete elevated users' });
                return;
            }
            await authService.deleteUser(targetUserId);
            res.json({ message: 'User deleted successfully' });
        }
        catch (error) {
            console.error('Delete user error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
export const authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map