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
import { inventoryApi } from '../api/inventory';
import { useAuth } from '../contexts/AuthContext';
export function Inventory() {
    const { hasRole } = useAuth();
    const [activeTab, setActiveTab] = useState('equipment');
    const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
    const [selectedEquipment, setSelectedEquipment] = useState(null);
    const { data: equipmentData, execute: refetchEquipment } = useFetch(() => inventoryApi.getAllEquipment());
    const { data: labsData, execute: refetchLabs } = useFetch(() => inventoryApi.getAllLabs());
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
            status: 'AVAILABLE',
        },
        onSubmit: async (values) => {
            if (selectedEquipment) {
                await inventoryApi.updateEquipment(selectedEquipment.id, values);
            }
            else {
                await inventoryApi.createEquipment(values);
            }
            setIsEquipmentModalOpen(false);
            setSelectedEquipment(null);
            equipmentForm.reset();
            refetchEquipment();
        },
    });
    const handleEditEquipment = (equipment) => {
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
    const handleDeleteEquipment = async (id) => {
        if (confirm('Are you sure you want to delete this equipment?')) {
            await inventoryApi.deleteEquipment(id);
            refetchEquipment();
        }
    };
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Inventory" }), _jsx("p", { className: "text-gray-500 mt-1", children: "Manage labs and equipment" })] }), hasRole('ADMIN', 'LAB_ASSISTANT') && activeTab === 'equipment' && (_jsx(Button, { onClick: () => {
                            setSelectedEquipment(null);
                            equipmentForm.reset();
                            setIsEquipmentModalOpen(true);
                        }, children: "+ Add Equipment" }))] }), _jsx("div", { className: "flex gap-2 border-b border-gray-200", children: ['equipment', 'labs'].map((tab) => (_jsx("button", { onClick: () => setActiveTab(tab), className: `px-4 py-2 font-medium capitalize transition-colors ${activeTab === tab
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700'}`, children: tab }, tab))) }), activeTab === 'equipment' && (_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Code" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Name" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Category" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Lab" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Status" }), hasRole('ADMIN', 'LAB_ASSISTANT') && (_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Actions" }))] }) }), _jsx("tbody", { className: "divide-y divide-gray-200", children: equipmentData?.equipments.map((equipment) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 text-sm font-medium text-gray-900", children: equipment.code }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: equipment.name }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: equipment.category }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-600", children: equipment.lab?.name }), _jsx("td", { className: "px-6 py-4", children: _jsx(Badge, { status: equipment.status, children: equipment.status.replace('_', ' ') }) }), hasRole('ADMIN', 'LAB_ASSISTANT') && (_jsx("td", { className: "px-6 py-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleEditEquipment(equipment), children: "Edit" }), hasRole('ADMIN') && (_jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDeleteEquipment(equipment.id), children: "Delete" }))] }) }))] }, equipment.id))) })] }) })), activeTab === 'labs' && (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: labsData?.labs.map((lab) => (_jsxs(Card, { children: [_jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: lab.name }), _jsx("p", { className: "text-sm text-gray-500", children: lab.code })] }), _jsx(Badge, { status: lab.status, children: lab.status })] }), _jsxs("div", { className: "mt-4 space-y-2 text-sm text-gray-600", children: [_jsxs("p", { children: ["\uD83D\uDCCD ", lab.location || 'No location'] }), _jsxs("p", { children: ["\uD83D\uDC65 Capacity: ", lab.capacity] }), _jsxs("p", { children: ["\uD83D\uDD27 Equipment: ", lab._count?.equipments || 0] })] }), lab.description && (_jsx("p", { className: "mt-3 text-sm text-gray-500", children: lab.description }))] }, lab.id))) })), _jsx(Modal, { isOpen: isEquipmentModalOpen, onClose: () => {
                    setIsEquipmentModalOpen(false);
                    setSelectedEquipment(null);
                    equipmentForm.reset();
                }, title: selectedEquipment ? 'Edit Equipment' : 'Add Equipment', children: _jsxs("form", { onSubmit: equipmentForm.handleSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Equipment Name", name: "name", value: equipmentForm.values.name, onChange: equipmentForm.handleChange, required: true }), _jsx(Input, { label: "Code", name: "code", value: equipmentForm.values.code, onChange: equipmentForm.handleChange, required: true, disabled: !!selectedEquipment }), _jsx(Input, { label: "Category", name: "category", value: equipmentForm.values.category, onChange: equipmentForm.handleChange, required: true }), _jsx(Input, { label: "Description", name: "description", value: equipmentForm.values.description, onChange: equipmentForm.handleChange }), _jsx(Select, { label: "Lab", name: "labId", value: equipmentForm.values.labId, onChange: equipmentForm.handleChange, options: labOptions, required: true }), _jsx(Select, { label: "Status", name: "status", value: equipmentForm.values.status, onChange: equipmentForm.handleChange, options: statusOptions, required: true }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: () => {
                                        setIsEquipmentModalOpen(false);
                                        setSelectedEquipment(null);
                                        equipmentForm.reset();
                                    }, children: "Cancel" }), _jsx(Button, { type: "submit", isLoading: equipmentForm.isSubmitting, children: selectedEquipment ? 'Update' : 'Create' })] })] }) })] }));
}
//# sourceMappingURL=Inventory.js.map