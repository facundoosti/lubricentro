import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { showAppointmentSuccess, showAppointmentError } from '@services/notificationService';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import PageMeta from '@components/common/PageMeta';
import AppointmentModal from '@components/features/appointments/AppointmentModal';
import ConfirmModal from '@ui/ConfirmModal';
import { CalendarDays, List, Plus, Edit, Trash2, ClipboardList, Eye } from 'lucide-react';
import { parseApiError } from '@services/notificationService';
import {
  useAppointmentsByMonth,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment
} from '@services/appointmentsService';

const STATUS_CONFIG = {
  scheduled:  { label: 'Programado',  bg: 'bg-[#27272a]/60',  text: 'text-[#a1a1aa]',  border: 'border-[#71717a]',  dot: 'bg-[#71717a]',  badgeBg: 'bg-[#71717a]/10',  badgeBorder: 'border-[#71717a]/30' },
  confirmed:  { label: 'Confirmado',  bg: 'bg-[#a78bfa]/10',  text: 'text-[#a78bfa]',  border: 'border-[#a78bfa]', dot: 'bg-[#a78bfa]', badgeBg: 'bg-[#a78bfa]/10', badgeBorder: 'border-[#a78bfa]/30' },
  completed:  { label: 'Completado',  bg: 'bg-[#34d399]/10',  text: 'text-[#34d399]',  border: 'border-[#34d399]', dot: 'bg-[#34d399]', badgeBg: 'bg-[#34d399]/10', badgeBorder: 'border-[#34d399]/30' },
  cancelled:  { label: 'Cancelado',   bg: 'bg-[#ef4444]/10',  text: 'text-[#ef4444]',  border: 'border-[#ef4444]', dot: 'bg-[#ef4444]', badgeBg: 'bg-[#ef4444]/10', badgeBorder: 'border-[#ef4444]/30' },
};

const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

const AppointmentTooltip = ({ x, y, appointment }) => {
  const cfg = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.scheduled;
  const time = new Date(appointment.scheduled_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const vehicleInfo = appointment.vehicle
    ? `${appointment.vehicle.brand || ''} ${appointment.vehicle.model || ''}`.trim()
    : null;
  const licensePlate = appointment.vehicle?.license_plate;

  // Flip left if near right edge, flip up if near bottom edge
  const flipX = x + 220 > window.innerWidth;
  const flipY = y + 120 > window.innerHeight;

  return (
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{
        left: flipX ? x - 216 : x + 12,
        top:  flipY ? y - 112 : y + 12,
      }}
    >
      <div className={`bg-surface-container border ${cfg.badgeBorder} rounded-xl shadow-2xl p-3 min-w-[200px] max-w-[240px]`}>
        {/* Status bar */}
        <div className={`w-full h-0.5 rounded-full ${cfg.dot} mb-2.5`} />

        {/* Time */}
        <div className="flex items-center gap-1.5 mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.text}`}>{time}</span>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          <span className={`text-[10px] font-bold uppercase tracking-widest ${cfg.text}`}>{cfg.label}</span>
        </div>

        {/* Customer name */}
        <p className="text-on-surface font-semibold text-sm leading-tight truncate">
          {appointment.customer?.name || 'Cliente no especificado'}
        </p>

        {/* Vehicle */}
        {vehicleInfo && (
          <p className="text-on-surface-variant text-[11px] mt-1 truncate">
            {vehicleInfo}
            {licensePlate && <span className="text-secondary"> · {licensePlate}</span>}
          </p>
        )}
      </div>
    </div>
  );
};

