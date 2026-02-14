import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
export function Login() {
    const { login, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    if (isAuthenticated) {
        return _jsx(Navigate, { to: "/", replace: true });
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login({ email, password });
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Invalid credentials';
            setError(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsxs("div", { className: "max-w-md w-full", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "\uD83C\uDFEB Lab Management" }), _jsx("p", { className: "mt-2 text-gray-600", children: "Sign in to your account" })] }), _jsxs("div", { className: "bg-white rounded-xl shadow-lg p-8", children: [error && (_jsx("div", { className: "mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm", children: error })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsx(Input, { label: "Email", type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, placeholder: "Enter your email" }), _jsx(Input, { label: "Password", type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, placeholder: "Enter your password" }), _jsx(Button, { type: "submit", variant: "primary", size: "lg", isLoading: isLoading, className: "w-full", children: "Sign In" })] }), _jsxs("div", { className: "mt-6 text-center text-sm text-gray-500", children: [_jsx("p", { children: "Demo credentials:" }), _jsx("p", { className: "font-mono bg-gray-100 px-2 py-1 rounded mt-1 inline-block", children: "admin@lab.com / admin123" })] })] })] }) }));
}
//# sourceMappingURL=Login.js.map