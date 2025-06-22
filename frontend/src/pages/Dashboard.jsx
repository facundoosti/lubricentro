import LubricentroMetrics from '@components/dashboard/LubricentroMetrics';
import MonthlyServicesChart from '@components/dashboard/MonthlyServicesChart';
import MonthlyTarget from '@components/dashboard/MonthlyTarget';
import RecentAppointments from '@components/dashboard/RecentAppointments';
import PageMeta from '@common/PageMeta';

export default function Dashboard() {
  // Mock data for now - later we'll connect to real API
  const mockDashboardData = {
    metrics: {
      customers: 156,
      customersChange: 12.5,
      vehicles: 203,
      vehiclesChange: 8.3,
      appointmentsToday: 8,
      appointmentsChange: -5.2,
      monthlyRevenue: 45250,
      revenueChange: 15.7
    },
    monthlyServices: [
      { month: 'Ene', services: 45, revenue: 12500 },
      { month: 'Feb', services: 52, revenue: 13800 },
      { month: 'Mar', services: 48, revenue: 13200 },
      { month: 'Abr', services: 61, revenue: 15800 },
      { month: 'May', services: 55, revenue: 14500 },
      { month: 'Jun', services: 67, revenue: 17200 },
    ],
    monthlyTarget: {
      target: 50000,
      current: 45250,
      servicesCompleted: 67,
      servicesTarget: 80
    },
    recentAppointments: [
      {
        id: 1,
        customer: 'Juan Pérez',
        vehicle: 'Toyota Corolla - ABC123',
        service: 'Cambio de aceite',
        time: '09:00',
        status: 'confirmed'
      },
      {
        id: 2,
        customer: 'María García',
        vehicle: 'Honda Civic - XYZ789',
        service: 'Frenos',
        time: '10:30',
        status: 'pending'
      },
      {
        id: 3,
        customer: 'Carlos López',
        vehicle: 'Ford Focus - DEF456',
        service: 'Alineación',
        time: '14:00',
        status: 'confirmed'
      }
    ]
  };

  // TODO: Replace with real API call
  // const { data: dashboardData, isLoading } = useQuery({
  //   queryKey: ['dashboard'],
  //   queryFn: () => api.get('/dashboard/stats'),
  //   staleTime: 5 * 60 * 1000, // 5 minutes
  // });

  const dashboardData = mockDashboardData;
  const isLoading = false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Dashboard - Sistema Lubricentro"
        description="Panel de control del sistema de gestión para lubricentro"
      />
      
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Dashboard - Lubricentro
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Resumen de actividades y métricas del lubricentro
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Métricas principales */}
          <div className="col-span-12 space-y-6 xl:col-span-7">
            <LubricentroMetrics data={dashboardData.metrics} />
            <MonthlyServicesChart data={dashboardData.monthlyServices} />
          </div>

          {/* Objetivo mensual */}
          <div className="col-span-12 xl:col-span-5">
            <MonthlyTarget data={dashboardData.monthlyTarget} />
          </div>

          {/* Turnos recientes */}
          <div className="col-span-12 xl:col-span-7">
            <RecentAppointments data={dashboardData.recentAppointments} />
          </div>
        </div>
      </div>
    </>
  );
} 