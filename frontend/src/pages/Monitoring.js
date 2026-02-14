import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useFetch } from '../hooks/useFetch';
import { useForm } from '../hooks/useForm';
import { eventsApi } from '../api/events';
import { inventoryApi } from '../api/inventory';
import { useAuth } from '../contexts/AuthContext';
export function Monitoring() {
    const { hasRole } = useAuth();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedLab, setSelectedLab] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: eventsData, execute: refetchEvents } = useFetch(() => eventsApi.getAll());
    const { data: labsData } = useFetch(() => inventoryApi.getAllLabs());
    const labOptions = labsData?.labs.map(lab => ({ value: lab.id, label: lab.name })) || [];
    // Generate time slots (8 AM to 8 PM)
    const timeSlots = Array.from({ length: 13 }, (_, i) => {
        const hour = i + 8;
        return `${hour.toString().padStart(2, '0')}:00`;
    });
    // Filter events for selected date and lab
    const filteredEvents = eventsData?.events.filter(event => {
        const eventDate = new Date(event.startDate).toISOString().split('T')[0];
        const matchesDate = eventDate === selectedDate;
        const matchesLab = selectedLab ? event.location === labsData?.labs.find(l => l.id === selectedLab)?.name : true;
        return matchesDate && matchesLab;
    }) || [];
    const eventForm = useForm({
        initialValues: {
            title: '',
            description: '',
            startDate: '',
            endDate: '',
            location: '',
        },
        onSubmit: async (values) => {
            await eventsApi.create({
                ...values,
                startDate: new Date(values.startDate).toISOString(),
                endDate: new Date(values.endDate).toISOString(),
            });
            setIsModalOpen(false);
            eventForm.reset();
            refetchEvents();
        },
    });
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Daily Monitoring" }), _jsx("p", { className: "text-gray-500 mt-1", children: "View and manage lab schedules" })] }), hasRole('ADMIN', 'LAB_ASSISTANT') && (_jsx(Button, { onClick: () => setIsModalOpen(true), children: "+ Add Event" }))] }), _jsx(Card, { children: _jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Date" }), _jsx("input", { type: "date", value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), className: "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" })] }), _jsx("div", { className: "flex-1", children: _jsx(Select, { label: "Filter by Lab", value: selectedLab, onChange: (e) => setSelectedLab(e.target.value), options: [{ value: '', label: 'All Labs' }, ...labOptions] }) })] }) }), _jsx(Card, { children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("div", { className: "min-w-[600px]", children: [_jsxs("div", { className: "grid grid-cols-12 gap-2 mb-4 pb-2 border-b border-gray-200", children: [_jsx("div", { className: "col-span-2 font-medium text-gray-500", children: "Time" }), _jsx("div", { className: "col-span-10 font-medium text-gray-500", children: "Events" })] }), _jsx("div", { className: "space-y-2", children: timeSlots.map((time) => {
                                    const slotEvents = filteredEvents.filter(event => {
                                        const eventHour = new Date(event.startDate).getHours();
                                        const slotHour = parseInt(time.split(':')[0]);
                                        return eventHour === slotHour;
                                    });
                                    return (_jsxs("div", { className: "grid grid-cols-12 gap-2 items-start", children: [_jsx("div", { className: "col-span-2 py-3 text-sm font-medium text-gray-600", children: time }), _jsx("div", { className: "col-span-10 min-h-[60px] p-2 bg-gray-50 rounded-lg", children: slotEvents.length > 0 ? (_jsx("div", { className: "space-y-2", children: slotEvents.map(event => (_jsxs("div", { className: "p-2 bg-primary-50 border border-primary-200 rounded-md cursor-pointer hover:bg-primary-100 transition-colors", children: [_jsx("p", { className: "font-medium text-primary-900 text-sm", children: event.title }), _jsx("p", { className: "text-xs text-primary-600", children: event.location })] }, event.id))) })) : (_jsx("span", { className: "text-gray-400 text-sm", children: "No events" })) })] }, time));
                                }) })] }) }) }), _jsx(Modal, { isOpen: isModalOpen, onClose: () => setIsModalOpen(false), title: "Add New Event", children: _jsxs("form", { onSubmit: eventForm.handleSubmit, className: "space-y-4", children: [_jsx(Input, { label: "Event Title", name: "title", value: eventForm.values.title, onChange: eventForm.handleChange, required: true }), _jsx(Input, { label: "Description", name: "description", value: eventForm.values.description, onChange: eventForm.handleChange }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsx(Input, { label: "Start Date & Time", name: "startDate", type: "datetime-local", value: eventForm.values.startDate, onChange: eventForm.handleChange, required: true }), _jsx(Input, { label: "End Date & Time", name: "endDate", type: "datetime-local", value: eventForm.values.endDate, onChange: eventForm.handleChange, required: true })] }), _jsx(Select, { label: "Location", name: "location", value: eventForm.values.location, onChange: eventForm.handleChange, options: labOptions, required: true }), _jsxs("div", { className: "flex justify-end gap-3 pt-4", children: [_jsx(Button, { type: "button", variant: "secondary", onClick: () => setIsModalOpen(false), children: "Cancel" }), _jsx(Button, { type: "submit", isLoading: eventForm.isSubmitting, children: "Create Event" })] })] }) })] }));
}
//# sourceMappingURL=Monitoring.js.map