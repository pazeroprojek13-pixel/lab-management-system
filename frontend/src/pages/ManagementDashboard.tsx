import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import {
  reportsApi,
  IncidentSummaryData,
  EquipmentHealthData,
  MaintenanceCostData,
} from '../api/reports';

interface DashboardData {
  incidents: IncidentSummaryData;
  equipment: EquipmentHealthData;
  maintenance: MaintenanceCostData;
}

interface ChartSlice {
  label: string;
  value: number;
  color: string;
}

const severityColors: Record<string, string> = {
  LOW: '#22c55e',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  CRITICAL: '#ef4444',
};

function toCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function toFixedHours(value: number): string {
  return `${value.toFixed(1)} h`;
}

function buildConicGradient(slices: ChartSlice[]): string {
  const total = slices.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) return 'conic-gradient(#e5e7eb 0% 100%)';

  let cursor = 0;
  const sections = slices.map((slice) => {
    const start = (cursor / total) * 100;
    cursor += slice.value;
    const end = (cursor / total) * 100;
    return `${slice.color} ${start}% ${end}%`;
  });

  return `conic-gradient(${sections.join(', ')})`;
}

function RingChart({
  title,
  slices,
  totalLabel,
  donut = true,
}: {
  title: string;
  slices: ChartSlice[];
  totalLabel: string;
  donut?: boolean;
}) {
  const total = slices.reduce((sum, item) => sum + item.value, 0);
  const chartStyle = useMemo(
    () => ({ background: buildConicGradient(slices) }),
    [slices]
  );

  return (
    <Card title={title}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative mx-auto h-44 w-44 flex-shrink-0">
          <div className="h-full w-full rounded-full" style={chartStyle} />
          {donut && (
            <div className="absolute inset-7 rounded-full bg-white shadow-inner" />
          )}
          <div className="absolute inset-0 flex items-center justify-center text-center">
            <div>
              <p className="text-2xl font-bold text-gray-900">{total}</p>
              <p className="text-xs text-gray-500">{totalLabel}</p>
            </div>
          </div>
        </div>

        <div className="grid flex-1 grid-cols-1 gap-2">
          {slices.map((slice) => (
            <div key={slice.label} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: slice.color }} />
                <span className="text-sm text-gray-700">{slice.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{slice.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function ManagementDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to load dashboard data';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Management Dashboard</h1>
          <p className="mt-1 text-gray-500">Loading report data...</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-xl border border-gray-200 bg-white" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-96 animate-pulse rounded-xl border border-gray-200 bg-white" />
          <div className="h-96 animate-pulse rounded-xl border border-gray-200 bg-white" />
          <div className="h-96 animate-pulse rounded-xl border border-gray-200 bg-white" />
          <div className="h-96 animate-pulse rounded-xl border border-gray-200 bg-white" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Management Dashboard</h1>
          <p className="mt-1 text-gray-500">Unable to load report data</p>
        </div>
        <Card>
          <div className="flex flex-col items-start gap-4">
            <p className="text-sm text-red-600">{error || 'Unknown error'}</p>
            <Button onClick={load}>Retry</Button>
          </div>
        </Card>
      </div>
    );
  }

  const severitySlices: ChartSlice[] = data.incidents.bySeverity.map((item) => ({
    label: item.severity,
    value: item.count,
    color: severityColors[item.severity] || '#94a3b8',
  }));

  const agingOrder: Array<'0-24h' | '24-72h' | '3-7d' | '>7d'> = ['0-24h', '24-72h', '3-7d', '>7d'];
  const agingMap = new Map(data.incidents.aging.byCategory.map((item) => [item.agingCategory, item.count]));
  const agingRows = agingOrder.map((key) => ({ label: key, value: agingMap.get(key) || 0 }));
  const agingMax = Math.max(...agingRows.map((item) => item.value), 1);

  const equipmentSlices: ChartSlice[] = [
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Management Dashboard</h1>
        <p className="mt-1 text-gray-500">Campus-scoped operational KPI and ISO analytics</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <p className="text-sm text-gray-500">{kpi.label}</p>
            <p className={`mt-2 text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RingChart title="Incident Severity" totalLabel="incidents" slices={severitySlices} donut={false} />

        <Card title="Incident Aging">
          <div className="space-y-3">
            {agingRows.map((row) => {
              const width = `${(row.value / agingMax) * 100}%`;
              return (
                <div key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-700">{row.label}</span>
                    <span className="font-semibold text-gray-900">{row.value}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-100">
                    <div className="h-3 rounded-full bg-indigo-500 transition-all" style={{ width }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <RingChart title="Equipment Status" totalLabel="equipment" slices={equipmentSlices} donut />

        <Card title="Maintenance Cost Per Campus">
          <div className="space-y-3">
            {campusCostRows.length === 0 && (
              <p className="text-sm text-gray-500">No maintenance cost records yet.</p>
            )}
            {campusCostRows.map((row) => {
              const width = `${(row.totalCost / campusCostMax) * 100}%`;
              return (
                <div key={row.campusId}>
                  <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="font-medium text-gray-700">
                      {row.campusName || row.campusCode || row.campusId}
                    </span>
                    <span className="font-semibold text-gray-900">{toCurrency(row.totalCost)}</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-100">
                    <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width }} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">MTTR: {toFixedHours(row.mttrHours)}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