const Appointments = () => {
  const navigate = useNavigate();
  const calendarRef = useRef(null);
  const [view, setView] = useState('calendar'); // 'calendar' | 'list'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, appointment: null });

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const { data: appointmentsData, isLoading } = useAppointmentsByMonth(currentYear, currentMonth);
  const createAppointmentMutation = useCreateAppointment();
  const updateAppointmentMutation = useUpdateAppointment();
  const deleteAppointmentMutation = useDeleteAppointment();

  const appointments = appointmentsData?.data || [];

  const calendarEvents = appointments.map(appointment => {
    const customerName = appointment?.customer?.name || 'Cliente no especificado';
    const vehicleInfo = appointment?.vehicle
      ? `${appointment.vehicle.brand || ''} ${appointment.vehicle.model || ''}`.trim()
      : 'Vehículo no especificado';
    return {
      id: appointment.id.toString(),
      title: `${customerName} - ${vehicleInfo}`,
      start: appointment.scheduled_at,
      end: new Date(new Date(appointment.scheduled_at).getTime() + 60 * 60 * 1000),
      extendedProps: { appointment, status: appointment.status },
    };
  });

  const todayAppointments = appointments.filter(a => {
    const d = new Date(a.scheduled_at);
    const now = new Date();
    return d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();
  });
  const confirmedToday = todayAppointments.filter(a => a.status === 'confirmed').length;

  const openCreate = () => {
    setSelectedAppointment(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedAppointment(clickInfo.event.extendedProps.appointment);
    setIsModalOpen(true);
  };

  const handleDatesSet = (dateInfo) => {
    // currentStart es el primer día del mes activo en la vista,
    // a diferencia de dateInfo.start que es el primer día visible (puede ser del mes anterior)
    setCurrentDate(dateInfo.view.currentStart);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (selectedAppointment) {
        await updateAppointmentMutation.mutateAsync({ id: selectedAppointment.id, data });
        showAppointmentSuccess('UPDATED');
      } else {
        await createAppointmentMutation.mutateAsync(data);
        showAppointmentSuccess('CREATED');
      }
      setIsModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      showAppointmentError('ERROR_CREATE', parseApiError(error));
    }
  };

  const handleDeleteAppointment = async () => {
    if (!appointmentToDelete) return;
    try {
      await deleteAppointmentMutation.mutateAsync(appointmentToDelete.id);
      showAppointmentSuccess('DELETED');
      setIsDeleteModalOpen(false);
      setAppointmentToDelete(null);
    } catch (error) {
      showAppointmentError('ERROR_DELETE', parseApiError(error));
    }
  };

  const handleTooltipMouseEnter = useCallback((e, appointment) => {
    setTooltip({ visible: true, x: e.clientX, y: e.clientY, appointment });
  }, []);

  const handleTooltipMouseMove = useCallback((e) => {
    setTooltip(prev => prev.visible ? { ...prev, x: e.clientX, y: e.clientY } : prev);
  }, []);

  const handleTooltipMouseLeave = useCallback(() => {
    setTooltip({ visible: false, x: 0, y: 0, appointment: null });
  }, []);

  const renderEventContent = (eventInfo) => {
    const { status, appointment } = eventInfo.event.extendedProps;
    const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;
    return (
      <div
        className={`${cfg.bg} border-l-2 ${cfg.border} px-1 py-0.5 rounded text-[10px] ${cfg.text} truncate font-medium cursor-pointer`}
        onMouseEnter={(e) => handleTooltipMouseEnter(e, appointment)}
        onMouseMove={handleTooltipMouseMove}
        onMouseLeave={handleTooltipMouseLeave}
      >
        {new Date(appointment.scheduled_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
        {' '}{eventInfo.event.title}
      </div>
    );
  };

  return (
    <>
      <PageMeta
        title="Turnos - Sistema Lubricentro"
        description="Gestión de turnos y citas del lubricentro"
      />

      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface mb-1">Turnos</h1>
            <p className="text-secondary text-sm">Gestione los horarios de servicio y el mantenimiento próximo de los vehículos.</p>
          </div>
          <div id="tour-appointments-actions" className="flex items-center gap-3">
            {/* View toggle */}
            <div className="flex bg-surface-container rounded-lg p-1 border border-outline-variant">
              <button
                onClick={() => setView('calendar')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors ${
                  view === 'calendar'
                    ? 'bg-surface-container-high text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <CalendarDays className="w-3.5 h-3.5" />
                Calendario
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 transition-colors ${
                  view === 'list'
                    ? 'bg-surface-container-high text-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Lista
              </button>
            </div>
            <button
              id="tour-appointments-new-btn"
              onClick={openCreate}
              className="bg-primary-container text-on-primary font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity active:scale-95 text-sm"
            >
              <Plus className="w-4 h-4" />
              Nuevo Turno
            </button>
          </div>
        </div>

        {/* Calendar View */}
        {view === 'calendar' && (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Calendar (3 cols) */}
            <div id="tour-appointments-calendar" className="xl:col-span-3 bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-xl">
              {/* Legend header */}
              <div className="px-5 py-3 border-b border-outline-variant bg-surface-container-low flex flex-wrap gap-4 items-center justify-end">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-wider">{cfg.label}</span>
                  </div>
                ))}
              </div>
              <div className="appointments-calendar">
                <FullCalendar
                  ref={calendarRef}
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="dayGridMonth"
                  headerToolbar={{
                    left: 'prev,next today',
                    center: 'title',
                    right: 'dayGridMonth,timeGridWeek,timeGridDay',
                  }}
                  events={calendarEvents}
                  selectable={true}
                  select={openCreate}
                  eventClick={handleEventClick}
                  eventContent={renderEventContent}
                  height="auto"
                  locale="es"
                  buttonText={{ today: 'Hoy', month: 'Mes', week: 'Semana', day: 'Día' }}
                  dayHeaderFormat={{ weekday: 'short' }}
                  titleFormat={{ year: 'numeric', month: 'long' }}
                  datesSet={handleDatesSet}
                />
              </div>
            </div>

            {/* Sidebar (1 col) */}
            <div className="space-y-5">
              {/* Today summary */}
              <div className="bg-surface-container border border-outline-variant rounded-xl p-5">
                <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Resumen de Hoy</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface">Total Programados</span>
                    <span className="text-xl font-bold text-on-surface">{isLoading ? '—' : todayAppointments.length}</span>
                  </div>
                  <div className="w-full bg-outline-variant h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: todayAppointments.length ? `${(confirmedToday / todayAppointments.length) * 100}%` : '0%' }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-xs text-on-surface-variant">
                    <span>{confirmedToday} Confirmados</span>
                    <span>{todayAppointments.length - confirmedToday} Pendientes</span>
                  </div>
                </div>
              </div>

              {/* Status legend for quick reference */}
              <div className="bg-surface border border-outline-variant rounded-xl p-5">
                <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Este Mes</h3>
                <div className="space-y-3">
                  {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                    const count = appointments.filter(a => a.status === key).length;
                    return (
                      <div key={key} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span className="text-xs text-on-surface">{cfg.label}</span>
                        </div>
                        <span className={`text-xs font-bold ${cfg.text}`}>{isLoading ? '—' : count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick actions */}
              <div className="bg-surface border border-outline-variant rounded-xl p-5">
                <h3 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-4">Acciones</h3>
                <button
                  onClick={openCreate}
                  className="w-full bg-primary-container text-on-primary font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Turno
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Lista de Turnos — {currentMonth}/{currentYear}
              </h2>
              <span className="text-xs text-on-surface-variant">{appointments.length} turnos</span>
            </div>
            {isLoading ? (
              <div className="p-10 text-center text-secondary text-sm">Cargando turnos...</div>
            ) : appointments.length === 0 ? (
              <div className="p-10 text-center text-secondary text-sm">No hay turnos para este mes.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-surface-container-high border-b border-outline-variant">
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Fecha / Hora</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Cliente</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Vehículo</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Estado</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Notas</th>
                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {appointments.map(appointment => {
                      const cfg = STATUS_CONFIG[appointment.status] || STATUS_CONFIG.scheduled;
                      const date = new Date(appointment.scheduled_at);
                      const isCancelled = appointment.status === 'cancelled';
                      const isCompleted = appointment.status === 'completed';
                      const rowOpacity = isCancelled ? 'opacity-40' : isCompleted ? 'opacity-60' : '';
                      return (
                        <tr key={appointment.id} className="hover:bg-surface-container transition-colors group">
                          <td className={`px-5 py-4 ${rowOpacity}`}>
                            <div className="font-bold text-on-surface text-xs">
                              {date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                            <div className="text-[11px] text-on-surface-variant">
                              {date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className={`px-5 py-4 ${rowOpacity}`}>
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg ${cfg.badgeBg} border ${cfg.badgeBorder} ${cfg.text} flex items-center justify-center font-bold text-[10px]`}>
                                {getInitials(appointment.customer?.name)}
                              </div>
                              <div>
                                <div className="font-medium text-on-surface text-xs">{appointment.customer?.name || '—'}</div>
                                <div className="text-[10px] text-on-surface-variant">{appointment.customer?.phone || appointment.customer?.email || '—'}</div>
                              </div>
                            </div>
                          </td>
                          <td className={`px-5 py-4 ${rowOpacity}`}>
                            {appointment.vehicle ? (
                              <>
                                <div className="text-xs font-bold text-on-surface">{appointment.vehicle.brand} {appointment.vehicle.model}</div>
                                <div className="text-[10px] text-on-surface-variant">{appointment.vehicle.license_plate}</div>
                              </>
                            ) : (
                              <span className="text-[10px] text-on-surface-variant">—</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${cfg.badgeBg} ${cfg.text} border ${cfg.badgeBorder}`}>
                              {cfg.label}
                            </span>
                          </td>
                          <td className={`px-5 py-4 text-[11px] text-on-surface-variant max-w-[180px] truncate ${rowOpacity}`}>
                            {appointment.notes || '—'}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-2">
                              {!isCancelled && (
                                <button
                                  onClick={() => { setSelectedAppointment(appointment); setIsModalOpen(true); }}
                                  className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                                  title="Editar turno"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              {appointment.has_service_record ? (
                                <button
                                  onClick={() => navigate(`/atenciones/${appointment.service_record_id}/editar`)}
                                  className="p-1 text-on-surface-variant hover:text-tertiary transition-colors"
                                  title="Ver atención"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              ) : appointment.can_be_completed && (
                                <button
                                  onClick={() => navigate(`/atenciones/nueva?appointment_id=${appointment.id}`)}
                                  className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                                  title="Registrar atención"
                                >
                                  <ClipboardList className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => { setAppointmentToDelete(appointment); setIsDeleteModalOpen(true); }}
                                className="p-1 text-on-surface-variant hover:text-error transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedAppointment(null); }}
        onSubmit={handleFormSubmit}
        appointment={selectedAppointment}
        isLoading={createAppointmentMutation.isPending || updateAppointmentMutation.isPending}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setAppointmentToDelete(null); }}
        onConfirm={handleDeleteAppointment}
        title="Eliminar Turno"
        message={`¿Estás seguro de que quieres eliminar el turno de ${appointmentToDelete?.customer?.name}?`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        isLoading={deleteAppointmentMutation.isPending}
      />

      {/* Appointment hover tooltip */}
      {tooltip.visible && tooltip.appointment && (
        <AppointmentTooltip x={tooltip.x} y={tooltip.y} appointment={tooltip.appointment} />
      )}
    </>
  );
};

export default Appointments;
