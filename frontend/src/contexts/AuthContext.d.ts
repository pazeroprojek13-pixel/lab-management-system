import { ReactNode } from 'react';
import { User, LoginInput, RegisterInput } from '../types';
interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (data: LoginInput) => Promise<void>;
    register: (data: RegisterInput) => Promise<void>;
    logout: () => void;
    hasRole: (...roles: string[]) => boolean;
}
export declare function AuthProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthContextType;
export {};
//# sourceMappingURL=AuthContext.d.ts.map