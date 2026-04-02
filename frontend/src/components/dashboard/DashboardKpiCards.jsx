import { useState } from 'react';
import { Users, TrendingUp, TrendingDown, Calendar, DollarSign, Eye, EyeOff, Receipt, CheckCircle, Clock } from 'lucide-react';
import { formatCurrency } from '@services/dashboardService';

const ChangeBadge = ({ value }) => {
  const isPositive = value >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-full ${isPositive ? 'bg-tertiary/15 text-tertiary' : 'bg-error-container text-on-error-container'}`}>
      {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
      {Math.abs(value)}%
    </span>
  );
};

const DashboardKpiCards = ({ metrics }) => {
  const [showIncome, setShowIncome] = useState(true);
  const m = metrics || {};

  const appointmentsToday = m.appointments_today || 0;
  const servicesCompletedToday = m.services_completed_today || 0;
  const pendingToday = Math.max(0, appointmentsToday - servicesCompletedToday);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

      {/* Clientes atendidos */}
      <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center">
            <Users size={18} className="text-primary" />
          </div>
          <ChangeBadge value={m.customers_change || 0} />
        </div>
        <div>
          <p className="text-xs text-secondary mb-1">Clientes atendidos</p>
          <p className="text-2xl font-bold text-on-surface leading-none">{m.monthly_customers_served ?? 0}</p>
          <p className="text-xs text-on-surface-variant mt-1.5">Esta semana: {m.weekly_customers_served ?? 0}</p>
        </div>
      </div>

      {/* Ingresos */}
      <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center">
            <DollarSign size={18} className="text-primary" />
          </div>
          <div className="flex items-center gap-1.5">
            <ChangeBadge value={m.revenue_change || 0} />
            <button
              onClick={() => setShowIncome(v => !v)}
              className="text-secondary hover:text-on-surface transition-colors"
              title={showIncome ? 'Ocultar ingresos' : 'Mostrar ingresos'}
            >
              {showIncome ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs text-secondary mb-1">Ingresos del mes</p>
          <p className="text-2xl font-bold text-on-surface leading-none">
            {showIncome ? formatCurrency(m.monthly_revenue || 0) : '$ ••••••'}
          </p>
          <p className="text-xs text-on-surface-variant mt-1.5">
            Esta semana: {showIncome ? formatCurrency(m.weekly_revenue || 0) : '••••'}
          </p>
        </div>
      </div>

      {/* Turnos hoy */}
      <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center">
            <Calendar size={18} className="text-primary" />
          </div>
          <ChangeBadge value={m.appointments_change || 0} />
        </div>
        <div>
          <p className="text-xs text-secondary mb-1">Turnos hoy</p>
          <p className="text-2xl font-bold text-on-surface leading-none">{appointmentsToday}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 text-xs bg-tertiary/15 text-tertiary px-2 py-0.5 rounded-full">
              <CheckCircle size={10} />
              {servicesCompletedToday} completados
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-warning-500/15 text-warning-500 px-2 py-0.5 rounded-full">
              <Clock size={10} />
              {pendingToday} pend.
            </span>
          </div>
        </div>
      </div>

      {/* Ticket promedio */}
      <div className="bg-surface-container border border-outline-variant rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center">
            <Receipt size={18} className="text-primary" />
          </div>
          {m.pending_budgets > 0 && (
            <span className="text-xs bg-primary-container/20 text-primary px-2 py-0.5 rounded-full font-medium">
              {m.pending_budgets} presup.
            </span>
          )}
        </div>
        <div>
          <p className="text-xs text-secondary mb-1">Ticket promedio</p>
          <p className="text-2xl font-bold text-on-surface leading-none">{formatCurrency(m.average_ticket || 0)}</p>
          <p className="text-xs text-on-surface-variant mt-1.5">Retención: {m.retention_rate ?? 0}%</p>
        </div>
      </div>

    </div>
  );
};

export default DashboardKpiCards;
