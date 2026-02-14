import { Role } from '@prisma/client';
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
export declare class AuthService {
    login(input: LoginInput): Promise<AuthResult | null>;
    register(input: RegisterInput): Promise<Omit<AuthResult['user'], 'id'> & {
        id: string;
        createdAt: Date;
    }>;
    findUserById(userId: string): Promise<any>;
    findUserByEmail(email: string): Promise<any>;
    updateUser(userId: string, input: UpdateUserInput): Promise<any>;
    deleteUser(userId: string): Promise<any>;
    findAllUsers(options?: {
        campusId?: string;
        userId?: string;
    }): Promise<any>;
}
export declare const authService: AuthService;
//# sourceMappingURL=auth.service.d.ts.map