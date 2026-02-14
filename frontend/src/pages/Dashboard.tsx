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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of lab management system</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex items-center">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl mr-4`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Events */}
        <Card title="Upcoming Events" subtitle="Next 5 scheduled events">
          {upcomingEvents.length > 0 ? (
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center text-primary-600">
                    📅
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{event.title}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.startDate).toLocaleDateString()} • {event.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No upcoming events</p>
          )}
        </Card>

        {/* Recent Incidents */}
        <Card title="Recent Incidents" subtitle="Latest reported issues">
          {incidentsData?.incidents.slice(0, 5).length ? (
            <div className="space-y-4">
              {incidentsData.incidents.slice(0, 5).map((incident) => (
                <div key={incident.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0 mr-4">
                    <p className="font-medium text-gray-900 truncate">{incident.title}</p>
                    <p className="text-sm text-gray-500">
                      {incident.lab?.name || 'No lab'} • {new Date(incident.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge status={incident.status}>{incident.status.replace('_', ' ')}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No incidents reported</p>
          )}
        </Card>
      </div>
    </div>
  );
}
