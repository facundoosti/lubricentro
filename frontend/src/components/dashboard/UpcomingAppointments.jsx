import { useNavigate } from 'react-router-dom';
import { Clock, ChevronRight, CalendarClock, FileText } from 'lucide-react';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmado', classes: 'bg-tertiary/15 text-tertiary' },
  scheduled: { label: 'Programado', classes: 'bg-primary-container/20 text-primary' },
  completed: { label: 'Completado', classes: 'bg-surface-container-high text-secondary' },
  cancelled: { label: 'Cancelado', classes: 'bg-error-container text-on-error-container' },
};

const UpcomingAppointments = ({ appointments = [], pendingBudgets = 0 }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3 h-full">

      {/* Próximos turnos */}
      <div className="bg-surface-container border border-outline-variant rounded-xl flex flex-col flex-1">
        <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant flex-shrink-0">
          <div className="flex items-center gap-2">
            <CalendarClock size={16} className="text-primary" />
            <h2 className="text-sm font-semibold text-on-surface">Próximos turnos</h2>
          </div>
          <button
            onClick={() => navigate('/appointments')}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors"
          >
            Ver <ChevronRight size={12} />
          </button>
        </div>

        <div className="flex-1 divide-y divide-outline-variant overflow-y-auto">
          {appointments.length === 0 ? (
            <div className="flex items-center justify-center h-full py-6 text-secondary">
              <p className="text-sm">Sin turnos próximos</p>
            </div>
          ) : (
            appointments.slice(0, 3).map((appt) => {
              const status = STATUS_CONFIG[appt.status] || { label: appt.status, classes: 'bg-surface-container-high text-secondary' };
              const customerName = appt.customer?.name || appt.customer || '—';
              const vehicleLabel = appt.vehicle
                ? `${appt.vehicle.brand || ''} ${appt.vehicle.model || ''} · ${appt.vehicle.license_plate || ''}`.trim()
                : '—';
              const date = appt.formatted_date || appt.scheduled_at
                ? new Date(appt.scheduled_at || appt.formatted_date).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
                : '—';
              const time = appt.scheduled_at
                ? new Date(appt.scheduled_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
                : '—';

              return (
                <div key={appt.id} className="px-4 py-3 hover:bg-surface-container-high transition-colors cursor-default">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-on-surface truncate">{customerName}</p>
                      <p className="text-xs text-secondary truncate">{vehicleLabel}</p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${status.classes}`}>
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1.5">
                    <Clock size={11} className="text-secondary flex-shrink-0" />
                    <span className="text-xs text-on-surface-variant">{date} · {time}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Presupuestos pendientes */}
      <div
        className="bg-surface-container border border-outline-variant rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors flex-shrink-0"
        onClick={() => navigate('/presupuestos')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && navigate('/presupuestos')}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center">
            <FileText size={15} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-secondary">Presupuestos pendientes</p>
            <p className="text-sm font-semibold text-on-surface">{pendingBudgets}</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-secondary" />
      </div>

    </div>
  );
};

export default UpcomingAppointments;
