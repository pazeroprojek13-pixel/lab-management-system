import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/auth';
import { generateToken } from '../lib/jwt';
export class AuthService {
    async login(input) {
        const user = await prisma.user.findUnique({ where: { email: input.email } });
        if (!user)
            return null;
        const isValidPassword = await verifyPassword(input.password, user.password);
        if (!isValidPassword)
            return null;
        const payload = {
            user_id: user.id,
            role: user.role,
            campus_id: user.campusId || undefined,
        };
        const token = generateToken(payload);
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                campusId: user.campusId || undefined,
            },
        };
    }
    async register(input) {
        const hashedPassword = await hashPassword(input.password);
        const newUser = await prisma.user.create({
            data: {
                email: input.email,
                password: hashedPassword,
                name: input.name,
                role: input.role || Role.STUDENT,
                campusId: input.campusId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                campusId: true,
                createdAt: true,
            },
        });
        return newUser;
    }
    async findUserById(userId) {
        return prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                campusId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async findUserByEmail(email) {
        return prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                campusId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async updateUser(userId, input) {
        return prisma.user.update({
            where: { id: userId },
            data: {
                name: input.name,
                role: input.role,
                campusId: input.campusId,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                campusId: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async deleteUser(userId) {
        return prisma.user.delete({
            where: { id: userId },
        });
    }
    async findAllUsers(options) {
        const where = {};
        if (options?.campusId) {
            where.campusId = options.campusId;
        }
        if (options?.userId) {
            where.id = options.userId;
        }
        return prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                campusId: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
export const authService = new AuthService();
//# sourceMappingURL=auth.service.js.map