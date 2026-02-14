import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Layout } from './Layout';
export function ProtectedRoute({ children, requiredRoles }) {
    const { isAuthenticated, isLoading, user } = useAuth();
    if (isLoading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" }) }));
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    if (requiredRoles && !requiredRoles.includes(user?.role || '')) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    return _jsx(Layout, { children: children });
}
//# sourceMappingURL=ProtectedRoute.js.map