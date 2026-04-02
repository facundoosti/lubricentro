import { useNavigate } from 'react-router-dom';
import { CalendarDays, ChevronRight } from 'lucide-react';

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmado', classes: 'bg-tertiary/15 text-tertiary' },
  scheduled: { label: 'Programado', classes: 'bg-primary-container/20 text-primary' },
  completed: { label: 'Completado', classes: 'bg-surface-container-high text-secondary' },
  cancelled: { label: 'Cancelado', classes: 'bg-error-container text-on-error-container' },
};

const StatusDot = ({ status }) => {
  const dots = {
    confirmed: 'bg-tertiary',
    scheduled: 'bg-primary',
    completed: 'bg-secondary',
    cancelled: 'bg-error',
  };
  return (
    <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 mt-1 ${dots[status] || 'bg-secondary'}`} />
  );
};

const TodayAppointments = ({ appointments = [] }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-surface-container border border-outline-variant rounded-xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant flex-shrink-0">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-primary" />
          <h2 className="text-sm font-semibold text-on-surface">Turnos de hoy</h2>
          {appointments.length > 0 && (
            <span className="text-xs bg-surface-container-high text-secondary px-1.5 py-0.5 rounded-full">
              {appointments.length}
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/appointments')}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-0.5 transition-colors"
        >
          Ver todos <ChevronRight size={12} />
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto divide-y divide-outline-variant">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-8 text-secondary">
            <CalendarDays size={28} className="mb-2 opacity-40" />
            <p className="text-sm">Sin turnos para hoy</p>
          </div>
        ) : (
          appointments.map((appt) => {
            const status = STATUS_CONFIG[appt.status] || { label: appt.status, classes: 'bg-surface-container-high text-secondary' };
            return (
              <div
                key={appt.id}
                className="flex items-start gap-3 px-4 py-2.5 hover:bg-surface-container-high transition-colors cursor-default"
              >
                <StatusDot status={appt.status} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">{appt.customer}</p>
                  <p className="text-xs text-secondary truncate">{appt.vehicle}</p>
                  {appt.service && appt.service !== 'Servicio general' && (
                    <p className="text-xs text-on-surface-variant truncate">{appt.service}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-xs font-semibold text-on-surface tabular-nums">{appt.time}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${status.classes}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TodayAppointments;
