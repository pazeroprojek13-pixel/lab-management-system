import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS } from '../../utils/constants';
export function Layout({ children }) {
    const { user, logout, hasRole } = useAuth();
    const location = useLocation();
    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: 'ðŸ“Š' },
        { path: '/monitoring', label: 'Monitoring', icon: 'ðŸ“…' },
        { path: '/inventory', label: 'Inventory', icon: 'ðŸ“¦' },
        { path: '/incidents', label: 'Incidents', icon: 'âš ï¸' },
        { path: '/maintenance', label: 'Maintenance', icon: 'ðŸ”§' },
    ];
    // Only admin can see users page
    if (hasRole('ADMIN')) {
        navItems.push({ path: '/users', label: 'Users', icon: 'ðŸ‘¥' });
    }
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 flex", children: [_jsxs("aside", { className: "w-64 bg-white shadow-md flex-shrink-0", children: [_jsx("div", { className: "p-6", children: _jsx("h1", { className: "text-xl font-bold text-gray-900", children: "\u00F0\u0178\u008F\u00AB Lab Management" }) }), _jsx("nav", { className: "px-4 pb-4", children: navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (_jsxs(Link, { to: item.path, className: `flex items-center px-4 py-3 rounded-lg mb-1 transition-colors ${isActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-100'}`, children: [_jsx("span", { className: "mr-3", children: item.icon }), _jsx("span", { className: "font-medium", children: item.label })] }, item.path));
                        }) }), _jsx("div", { className: "absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold", children: user?.name.charAt(0).toUpperCase() }), _jsxs("div", { className: "ml-3 flex-1 min-w-0", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: user?.name }), _jsx("p", { className: "text-xs text-gray-500 truncate", children: user && ROLE_LABELS[user.role] })] }), _jsx("button", { onClick: logout, className: "ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors", title: "Logout", children: _jsx("svg", { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: _jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" }) }) })] }) })] }), _jsx("main", { className: "flex-1 overflow-auto", children: _jsx("div", { className: "p-8", children: children }) })] }));
}
//# sourceMappingURL=Layout.js.map