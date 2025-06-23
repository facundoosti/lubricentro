import LubricentroMetrics from '@components/dashboard/LubricentroMetrics';
import MonthlyServicesChart from '@components/dashboard/MonthlyServicesChart';
import MonthlyTarget from '@components/dashboard/MonthlyTarget';
import RecentAppointments from '@components/dashboard/RecentAppointments';
import PageMeta from '@common/PageMeta';
import { useDashboardStats } from '../services/dashboardService';

export default function Dashboard() {
  const { data, isLoading, isError, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <span className="font-bold text-lg">Error al cargar el dashboard</span>
        <span className="text-sm">{error?.message || 'Ocurrió un error inesperado.'}</span>
      </div>
    );
  }

  const dashboardData = data?.data || {};

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
            <MonthlyServicesChart data={dashboardData.trends?.monthly_services} />
          </div>

          {/* Objetivo mensual */}
          <div className="col-span-12 xl:col-span-5">
            <MonthlyTarget data={dashboardData.goals} />
          </div>

          {/* Turnos recientes */}
          <div className="col-span-12 xl:col-span-7">
            <RecentAppointments data={dashboardData.recent_activity?.today_appointments} />
          </div>
        </div>
      </div>
    </>
  );
} 