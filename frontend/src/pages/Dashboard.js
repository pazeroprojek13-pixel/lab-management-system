import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useFetch } from '../hooks/useFetch';
import { eventsApi } from '../api/events';
import { inventoryApi } from '../api/inventory';
import { incidentsApi } from '../api/incidents';
import { maintenanceApi } from '../api/maintenance';
export function Dashboard() {
    const { data: eventsData } = useFetch(() => eventsApi.getAll(), { immediate: true });
    const { data: labsData } = useFetch(() => inventoryApi.getAllLabs(), { immediate: true });
    const { data: incidentsData } = useFetch(() => incidentsApi.getAll(), { immediate: true });
    const { data: maintenanceData } = useFetch(() => maintenanceApi.getAll(), { immediate: true });
    const stats = [
        { label: 'Total Labs', value: labsData?.labs.length || 0, icon: '🏢', color: 'bg-blue-500' },
        { label: 'Total Equipment', value: labsData?.labs.reduce((acc, lab) => acc + (lab._count?.equipments || 0), 0) || 0, icon: '🔧', color: 'bg-green-500' },
        { label: 'Open Incidents', value: incidentsData?.incidents.filter(i => i.status === 'OPEN').length || 0, icon: '⚠️', color: 'bg-red-500' },
        { label: 'Scheduled Maintenance', value: maintenanceData?.maintenances.filter(m => m.status === 'SCHEDULED').length || 0, icon: '📅', color: 'bg-yellow-500' },
    ];
    const upcomingEvents = eventsData?.events
        .filter(e => new Date(e.startDate) >= new Date())
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, 5) || [];
    return (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Dashboard" }), _jsx("p", { className: "text-gray-500 mt-1", children: "Overview of lab management system" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: stats.map((stat) => (_jsxs(Card, { className: "flex items-center", children: [_jsx("div", { className: `w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl mr-4`, children: stat.icon }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-500", children: stat.label }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: stat.value })] })] }, stat.label))) }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsx(Card, { title: "Upcoming Events", subtitle: "Next 5 scheduled events", children: upcomingEvents.length > 0 ? (_jsx("div", { className: "space-y-4", children: upcomingEvents.map((event) => (_jsxs("div", { className: "flex items-start space-x-3 p-3 bg-gray-50 rounded-lg", children: [_jsx("div", { className: "flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600", children: "\uD83D\uDCC5" }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsx("p", { className: "font-medium text-gray-900 truncate", children: event.title }), _jsxs("p", { className: "text-sm text-gray-500", children: [new Date(event.startDate).toLocaleDateString(), " \u2022 ", event.location] })] })] }, event.id))) })) : (_jsx("p", { className: "text-gray-500 text-center py-8", children: "No upcoming events" })) }), _jsx(Card, { title: "Recent Incidents", subtitle: "Latest reported issues", children: incidentsData?.incidents.slice(0, 5).length ? (_jsx("div", { className: "space-y-4", children: incidentsData.incidents.slice(0, 5).map((incident) => (_jsxs("div", { className: "flex items-start justify-between p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex-1 min-w-0 mr-4", children: [_jsx("p", { className: "font-medium text-gray-900 truncate", children: incident.title }), _jsxs("p", { className: "text-sm text-gray-500", children: [incident.lab?.name || 'No lab', " \u2022 ", new Date(incident.createdAt).toLocaleDateString()] })] }), _jsx(Badge, { status: incident.status, children: incident.status.replace('_', ' ') })] }, incident.id))) })) : (_jsx("p", { className: "text-gray-500 text-center py-8", children: "No incidents reported" })) })] })] }));
}
//# sourceMappingURL=Dashboard.js.map