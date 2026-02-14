import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useForm } from '../hooks/useForm';
import { authApi } from '../api/auth';
import { ROLE_LABELS } from '../utils/constants';
export function Users() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Note: In a real app, you'd have an API endpoint to list all users
    // For now, we'll just show the registration form
    const userForm = useForm({
        initialValues: {
            name: '',
            email: '',
            password: '',
            role: 'STUDENT',
        },
        onSubmit: async (values) => {
            await authApi.register(values);
            setIsModalOpen(false);
            userForm.reset();
            alert('User registered successfully!');
        },
    });
    const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({
        value,
        label,
    }));
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Users" }), _jsx("p", { className: "text-gray-500 mt-1", children: "Manage system users" })] }), _jsx(Button, { onClick: () => {
                            userForm.reset();
                            setIsModalOpen(true);
                        }, children: "+ Add User" })] }), _jsx(Card, { children: _jsxs("div", { className: "text-center py-12", children: [_jsx("div", { className: "text-6xl mb-4", children: "\uD83D\uDC65" }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "User Management" }), _jsx("p", { className: "text-gray-500 max-w-md mx-auto mb-6", children: "Create new users and manage their roles. Users can have different roles: Admin, Lab Assistant, Lecturer, or Student." }), _jsxs("div", { className: "flex flex-wrap justify-center gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { status: "ACTIVE", children: "ADMIN" }), _jsx("span", { className: "text-sm text-gray-600", children: "Full access" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { status: "AVAILABLE", children: "LAB_ASSISTANT" }), _jsx("span", { className: "text-sm text-gray-600", children: "Lab management" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { status: "IN_USE", children: "LECTURER" }), _jsx("span", { className: "text-sm text-gray-600", children: "Schedule management" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { status: "SCHEDULED", children: "STUDENT" }), _jsx("span", { className: "text-sm text-gray-600", children: "Basic access" })] })] })] }) }), _jsx(Modal, { isOpen: isModalOpen, onClose: () => {
                    setIsModalOpen(false);
                    userForm.reset();
                }, title: "Add New User", children: _jsxs("form", { onSubmit: userForm.handleSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Full Name", name: "name", value: userForm.values.name, onChange: userForm.handleChange, required: true }), _jsx(Input, { label: "Email", name: "email", type: "email", value: userForm.values.email, onChange: userForm.handleChange, required: true }), _jsx(Input, { label: "Password", name: "password", type: "password", value: userForm.values.password, onChange: userForm.handleChange, required: true, minLength: 6 }), _jsx(Select, { label: "Role", name: "role", value: userForm.values.role, onChange: userForm.handleChange, options: roleOptions, required: true }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: () => {
                                        setIsModalOpen(false);
                                        userForm.reset();
                                    }, children: "Cancel" }), _jsx(Button, { type: "submit", isLoading: userForm.isSubmitting, children: "Create User" })] })] }) })] }));
}
//# sourceMappingURL=Users.js.map