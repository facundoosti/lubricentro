import { CalendarIcon, ClockIcon, UserIcon } from '@icons/index.jsx';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

const RecentAppointments = ({ data }) => {
  const appointments = Array.isArray(data) ? data : [
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
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-tertiary/15 text-tertiary';
      case 'pending': return 'bg-warning-500/15 text-warning-500';
      case 'cancelled': return 'bg-error-container text-on-error-container';
      default: return 'bg-surface-container-high text-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendiente';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  return (
    <div className="p-5 bg-surface-container border border-outline-variant rounded-lg">
      <h2 className="mb-4 text-lg font-semibold text-on-surface">Turnos Recientes</h2>
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-secondary">
            No hay turnos programados para hoy
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-3 border border-outline-variant rounded-lg bg-surface-container-high">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-container/20 rounded-lg">
                  <CalendarIcon className="text-primary size-5" />
                </div>
                <div>
                  <p className="font-medium text-on-surface">
                    {appointment.customer}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    {appointment.vehicle}
                  </p>
                  <p className="text-sm text-secondary">
                    {appointment.service}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2 justify-end">
                  <ClockIcon className="text-secondary size-4" />
                  <span className="text-sm font-medium text-on-surface">
                    {appointment.time}
                  </span>
                </div>
                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getStatusColor(appointment.status)}`}>
                  {getStatusText(appointment.status)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentAppointments; 