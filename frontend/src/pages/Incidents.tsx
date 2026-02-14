import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useFetch } from '../hooks/useFetch';
import { useForm } from '../hooks/useForm';
import { incidentsApi } from '../api/incidents';
import { inventoryApi } from '../api/inventory';
import { useAuth } from '../contexts/AuthContext';
import type { IncidentStatus } from '../types';

export function Incidents() {
  const { hasRole } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('');

  const { data: incidentsData, execute: refetch } = useFetch(() => incidentsApi.getAll({ status: filterStatus }));
  const { data: labsData } = useFetch(() => inventoryApi.getAllLabs());
  const { data: equipmentData } = useFetch(() => inventoryApi.getAllEquipment());

  const labOptions = labsData?.labs.map(lab => ({ value: lab.id, label: lab.name })) || [];
  const equipmentOptions = equipmentData?.equipments.map(eq => ({ value: eq.id, label: eq.name })) || [];
  const statusOptions: { value: IncidentStatus; label: string }[] = [
    { value: 'OPEN', label: 'Open' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'CLOSED', label: 'Closed' },
  ];
  const filterStatusOptions = [
    { value: '', label: 'All Statuses' },
    ...statusOptions,
  ];

  const incidentForm = useForm({
    initialValues: {
      title: '',
      description: '',
      equipmentId: '',
      labId: '',
    },
    onSubmit: async (values) => {
      await incidentsApi.create({
        title: values.title,
        description: values.description,
        equipmentId: values.equipmentId || undefined,
        labId: values.labId || undefined,
      });
      setIsModalOpen(false);
      incidentForm.reset();
      refetch();
    },
  });

  const handleStatusChange = async (id: string, newStatus: IncidentStatus) => {
    await incidentsApi.updateStatus(id, newStatus);
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this incident?')) {
      await incidentsApi.delete(id);
      refetch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Incidents</h1>
          <p className="text-gray-500 mt-1">Report and track lab incidents</p>
        </div>
        <Button onClick={() => {
          incidentForm.reset();
          setIsModalOpen(true);
        }}>
          + Report Incident
        </Button>
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

      {/* Incidents List */}
      <div className="space-y-4">
        {incidentsData?.incidents.map((incident) => (
          <Card key={incident.id} className="hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{incident.title}</h3>
                  <Badge status={incident.status}>{incident.status.replace('_', ' ')}</Badge>
                </div>
                <p className="text-gray-600 mb-3">{incident.description}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                  {incident.lab && (
                    <span>🏢 {incident.lab.name}</span>
                  )}
                  {incident.equipment && (
                    <span>🔧 {incident.equipment.name}</span>
                  )}
                  <span>👤 Reported by {incident.reportedBy?.name}</span>
                  <span>📅 {new Date(incident.createdAt).toLocaleDateString()}</span>
                </div>
                {incident.resolution && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Resolution:</strong> {incident.resolution}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {hasRole('ADMIN', 'LAB_ASSISTANT') && (
                  <Select
                    value={incident.status}
                    onChange={(e) => handleStatusChange(incident.id, e.target.value as IncidentStatus)}
                    options={statusOptions}
                    className="w-40"
                  />
                )}
                {hasRole('ADMIN') && (
                  <Button variant="danger" size="sm" onClick={() => handleDelete(incident.id)}>
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          incidentForm.reset();
        }}
        title="Report New Incident"
      >
        <form onSubmit={incidentForm.handleSubmit} className="space-y-4">
          <Input
            label="Title"
            name="title"
            value={incidentForm.values.title}
            onChange={incidentForm.handleChange}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={incidentForm.values.description}
              onChange={incidentForm.handleChange}
              required
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          <Select
            label="Lab (Optional)"
            name="labId"
            value={incidentForm.values.labId}
            onChange={incidentForm.handleChange}
            options={[{ value: '', label: 'Select Lab' }, ...labOptions]}
          />
          <Select
            label="Equipment (Optional)"
            name="equipmentId"
            value={incidentForm.values.equipmentId}
            onChange={incidentForm.handleChange}
            options={[{ value: '', label: 'Select Equipment' }, ...equipmentOptions]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsModalOpen(false);
                incidentForm.reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={incidentForm.isSubmitting}>
              Report Incident
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
