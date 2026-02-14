import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useFetch } from '../hooks/useFetch';
import { useForm } from '../hooks/useForm';
import { maintenanceApi } from '../api/maintenance';
import { inventoryApi } from '../api/inventory';
import { useAuth } from '../contexts/AuthContext';
import { Maintenance, MaintenanceStatus } from '../types';

export function MaintenancePage() {
  const { hasRole } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { data: maintenanceData, execute: refetch } = useFetch(() => maintenanceApi.getAll({ status: filterStatus }));
  const { data: labsData } = useFetch(() => inventoryApi.getAllLabs());
  const { data: equipmentData } = useFetch(() => inventoryApi.getAllEquipment());

  const labOptions = labsData?.labs.map(lab => ({ value: lab.id, label: lab.name })) || [];
  const equipmentOptions = equipmentData?.equipments.map(eq => ({ value: eq.id, label: eq.name })) || [];
  const statusOptions: { value: MaintenanceStatus; label: string }[] = [
    { value: 'SCHEDULED', label: 'Scheduled' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ];
  const filterStatusOptions = [
    { value: '', label: 'All Statuses' },
    ...statusOptions,
  ];

  const maintenanceForm = useForm({
    initialValues: {
      title: '',
      description: '',
      scheduledDate: '',
      equipmentId: '',
      labId: '',
    },
    onSubmit: async (values) => {
      await maintenanceApi.create({
        title: values.title,
        description: values.description,
        scheduledDate: new Date(values.scheduledDate).toISOString(),
        equipmentId: values.equipmentId || undefined,
        labId: values.labId || undefined,
      });
      setIsModalOpen(false);
      maintenanceForm.reset();
      refetch();
    },
  });

  const handleComplete = async (id: string) => {
    const notes = prompt('Enter completion notes (optional):');
    await maintenanceApi.complete(id, notes || undefined);
    refetch();
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Enter cancellation reason:');
    if (reason) {
      await maintenanceApi.cancel(id, reason);
      refetch();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this maintenance record?')) {
      await maintenanceApi.delete(id);
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-gray-500 mt-1">Schedule and track maintenance activities</p>
        </div>
        {hasRole('ADMIN', 'LAB_ASSISTANT') && (
          <Button onClick={() => {
            maintenanceForm.reset();
            setIsModalOpen(true);
          }}>
            + Schedule Maintenance
          </Button>
        )}
      </div>

      {/* Filter */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="w-48">
            <Select
              label="Filter by Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={filterStatusOptions}
            />
          </div>
        </div>
      </Card>

      {/* Maintenance List */}
      <div className="space-y-4">
        {maintenanceData?.maintenances.map((maintenance) => (
          <Card key={maintenance.id} className="hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{maintenance.title}</h3>
                  <Badge status={maintenance.status}>{maintenance.status}</Badge>
                </div>
                <p className="text-gray-600 mb-3">{maintenance.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {maintenance.lab && (
                    <span>🏢 {maintenance.lab.name}</span>
                  )}
                  {maintenance.equipment && (
                    <span>🔧 {maintenance.equipment.name}</span>
                  )}
                  <span>📅 Scheduled: {new Date(maintenance.scheduledDate).toLocaleDateString()}</span>
                  {maintenance.completedDate && (
                    <span>✅ Completed: {new Date(maintenance.completedDate).toLocaleDateString()}</span>
                  )}
                </div>
                {maintenance.notes && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Notes:</strong> {maintenance.notes}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {hasRole('ADMIN', 'LAB_ASSISTANT') && maintenance.status === 'SCHEDULED' && (
                  <Button size="sm" onClick={() => handleComplete(maintenance.id)}>
                    Complete
                  </Button>
                )}
                {hasRole('ADMIN', 'LAB_ASSISTANT') && maintenance.status !== 'COMPLETED' && maintenance.status !== 'CANCELLED' && (
                  <Button variant="secondary" size="sm" onClick={() => handleCancel(maintenance.id)}>
                    Cancel
                  </Button>
                )}
                {hasRole('ADMIN') && (
                  <Button variant="danger" size="sm" onClick={() => handleDelete(maintenance.id)}>
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          maintenanceForm.reset();
        }}
        title="Schedule Maintenance"
      >
        <form onSubmit={maintenanceForm.handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={maintenanceForm.values.title}
            onChange={maintenanceForm.handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={maintenanceForm.values.description}
              onChange={maintenanceForm.handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <Input
            label="Scheduled Date & Time"
            name="scheduledDate"
            type="datetime-local"
            value={maintenanceForm.values.scheduledDate}
            onChange={maintenanceForm.handleChange}
            required
          />
          <Select
            label="Lab (Optional)"
            name="labId"
            value={maintenanceForm.values.labId}
            onChange={maintenanceForm.handleChange}
            options={[{ value: '', label: 'Select Lab' }, ...labOptions]}
          />
          <Select
            label="Equipment (Optional)"
            name="equipmentId"
            value={maintenanceForm.values.equipmentId}
            onChange={maintenanceForm.handleChange}
            options={[{ value: '', label: 'Select Equipment' }, ...equipmentOptions]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                maintenanceForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={maintenanceForm.isSubmitting}>
              Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
