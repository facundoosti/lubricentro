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
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
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
    <div className="p-4 bg-white rounded-lg shadow-md dark:bg-boxdark">
      <h2 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Turnos Recientes</h2>
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No hay turnos programados para hoy
          </div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg dark:bg-blue-900">
                  <CalendarIcon className="text-blue-600 size-5 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-800 dark:text-white">
                    {appointment.customer}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {appointment.vehicle}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    {appointment.service}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <ClockIcon className="text-gray-400 size-4" />
                  <span className="text-sm font-medium text-gray-800 dark:text-white">
                    {appointment.time}
                  </span>
                </div>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
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