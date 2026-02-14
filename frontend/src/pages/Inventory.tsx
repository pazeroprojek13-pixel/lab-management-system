import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useFetch } from '../hooks/useFetch';
import { useForm } from '../hooks/useForm';
import { inventoryApi } from '../api/inventory';
import { useAuth } from '../contexts/AuthContext';
import type { Equipment, EquipmentStatus } from '../types';

export function Inventory() {
  const { hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState<'equipment' | 'labs'>('equipment');
  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const { data: equipmentData, execute: refetchEquipment } = useFetch(() => inventoryApi.getAllEquipment());
  const { data: labsData } = useFetch(() => inventoryApi.getAllLabs());

  const labOptions = labsData?.labs.map(lab => ({ value: lab.id, label: lab.name })) || [];
  const statusOptions = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'IN_USE', label: 'In Use' },
    { value: 'BROKEN', label: 'Broken' },
    { value: 'UNDER_MAINTENANCE', label: 'Under Maintenance' },
  ];

  const equipmentForm = useForm({
    initialValues: {
      name: '',
      code: '',
      category: '',
      description: '',
      labId: '',
      status: 'AVAILABLE' as EquipmentStatus,
    },
    onSubmit: async (values) => {
      if (selectedEquipment) {
        await inventoryApi.updateEquipment(selectedEquipment.id, values);
      } else {
        await inventoryApi.createEquipment(values as Omit<Equipment, 'id' | 'createdAt' | 'updatedAt'>);
      }
      setIsEquipmentModalOpen(false);
      setSelectedEquipment(null);
      equipmentForm.reset();
      refetchEquipment();
    },
  });

  const handleEditEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    equipmentForm.setValues({
      name: equipment.name,
      code: equipment.code,
      category: equipment.category,
      description: equipment.description || '',
      labId: equipment.labId,
      status: equipment.status,
    });
    setIsEquipmentModalOpen(true);
  };

  const handleDeleteEquipment = async (id: string) => {
    if (confirm('Are you sure you want to delete this equipment?')) {
      await inventoryApi.deleteEquipment(id);
      refetchEquipment();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 mt-1">Manage labs and equipment</p>
        </div>
        {hasRole('ADMIN', 'LAB_ASSISTANT') && activeTab === 'equipment' && (
          <Button onClick={() => {
            setSelectedEquipment(null);
            equipmentForm.reset();
            setIsEquipmentModalOpen(true);
          }}>
            + Add Equipment
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(['equipment', 'labs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Equipment Tab */}
      {activeTab === 'equipment' && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lab</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                {hasRole('ADMIN', 'LAB_ASSISTANT') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {equipmentData?.equipments.map((equipment) => (
                <tr key={equipment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{equipment.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{equipment.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{equipment.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{equipment.lab?.name}</td>
                  <td className="px-6 py-4">
                    <Badge status={equipment.status}>{equipment.status.replace('_', ' ')}</Badge>
                  </td>
                  {hasRole('ADMIN', 'LAB_ASSISTANT') && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditEquipment(equipment)}>
                          Edit
                        </Button>
                        {hasRole('ADMIN') && (
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteEquipment(equipment.id)}>
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Labs Tab */}
      {activeTab === 'labs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labsData?.labs.map((lab) => (
            <Card key={lab.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{lab.name}</h3>
                  <p className="text-sm text-gray-500">{lab.code}</p>
                </div>
                <Badge status={lab.status}>{lab.status}</Badge>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>📍 {lab.location || 'No location'}</p>
                <p>👥 Capacity: {lab.capacity}</p>
                <p>🔧 Equipment: {lab._count?.equipments || 0}</p>
              </div>
              {lab.description && (
                <p className="mt-3 text-sm text-gray-500">{lab.description}</p>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Equipment Modal */}
      <Modal
        isOpen={isEquipmentModalOpen}
        onClose={() => {
          setIsEquipmentModalOpen(false);
          setSelectedEquipment(null);
          equipmentForm.reset();
        }}
        title={selectedEquipment ? 'Edit Equipment' : 'Add Equipment'}
      >
        <form onSubmit={equipmentForm.handleSubmit} className="space-y-4">
          <Input
            label="Equipment Name"
            name="name"
            value={equipmentForm.values.name}
            onChange={equipmentForm.handleChange}
            required
          />
          <Input
            label="Code"
            name="code"
            value={equipmentForm.values.code}
            onChange={equipmentForm.handleChange}
            required
            disabled={!!selectedEquipment}
          />
          <Input
            label="Category"
            name="category"
            value={equipmentForm.values.category}
            onChange={equipmentForm.handleChange}
            required
          />
          <Input
            label="Description"
            name="description"
            value={equipmentForm.values.description}
            onChange={equipmentForm.handleChange}
          />
          <Select
            label="Lab"
            name="labId"
            value={equipmentForm.values.labId}
            onChange={equipmentForm.handleChange}
            options={labOptions}
            required
          />
          <Select
            label="Status"
            name="status"
            value={equipmentForm.values.status}
            onChange={equipmentForm.handleChange}
            options={statusOptions}
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsEquipmentModalOpen(false);
                setSelectedEquipment(null);
                equipmentForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={equipmentForm.isSubmitting}>
              {selectedEquipment ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
