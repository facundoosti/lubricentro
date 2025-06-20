import { useQuery } from '@tanstack/react-query';
import { Users, Car, Calendar, Wrench, TrendingUp, AlertTriangle } from 'lucide-react';
import { customersAPI, vehiclesAPI, appointmentsAPI, serviceRecordsAPI } from '../services/api';

export default function Dashboard() {
  // Queries para obtener estadísticas
  const { data: customersData } = useQuery({
    queryKey: ['customers', 'stats'],
    queryFn: () => customersAPI.getAll({ per_page: 1 }),
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['vehicles', 'stats'],
    queryFn: () => vehiclesAPI.getAll({ per_page: 1 }),
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ['appointments', 'upcoming'],
    queryFn: () => appointmentsAPI.upcoming(),
  });

  const { data: serviceRecordsData } = useQuery({
    queryKey: ['serviceRecords', 'overdue'],
    queryFn: () => serviceRecordsAPI.overdue(),
  });

  const statsData = [
    {
      name: 'Total Clientes',
      value: customersData?.data?.pagination?.total_count || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: 'Total Vehículos',
      value: vehiclesData?.data?.pagination?.total_count || 0,
      icon: Car,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive',
    },
    {
      name: 'Turnos Próximos',
      value: appointmentsData?.data?.length || 0,
      icon: Calendar,
      color: 'bg-yellow-500',
      change: '+5',
      changeType: 'neutral',
    },
    {
      name: 'Servicios Vencidos',
      value: serviceRecordsData?.data?.length || 0,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: '-2',
      changeType: 'negative',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Tailwind v4 Test Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">🎉 Tailwind CSS v4.1.10</h2>
            <p className="text-purple-100">¡Migración exitosa! El sistema está usando la última versión de Tailwind.</p>
          </div>
          <div className="flex space-x-2">
            <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">v4.1.10</span>
            <span className="bg-green-500/20 px-3 py-1 rounded-full text-sm font-medium">✅ Activo</span>
          </div>
        </div>
      </div>

      {/* Test de clases básicas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-500 text-white p-4 rounded-lg">
          <h3 className="font-bold">Red Box</h3>
          <p>Clase: bg-red-500</p>
        </div>
        <div className="bg-green-500 text-white p-4 rounded-lg">
          <h3 className="font-bold">Green Box</h3>
          <p>Clase: bg-green-500</p>
        </div>
        <div className="bg-blue-500 text-white p-4 rounded-lg">
          <h3 className="font-bold">Blue Box</h3>
          <p>Clase: bg-blue-500</p>
        </div>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumen general del sistema de lubricentro
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((item) => (
          <div key={item.name} className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${item.color}`}>
                    <item.icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{item.value}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        item.changeType === 'positive' ? 'text-green-600' :
                        item.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {item.changeType === 'positive' && <TrendingUp className="h-4 w-4 flex-shrink-0 self-center" />}
                        {item.changeType === 'negative' && <AlertTriangle className="h-4 w-4 flex-shrink-0 self-center" />}
                        <span className="sr-only">
                          {item.changeType === 'positive' ? 'Increased' : 'Decreased'} by
                        </span>
                        {item.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Acciones Rápidas</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button className="btn-primary">
              <Users className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </button>
            <button className="btn-primary">
              <Car className="h-4 w-4 mr-2" />
              Nuevo Vehículo
            </button>
            <button className="btn-primary">
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Turno
            </button>
            <button className="btn-primary">
              <Wrench className="h-4 w-4 mr-2" />
              Nuevo Servicio
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Actividad Reciente</h3>
        </div>
        <div className="card-body">
          <div className="flow-root">
            <ul role="list" className="-mb-8">
              <li>
                <div className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <Users className="h-4 w-4 text-white" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500">
                          Nuevo cliente registrado: <span className="font-medium text-gray-900">Juan Pérez</span>
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time>Hace 2 horas</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative pb-8">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <Calendar className="h-4 w-4 text-white" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500">
                          Turno confirmado para: <span className="font-medium text-gray-900">María González</span>
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time>Hace 4 horas</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <li>
                <div className="relative">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-yellow-500 flex items-center justify-center ring-8 ring-white">
                        <Wrench className="h-4 w-4 text-white" />
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500">
                          Servicio completado: <span className="font-medium text-gray-900">Cambio de aceite</span>
                        </p>
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <time>Hace 6 horas</time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 