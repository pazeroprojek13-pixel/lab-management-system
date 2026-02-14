import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ManagementDashboard } from './pages/ManagementDashboard';
import { Monitoring } from './pages/Monitoring';
import { Inventory } from './pages/Inventory';
import { Incidents } from './pages/Incidents';
import { MaintenancePage } from './pages/Maintenance';
import { Users } from './pages/Users';
function App() {
    return (_jsx(AuthProvider, { children: _jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(Navigate, { to: "/dashboard", replace: true }) }) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(ManagementDashboard, {}) }) }), _jsx(Route, { path: "/legacy-dashboard", element: _jsx(ProtectedRoute, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/monitoring", element: _jsx(ProtectedRoute, { children: _jsx(Monitoring, {}) }) }), _jsx(Route, { path: "/inventory", element: _jsx(ProtectedRoute, { children: _jsx(Inventory, {}) }) }), _jsx(Route, { path: "/incidents", element: _jsx(ProtectedRoute, { children: _jsx(Incidents, {}) }) }), _jsx(Route, { path: "/maintenance", element: _jsx(ProtectedRoute, { children: _jsx(MaintenancePage, {}) }) }), _jsx(Route, { path: "/users", element: _jsx(ProtectedRoute, { requiredRoles: ['ADMIN'], children: _jsx(Users, {}) }) })] }) }) }));
}
export default App;
//# sourceMappingURL=App.js.map