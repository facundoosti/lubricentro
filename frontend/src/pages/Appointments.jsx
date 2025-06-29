import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import PageMeta from '@components/common/PageMeta';
import AppointmentModal from '@components/features/appointments/AppointmentModal';
import ConfirmModal from '@ui/ConfirmModal';
import { 
  useAppointmentsByMonth,
  useCreateAppointment, 
  useUpdateAppointment, 
  useDeleteAppointment 
} from '@services/appointmentsService';
import { useNotificationService } from "@services/notificationService";

const Appointments = () => {
  const calendarRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Servicio de notificaciones
  const notification = useNotificationService();

  // Obtener año y mes actual
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() devuelve 0-11

  // Queries y mutations
  const { data: appointmentsData, error, isLoading, isError } = useAppointmentsByMonth(currentYear, currentMonth);
  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentMutation = useUpdateAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();

  const appointments = appointmentsData?.data || [];

  // Convert appointments to FullCalendar events
  const calendarEvents = appointments.map(appointment => {
    // Build title safely
    const customerName = appointment?.customer?.name || 'Cliente no especificado';
    const vehicleInfo = appointment?.vehicle 
      ? `${appointment.vehicle.brand || 'Marca'} ${appointment.vehicle.model || 'Modelo'}`
      : 'Vehículo no especificado';
    
    const title = `${customerName} - ${vehicleInfo}`;
    
    return {
      id: appointment.id.toString(),
      title: title,
      start: appointment.scheduled_at,
      end: new Date(new Date(appointment.scheduled_at).getTime() + 60 * 60 * 1000), // 1 hour duration
      extendedProps: {
        appointment: appointment,
        status: appointment.status,
        customer: appointment.customer,
        vehicle: appointment.vehicle,
        notes: appointment.notes
      }
    };
  });

  // Handle date selection (create new appointment)
  const handleDateSelect = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  // Handle event click (edit appointment)
  const handleEventClick = (clickInfo) => {
    const appointment = clickInfo.event.extendedProps.appointment;
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  // Handle calendar navigation (prev/next month)
  const handleDatesSet = (dateInfo) => {
    setCurrentDate(dateInfo.start);
  };

  // Handle form submission
  const handleFormSubmit = async (data) => {
    try {
      if (selectedAppointment) {
        // Update existing appointment
        await updateAppointmentMutation.mutateAsync({
          id: selectedAppointment.id,
          data: data
        });
        notification.showAppointmentSuccess('UPDATED');
      } else {
        // Create new appointment
        await createAppointmentMutation.mutateAsync(data);
        notification.showAppointmentSuccess('CREATED');
      }
      setIsModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error saving appointment:', error);
      notification.showAppointmentError('ERROR_CREATE', error.response?.data?.message || error.message);
    }
  };

  // Handle delete appointment
  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    try {
      await deleteAppointmentMutation.mutateAsync(appointmentToDelete.id);
      notification.showAppointmentSuccess('DELETED');
      setIsDeleteModalOpen(false);
      setAppointmentToDelete(null);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      notification.showAppointmentError('ERROR_DELETE', error.response?.data?.message || error.message);
    }
  };

  // Custom event rendering
  const renderEventContent = (eventInfo) => {
    const appointment = eventInfo.event.extendedProps.appointment;
    const statusColors = {
      scheduled: 'bg-blue-500',
      confirmed: 'bg-green-500',
      completed: 'bg-gray-500',
      cancelled: 'bg-red-500'
    };

    const colorClass = statusColors[appointment.status] || 'bg-blue-500';

    return (
      <div className={`${colorClass} text-white p-1 rounded text-xs`}>
        <div className="font-medium truncate">{eventInfo.event.title}</div>
        <div className="text-xs opacity-90">
          {new Date(appointment.scheduled_at).toLocaleTimeString('es-AR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600">Error al cargar los turnos: {error.message}</p>
          <p className="text-gray-500 mt-2">Detalles del error: {JSON.stringify(error)}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-blue-600">Cargando turnos...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-red-600">Error en la consulta de turnos</p>
          <p className="text-gray-500 mt-2">Estado: {JSON.stringify({ isLoading, isError, error })}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Turnos - Sistema Lubricentro"
        description="Gestión de turnos y citas del lubricentro"
      />

      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Turnos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestiona los turnos y citas de los clientes
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="custom-calendar">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={{
                left: "prev,next today",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay",
              }}
              events={calendarEvents}
              selectable={true}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventContent={renderEventContent}
              height="auto"
              locale="es"
              buttonText={{
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día"
              }}
              dayHeaderFormat={{ weekday: 'long' }}
              titleFormat={{ year: 'numeric', month: 'long' }}
              datesSet={handleDatesSet}
            />
          </div>
        </div>

        {/* Modal para crear/editar turno */}
        <AppointmentModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAppointment(null);
          }}
          onSubmit={handleFormSubmit}
          appointment={selectedAppointment}
          isLoading={createAppointmentMutation.isPending || updateAppointmentMutation.isPending}
        />

        {/* Modal de confirmación para eliminar */}
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setAppointmentToDelete(null);
          }}
          onConfirm={handleDeleteAppointment}
          title="Eliminar Turno"
          message={`¿Estás seguro de que quieres eliminar el turno de ${appointmentToDelete?.customer?.name}?`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          isLoading={deleteAppointmentMutation.isPending}
        />
      </div>
    </>
  );
};

export default Appointments; 