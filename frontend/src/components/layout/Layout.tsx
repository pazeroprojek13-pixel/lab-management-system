import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_LABELS } from '../../utils/constants';

export function Layout({ children }: { children: React.ReactNode }) {
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex-shrink-0">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">ðŸ« Lab Management</h1>
        </div>

        <nav className="px-4 pb-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user && ROLE_LABELS[user.role]}</p>
            </div>
            <button
              onClick={logout}
              className="ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

