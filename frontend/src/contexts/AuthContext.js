import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const { user } = await authApi.me();
                    setUser(user);
                }
                catch {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);
    const login = async (data) => {
        const response = await authApi.login(data);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
    };
    const register = async (data) => {
        await authApi.register(data);
    };
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };
    const hasRole = (...roles) => {
        if (!user)
            return false;
        return roles.includes(user.role);
    };
    return (_jsx(AuthContext.Provider, { value: {
            user,
            isLoading,
            isAuthenticated: !!user,
            login,
            register,
            logout,
            hasRole,
        }, children: children }));
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
//# sourceMappingURL=AuthContext.js.map