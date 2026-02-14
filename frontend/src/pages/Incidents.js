import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
export function Incidents() {
    const { hasRole } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const { data: incidentsData, execute: refetch } = useFetch(() => incidentsApi.getAll({ status: filterStatus }));
    const { data: labsData } = useFetch(() => inventoryApi.getAllLabs());
    const { data: equipmentData } = useFetch(() => inventoryApi.getAllEquipment());
    const labOptions = labsData?.labs.map(lab => ({ value: lab.id, label: lab.name })) || [];
    const equipmentOptions = equipmentData?.equipments.map(eq => ({ value: eq.id, label: eq.name })) || [];
    const statusOptions = [
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
    const handleStatusChange = async (id, newStatus) => {
        await incidentsApi.updateStatus(id, newStatus);
        refetch();
    };
    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this incident?')) {
            await incidentsApi.delete(id);
            refetch();
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Incidents" }), _jsx("p", { className: "text-gray-500 mt-1", children: "Report and track lab incidents" })] }), _jsx(Button, { onClick: () => {
                            incidentForm.reset();
                            setIsModalOpen(true);
                        }, children: "+ Report Incident" })] }), _jsx(Card, { children: _jsx("div", { className: "flex items-center gap-4", children: _jsx("div", { className: "w-48", children: _jsx(Select, { label: "Filter by Status", value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), options: filterStatusOptions }) }) }) }), _jsx("div", { className: "space-y-4", children: incidentsData?.incidents.map((incident) => (_jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: incident.title }), _jsx(Badge, { status: incident.status, children: incident.status.replace('_', ' ') })] }), _jsx("p", { className: "text-gray-600 mb-3", children: incident.description }), _jsxs("div", { className: "flex flex-wrap gap-4 text-sm text-gray-500", children: [incident.lab && (_jsxs("span", { children: ["\uD83C\uDFE2 ", incident.lab.name] })), incident.equipment && (_jsxs("span", { children: ["\uD83D\uDD27 ", incident.equipment.name] })), _jsxs("span", { children: ["\uD83D\uDC64 Reported by ", incident.reportedBy?.name] }), _jsxs("span", { children: ["\uD83D\uDCC5 ", new Date(incident.createdAt).toLocaleDateString()] })] }), incident.resolution && (_jsx("div", { className: "mt-3 p-3 bg-green-50 rounded-lg", children: _jsxs("p", { className: "text-sm text-green-800", children: [_jsx("strong", { children: "Resolution:" }), " ", incident.resolution] }) }))] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [hasRole('ADMIN', 'LAB_ASSISTANT') && (_jsx(Select, { value: incident.status, onChange: (e) => handleStatusChange(incident.id, e.target.value), options: statusOptions, className: "w-40" })), hasRole('ADMIN') && (_jsx(Button, { variant: "danger", size: "sm", onClick: () => handleDelete(incident.id), children: "Delete" }))] })] }) }, incident.id))) }), _jsx(Modal, { isOpen: isModalOpen, onClose: () => {
                    setIsModalOpen(false);
                    incidentForm.reset();
                }, title: "Report New Incident", children: _jsxs("form", { onSubmit: incidentForm.handleSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Title", name: "title", value: incidentForm.values.title, onChange: incidentForm.handleChange, required: true }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("textarea", { name: "description", value: incidentForm.values.description, onChange: incidentForm.handleChange, required: true, rows: 4, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" })] }), _jsx(Select, { label: "Lab (Optional)", name: "labId", value: incidentForm.values.labId, onChange: incidentForm.handleChange, options: [{ value: '', label: 'Select Lab' }, ...labOptions] }), _jsx(Select, { label: "Equipment (Optional)", name: "equipmentId", value: incidentForm.values.equipmentId, onChange: incidentForm.handleChange, options: [{ value: '', label: 'Select Equipment' }, ...equipmentOptions] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: () => {
                                        setIsModalOpen(false);
                                        incidentForm.reset();
                                    }, children: "Cancel" }), _jsx(Button, { type: "submit", isLoading: incidentForm.isSubmitting, children: "Report Incident" })] })] }) })] }));
}
//# sourceMappingURL=Incidents.js.map