import { AuthResponse, LoginInput, RegisterInput } from '../types';
export declare const authApi: {
    login: (data: LoginInput) => Promise<AuthResponse>;
    register: (data: RegisterInput) => Promise<{
        message: string;
        user: Omit<AuthResponse["user"], "role"> & {
            role: string;
            createdAt: string;
        };
    }>;
    me: () => Promise<{
        user: AuthResponse["user"];
    }>;
};
//# sourceMappingURL=auth.d.ts.map