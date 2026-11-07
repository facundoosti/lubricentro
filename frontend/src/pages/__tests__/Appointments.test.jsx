import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import Appointments from '@pages/Appointments';

// FullCalendar no renderiza en jsdom: lo reemplazamos por un doble que pinta los eventos
// con el eventContent real y expone los callbacks de navegación/desmontaje.
vi.mock('@fullcalendar/react', () => ({
  default: (props) => (
    <div>
      <button type="button" onClick={() => props.datesSet({ view: { currentStart: new Date(2026, 11, 1) } })}>
        mes siguiente
      </button>
      <button type="button" onClick={() => props.eventWillUnmount?.({ event: props.events[0] })}>
        desmontar evento
      </button>
      {props.events.map((ev) => (
        <div key={ev.id}>
          {props.eventContent({ event: { title: ev.title, extendedProps: ev.extendedProps } })}
        </div>
      ))}
    </div>
  ),
}));
vi.mock('@fullcalendar/daygrid', () => ({ default: {} }));
vi.mock('@fullcalendar/timegrid', () => ({ default: {} }));
vi.mock('@fullcalendar/interaction', () => ({ default: {} }));

const appointment = {
  id: 1,
  scheduled_at: '2026-11-10T11:00:00Z',
  status: 'scheduled',
  customer: { name: 'Ana Gómez' },
  vehicle: { brand: 'Ford', model: 'Ka', license_plate: 'AB123CD' },
};
vi.mock('@services/appointmentsService', () => ({
  useAppointmentsByMonth: () => ({ data: { data: [appointment] }, isLoading: false }),
  useCreateAppointment: () => ({ mutateAsync: vi.fn() }),
  useUpdateAppointment: () => ({ mutateAsync: vi.fn() }),
  useDeleteAppointment: () => ({ mutateAsync: vi.fn() }),
}));
vi.mock('@services/notificationService', () => ({
  showAppointmentSuccess: vi.fn(), showAppointmentError: vi.fn(), parseApiError: vi.fn(),
}));
vi.mock('@components/features/appointments/AppointmentModal', () => ({ default: () => null }));

const hoverEvent = () => {
  const event = screen.getByText(/Ana Gómez - Ford Ka/);
  fireEvent.mouseEnter(event, { clientX: 10, clientY: 10 });
  expect(screen.getByText(/· AB123CD/)).toBeInTheDocument();
};

describe('Appointments — tooltip del calendario', () => {
  it('se oculta al cambiar de mes aunque el puntero no salga del evento', () => {
    renderWithProviders(<Appointments />);
    hoverEvent();
    fireEvent.click(screen.getByRole('button', { name: 'mes siguiente' }));
    expect(screen.queryByText(/· AB123CD/)).not.toBeInTheDocument();
  });

  it('se oculta si el evento se desmonta bajo el puntero', () => {
    renderWithProviders(<Appointments />);
    hoverEvent();
    fireEvent.click(screen.getByRole('button', { name: 'desmontar evento' }));
    expect(screen.queryByText(/· AB123CD/)).not.toBeInTheDocument();
  });
});
