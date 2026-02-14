import { Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/auth';
import { generateToken, JWTPayload } from '../lib/jwt';
import { ExtendedRole } from '../middleware';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  role?: Role | ExtendedRole;
  campusId?: string;
}

export interface UpdateUserInput {
  name?: string;
  role?: Role | ExtendedRole;
  campusId?: string;
}

export interface AuthResult {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role | ExtendedRole;
    campusId?: string;
  };
}

export class AuthService {
  async login(input: LoginInput): Promise<AuthResult | null> {
    const user = await prisma.user.findUnique({ where: { email: input.email } });

    if (!user) return null;

    const isValidPassword = await verifyPassword(input.password, user.password);
    if (!isValidPassword) return null;

    const payload: JWTPayload = {
      user_id: user.id,
      role: user.role as ExtendedRole,
      campus_id: user.campusId || undefined,
    };

    const token = generateToken(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as ExtendedRole,
        campusId: user.campusId || undefined,
      },
    };
  }

  async register(input: RegisterInput): Promise<Omit<AuthResult['user'], 'id'> & { id: string; createdAt: Date }> {
    const hashedPassword = await hashPassword(input.password);

    const newUser = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: input.role as Role || Role.STUDENT,
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

  async findUserById(userId: string) {
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

  async findUserByEmail(email: string) {
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

  async updateUser(userId: string, input: UpdateUserInput) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        role: input.role as Role,
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

  async deleteUser(userId: string) {
    return prisma.user.delete({
      where: { id: userId },
    });
  }

  async findAllUsers(options?: { campusId?: string; userId?: string }) {
    const where: { campusId?: string; id?: string } = {};

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
