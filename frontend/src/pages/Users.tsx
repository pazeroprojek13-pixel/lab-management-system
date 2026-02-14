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
import type { Role } from '../types';

export function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Note: In a real app, you'd have an API endpoint to list all users
  // For now, we'll just show the registration form

  const userForm = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      role: 'STUDENT' as Role,
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">Manage system users</p>
        </div>
        <Button onClick={() => {
          userForm.reset();
          setIsModalOpen(true);
        }}>
          + Add User
        </Button>
      </div>

      {/* Info Card */}
      <Card>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">User Management</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Create new users and manage their roles. Users can have different roles:
            Admin, Lab Assistant, Lecturer, or Student.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center gap-2">
              <Badge status="ACTIVE">ADMIN</Badge>
              <span className="text-sm text-gray-600">Full access</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge status="AVAILABLE">LAB_ASSISTANT</Badge>
              <span className="text-sm text-gray-600">Lab management</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge status="IN_USE">LECTURER</Badge>
              <span className="text-sm text-gray-600">Schedule management</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge status="SCHEDULED">STUDENT</Badge>
              <span className="text-sm text-gray-600">Basic access</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          userForm.reset();
        }}
        title="Add New User"
      >
        <form onSubmit={userForm.handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={userForm.values.name}
            onChange={userForm.handleChange}
            required
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={userForm.values.email}
            onChange={userForm.handleChange}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={userForm.values.password}
            onChange={userForm.handleChange}
            required
            minLength={6}
          />
          <Select
            label="Role"
            name="role"
            value={userForm.values.role}
            onChange={userForm.handleChange}
            options={roleOptions}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                userForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={userForm.isSubmitting}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
