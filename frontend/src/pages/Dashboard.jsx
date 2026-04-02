import { useNavigate } from 'react-router-dom';
import { Plus, Wrench, FileText, Users, Loader2 } from 'lucide-react';
import PageMeta from '@common/PageMeta';
import { useDashboardStats, useUpcomingAppointments } from '@services/dashboardService';
import DashboardKpiCards from '@components/dashboard/DashboardKpiCards';
import TodayAppointments from '@components/dashboard/TodayAppointments';
import UpcomingAppointments from '@components/dashboard/UpcomingAppointments';
import DashboardAlerts from '@components/dashboard/DashboardAlerts';
import MiniChart from '@components/dashboard/MiniChart';

const QuickAction = ({ icon: Icon, label, onClick, variant = 'default' }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      variant === 'primary'
        ? 'bg-primary-container text-on-primary hover:brightness-110'
        : 'bg-surface-container-high border border-outline-variant text-on-surface hover:bg-surface-container'
    }`}
  >
    <Icon size={14} />
    {label}
  </button>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const { data, isLoading, isError, error } = useDashboardStats();
  const { data: upcomingData } = useUpcomingAppointments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-error gap-2">
        <span className="font-semibold">Error al cargar el dashboard</span>
        <span className="text-sm text-secondary">{error?.message || 'Ocurrió un error inesperado.'}</span>
      </div>
    );
  }

  const d = data?.data || {};
  const metrics = d.metrics || {};
  const todayAppointments = d.recent_activity?.today_appointments || [];
  const upcomingAppointments = upcomingData?.data || [];
  const alerts = d.alerts || [];
  const chartData = d.trends?.monthly_services || [];

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Buenos días' : now.getHours() < 19 ? 'Buenas tardes' : 'Buenas noches';
  const dateLabel = now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <>
      <PageMeta
        title="Dashboard - Sistema Lubricentro"
        description="Panel de control del sistema de gestión para lubricentro"
      />

      <div className="flex flex-col gap-4 p-4 h-full">

        {/* Header */}
        <div className="flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-base font-bold text-on-surface leading-tight">{greeting}</h1>
            <p className="text-xs text-secondary capitalize">{dateLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <QuickAction icon={Plus} label="Turno" variant="primary" onClick={() => navigate('/appointments')} />
            <QuickAction icon={Wrench} label="Atención" onClick={() => navigate('/atenciones/nueva')} />
            <QuickAction icon={FileText} label="Presupuesto" onClick={() => navigate('/presupuestos/nuevo')} />
            <QuickAction icon={Users} label="Clientes" onClick={() => navigate('/customers')} />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="flex-shrink-0">
          <DashboardKpiCards metrics={metrics} />
        </div>

        {/* Alerts (conditional) */}
        {alerts.length > 0 && (
          <div className="flex-shrink-0">
            <DashboardAlerts alerts={alerts} />
          </div>
        )}

        {/* Main section: Today appointments + Upcoming & Budgets */}
        <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
          <div className="col-span-12 lg:col-span-7 min-h-0">
            <TodayAppointments appointments={todayAppointments} />
          </div>
          <div className="col-span-12 lg:col-span-5 min-h-0">
            <UpcomingAppointments
              appointments={upcomingAppointments}
              pendingBudgets={metrics.pending_budgets || 0}
            />
          </div>
        </div>

        {/* Chart */}
        <div className="flex-shrink-0">
          <MiniChart data={chartData} />
        </div>

      </div>
    </>
  );
}
