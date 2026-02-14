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
import { maintenanceApi } from '../api/maintenance';
import { inventoryApi } from '../api/inventory';
import { useAuth } from '../contexts/AuthContext';
export function MaintenancePage() {
    const { hasRole } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedMaintenance, setSelectedMaintenance] = useState(null);
    const [filterStatus, setFilterStatus] = useState('');
    const { data: maintenanceData, execute: refetch } = useFetch(() => maintenanceApi.getAll({ status: filterStatus }));
    const { data: labsData } = useFetch(() => inventoryApi.getAllLabs());
    const { data: equipmentData } = useFetch(() => inventoryApi.getAllEquipment());
    const labOptions = labsData?.labs.map(lab => ({ value: lab.id, label: lab.name })) || [];
    const equipmentOptions = equipmentData?.equipments.map(eq => ({ value: eq.id, label: eq.name })) || [];
    const statusOptions = [
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
    const handleComplete = async (id) => {
        const notes = prompt('Enter completion notes (optional):');
        await maintenanceApi.complete(id, notes || undefined);
        refetch();
    };
    const handleCancel = async (id) => {
        const reason = prompt('Enter cancellation reason:');
        if (reason) {
            await maintenanceApi.cancel(id, reason);
            refetch();
        }
    };
    const handleDelete = async (id) => {
        if (confirm('Are you sure you want to delete this maintenance record?')) {
            await maintenanceApi.delete(id);
            refetch();
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Maintenance" }), _jsx("p", { className: "text-gray-500 mt-1", children: "Schedule and track maintenance activities" })] }), hasRole('ADMIN', 'LAB_ASSISTANT') && (_jsx(Button, { onClick: () => {
                            maintenanceForm.reset();
                            setIsModalOpen(true);
                        }, children: "+ Schedule Maintenance" }))] }), _jsx(Card, { children: _jsx("div", { className: "flex items-center gap-4", children: _jsx("div", { className: "w-48", children: _jsx(Select, { label: "Filter by Status", value: filterStatus, onChange: (e) => setFilterStatus(e.target.value), options: filterStatusOptions }) }) }) }), _jsx("div", { className: "space-y-4", children: maintenanceData?.maintenances.map((maintenance) => (_jsx(Card, { className: "hover:shadow-md transition-shadow", children: _jsxs("div", { className: "flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: maintenance.title }), _jsx(Badge, { status: maintenance.status, children: maintenance.status })] }), _jsx("p", { className: "text-gray-600 mb-3", children: maintenance.description }), _jsxs("div", { className: "flex flex-wrap gap-4 text-sm text-gray-500", children: [maintenance.lab && (_jsxs("span", { children: ["\uD83C\uDFE2 ", maintenance.lab.name] })), maintenance.equipment && (_jsxs("span", { children: ["\uD83D\uDD27 ", maintenance.equipment.name] })), _jsxs("span", { children: ["\uD83D\uDCC5 Scheduled: ", new Date(maintenance.scheduledDate).toLocaleDateString()] }), maintenance.completedDate && (_jsxs("span", { children: ["\u2705 Completed: ", new Date(maintenance.completedDate).toLocaleDateString()] }))] }), maintenance.notes && (_jsx("div", { className: "mt-3 p-3 bg-blue-50 rounded-lg", children: _jsxs("p", { className: "text-sm text-blue-800", children: [_jsx("strong", { children: "Notes:" }), " ", maintenance.notes] }) }))] }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [hasRole('ADMIN', 'LAB_ASSISTANT') && maintenance.status === 'SCHEDULED' && (_jsx(Button, { size: "sm", onClick: () => handleComplete(maintenance.id), children: "Complete" })), hasRole('ADMIN', 'LAB_ASSISTANT') && maintenance.status !== 'COMPLETED' && maintenance.status !== 'CANCELLED' && (_jsx(Button, { variant: "secondary", size: "sm", onClick: () => handleCancel(maintenance.id), children: "Cancel" })), hasRole('ADMIN') && (_jsx(Button, { variant: "danger", size: "sm", onClick: () => handleDelete(maintenance.id), children: "Delete" }))] })] }) }, maintenance.id))) }), _jsx(Modal, { isOpen: isModalOpen, onClose: () => {
                    setIsModalOpen(false);
                    maintenanceForm.reset();
                }, title: "Schedule Maintenance", children: _jsxs("form", { onSubmit: maintenanceForm.handleSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Title", name: "title", value: maintenanceForm.values.title, onChange: maintenanceForm.handleChange, required: true }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Description" }), _jsx("textarea", { name: "description", value: maintenanceForm.values.description, onChange: maintenanceForm.handleChange, required: true, rows: 4, className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" })] }), _jsx(Input, { label: "Scheduled Date & Time", name: "scheduledDate", type: "datetime-local", value: maintenanceForm.values.scheduledDate, onChange: maintenanceForm.handleChange, required: true }), _jsx(Select, { label: "Lab (Optional)", name: "labId", value: maintenanceForm.values.labId, onChange: maintenanceForm.handleChange, options: [{ value: '', label: 'Select Lab' }, ...labOptions] }), _jsx(Select, { label: "Equipment (Optional)", name: "equipmentId", value: maintenanceForm.values.equipmentId, onChange: maintenanceForm.handleChange, options: [{ value: '', label: 'Select Equipment' }, ...equipmentOptions] }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: () => {
                                        setIsModalOpen(false);
                                        maintenanceForm.reset();
                                    }, children: "Cancel" }), _jsx(Button, { type: "submit", isLoading: maintenanceForm.isSubmitting, children: "Schedule" })] })] }) })] }));
}
//# sourceMappingURL=Maintenance.js.map