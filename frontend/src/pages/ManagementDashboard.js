import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { reportsApi, } from '../api/reports';
const severityColors = {
    LOW: '#22c55e',
    MEDIUM: '#3b82f6',
    HIGH: '#f59e0b',
    CRITICAL: '#ef4444',
};
function toCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(value);
}
function toFixedHours(value) {
    return `${value.toFixed(1)} h`;
}
function buildConicGradient(slices) {
    const total = slices.reduce((sum, item) => sum + item.value, 0);
    if (total === 0)
        return 'conic-gradient(#e5e7eb 0% 100%)';
    let cursor = 0;
    const sections = slices.map((slice) => {
        const start = (cursor / total) * 100;
        cursor += slice.value;
        const end = (cursor / total) * 100;
        return `${slice.color} ${start}% ${end}%`;
    });
    return `conic-gradient(${sections.join(', ')})`;
}
function RingChart({ title, slices, totalLabel, donut = true, }) {
    const total = slices.reduce((sum, item) => sum + item.value, 0);
    const chartStyle = useMemo(() => ({ background: buildConicGradient(slices) }), [slices]);
    return (_jsx(Card, { title: title, children: _jsxs("div", { className: "flex flex-col gap-4 md:flex-row md:items-center", children: [_jsxs("div", { className: "relative mx-auto h-44 w-44 flex-shrink-0", children: [_jsx("div", { className: "h-full w-full rounded-full", style: chartStyle }), donut && (_jsx("div", { className: "absolute inset-7 rounded-full bg-white shadow-inner" })), _jsx("div", { className: "absolute inset-0 flex items-center justify-center text-center", children: _jsxs("div", { children: [_jsx("p", { className: "text-2xl font-bold text-gray-900", children: total }), _jsx("p", { className: "text-xs text-gray-500", children: totalLabel })] }) })] }), _jsx("div", { className: "grid flex-1 grid-cols-1 gap-2", children: slices.map((slice) => (_jsxs("div", { className: "flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "h-3 w-3 rounded-full", style: { backgroundColor: slice.color } }), _jsx("span", { className: "text-sm text-gray-700", children: slice.label })] }), _jsx("span", { className: "text-sm font-semibold text-gray-900", children: slice.value })] }, slice.label))) })] }) }));
}
export function ManagementDashboard() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const load = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [incidents, equipment, maintenance] = await Promise.all([
                reportsApi.getIncidentsSummary(),
                reportsApi.getEquipmentHealth(),
                reportsApi.getMaintenanceCost(),
            ]);
            setData({ incidents, equipment, maintenance });
        }
        catch (err) {
            const message = err?.response?.data?.message || err?.message || 'Failed to load dashboard data';
            setError(message);
        }
        finally {
            setIsLoading(false);
        }
    }, []);
    useEffect(() => {
        load();
    }, [load]);
    if (isLoading) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Management Dashboard" }), _jsx("p", { className: "mt-1 text-gray-500", children: "Loading report data..." })] }), _jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5", children: Array.from({ length: 5 }).map((_, index) => (_jsx("div", { className: "h-28 animate-pulse rounded-xl border border-gray-200 bg-white" }, index))) }), _jsxs("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-2", children: [_jsx("div", { className: "h-96 animate-pulse rounded-xl border border-gray-200 bg-white" }), _jsx("div", { className: "h-96 animate-pulse rounded-xl border border-gray-200 bg-white" }), _jsx("div", { className: "h-96 animate-pulse rounded-xl border border-gray-200 bg-white" }), _jsx("div", { className: "h-96 animate-pulse rounded-xl border border-gray-200 bg-white" })] })] }));
    }
    if (error || !data) {
        return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Management Dashboard" }), _jsx("p", { className: "mt-1 text-gray-500", children: "Unable to load report data" })] }), _jsx(Card, { children: _jsxs("div", { className: "flex flex-col items-start gap-4", children: [_jsx("p", { className: "text-sm text-red-600", children: error || 'Unknown error' }), _jsx(Button, { onClick: load, children: "Retry" })] }) })] }));
    }
    const severitySlices = data.incidents.bySeverity.map((item) => ({
        label: item.severity,
        value: item.count,
        color: severityColors[item.severity] || '#94a3b8',
    }));
    const agingOrder = ['0-24h', '24-72h', '3-7d', '>7d'];
    const agingMap = new Map(data.incidents.aging.byCategory.map((item) => [item.agingCategory, item.count]));
    const agingRows = agingOrder.map((key) => ({ label: key, value: agingMap.get(key) || 0 }));
    const agingMax = Math.max(...agingRows.map((item) => item.value), 1);
    const equipmentSlices = [
        { label: 'Active', value: data.equipment.byStatus.active, color: '#16a34a' },
        { label: 'Damaged', value: data.equipment.byStatus.damaged, color: '#dc2626' },
        { label: 'Maintenance', value: data.equipment.byStatus.maintenance, color: '#f59e0b' },
        { label: 'Retired', value: data.equipment.byStatus.retired, color: '#6b7280' },
    ];
    const campusCostRows = data.maintenance.totalCostPerCampus
        .slice()
        .sort((a, b) => b.totalCost - a.totalCost);
    const campusCostMax = Math.max(...campusCostRows.map((item) => item.totalCost), 1);
    const kpis = [
        { label: 'Total Incidents', value: data.incidents.totalIncidents, color: 'text-blue-700' },
        { label: 'Open Incidents', value: data.incidents.byStatus.open, color: 'text-red-700' },
        { label: 'Equipment in Maintenance', value: data.equipment.byStatus.maintenance, color: 'text-amber-700' },
        { label: 'Warranty Expiring Soon', value: data.equipment.warrantyExpiringWithin30Days, color: 'text-orange-700' },
        { label: 'MTTR (hours)', value: toFixedHours(data.maintenance.mttrHours), color: 'text-emerald-700' },
    ];
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "Management Dashboard" }), _jsx("p", { className: "mt-1 text-gray-500", children: "Campus-scoped operational KPI and ISO analytics" })] }), _jsx("div", { className: "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5", children: kpis.map((kpi) => (_jsxs(Card, { children: [_jsx("p", { className: "text-sm text-gray-500", children: kpi.label }), _jsx("p", { className: `mt-2 text-3xl font-bold ${kpi.color}`, children: kpi.value })] }, kpi.label))) }), _jsxs("div", { className: "grid grid-cols-1 gap-6 xl:grid-cols-2", children: [_jsx(RingChart, { title: "Incident Severity", totalLabel: "incidents", slices: severitySlices, donut: false }), _jsx(Card, { title: "Incident Aging", children: _jsx("div", { className: "space-y-3", children: agingRows.map((row) => {
                                const width = `${(row.value / agingMax) * 100}%`;
                                return (_jsxs("div", { children: [_jsxs("div", { className: "mb-1 flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-gray-700", children: row.label }), _jsx("span", { className: "font-semibold text-gray-900", children: row.value })] }), _jsx("div", { className: "h-3 w-full rounded-full bg-gray-100", children: _jsx("div", { className: "h-3 rounded-full bg-indigo-500 transition-all", style: { width } }) })] }, row.label));
                            }) }) }), _jsx(RingChart, { title: "Equipment Status", totalLabel: "equipment", slices: equipmentSlices, donut: true }), _jsx(Card, { title: "Maintenance Cost Per Campus", children: _jsxs("div", { className: "space-y-3", children: [campusCostRows.length === 0 && (_jsx("p", { className: "text-sm text-gray-500", children: "No maintenance cost records yet." })), campusCostRows.map((row) => {
                                    const width = `${(row.totalCost / campusCostMax) * 100}%`;
                                    return (_jsxs("div", { children: [_jsxs("div", { className: "mb-1 flex flex-wrap items-center justify-between gap-2 text-sm", children: [_jsx("span", { className: "font-medium text-gray-700", children: row.campusName || row.campusCode || row.campusId }), _jsx("span", { className: "font-semibold text-gray-900", children: toCurrency(row.totalCost) })] }), _jsx("div", { className: "h-3 w-full rounded-full bg-gray-100", children: _jsx("div", { className: "h-3 rounded-full bg-emerald-500 transition-all", style: { width } }) }), _jsxs("p", { className: "mt-1 text-xs text-gray-500", children: ["MTTR: ", toFixedHours(row.mttrHours)] })] }, row.campusId));
                                })] }) })] })] }));
}
//# sourceMappingURL=ManagementDashboard.js.map