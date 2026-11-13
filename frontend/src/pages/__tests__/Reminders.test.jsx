import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import Reminders from '@pages/Reminders';
import { api } from '@services/api';

vi.mock('@services/api', () => ({ api: { get: vi.fn() } }));

const reminder = {
  id: 1,
  status: 'sent',
  next_service_date: '2026-11-20',
  sent_at: '2026-11-10T10:00:00Z',
  customer: { id: 1, name: 'Ana Pérez' },
  vehicle: { id: 2, brand: 'Ford', model: 'Ka', license_plate: 'AB123CD' },
};

const listCalls = () => api.get.mock.calls.map(([url]) => url).filter((url) => url.startsWith('/service_reminders?'));
const lastListParams = () => new URLSearchParams(listCalls().at(-1).split('?')[1]);

beforeEach(() => {
  vi.clearAllMocks();
  api.get.mockImplementation((url) => {
    if (url.startsWith('/service_reminders/statistics')) {
      return Promise.resolve({ data: { data: { sent_this_month: 1, pending: 0, failed: 0 } } });
    }
    return Promise.resolve({ data: { data: { service_reminders: [reminder], pagination: { total_pages: 1 } } } });
  });
});

const pickStatus = async (user, label) => {
  await user.click(screen.getByRole('combobox', { name: 'Estado del recordatorio' }));
  await user.click(await screen.findByRole('option', { name: label }));
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
};

describe('Reminders — filtros', () => {
  it('filtra por estado y "Todos los estados" quita el parámetro status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Reminders />);
    await waitFor(() => expect(listCalls()).toHaveLength(1));
    expect(screen.getByRole('combobox', { name: 'Estado del recordatorio' })).toHaveTextContent('Todos los estados');

    await pickStatus(user, 'Enviado');
    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }));
    await waitFor(() => expect(lastListParams().get('status')).toBe('sent'));

    // Con otra búsqueda para que no responda la caché del primer pedido (sin filtros)
    await pickStatus(user, 'Todos los estados');
    fireEvent.change(screen.getByPlaceholderText('Cliente o Patente...'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }));
    await waitFor(() => expect(lastListParams().get('search')).toBe('Ana'));
    expect(lastListParams().has('status')).toBe(false);
  });
});

describe('Reminders — rango de fechas', () => {
  it('tipear desde/hasta en dd/mm/aaaa manda start_date y end_date en ISO', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Reminders />);
    await waitFor(() => expect(listCalls()).toHaveLength(1));
    await user.type(screen.getByRole('textbox', { name: 'Desde' }), '01112026');
    await user.type(screen.getByRole('textbox', { name: 'Hasta' }), '30112026');
    expect(screen.getByRole('textbox', { name: 'Desde' })).toHaveValue('01/11/2026');
    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }));
    await waitFor(() => expect(lastListParams().get('start_date')).toBe('2026-11-01'));
    expect(lastListParams().get('end_date')).toBe('2026-11-30');
  });

  it('con una fecha incompleta aplica el resto de los filtros, no esa fecha, y avisa; al corregirla, sí', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Reminders />);
    await waitFor(() => expect(listCalls()).toHaveLength(1));
    const desde = screen.getByRole('textbox', { name: 'Desde' });
    await user.type(desde, '0111');
    await user.type(screen.getByRole('textbox', { name: 'Hasta' }), '30112026');
    fireEvent.change(screen.getByPlaceholderText('Cliente o Patente...'), { target: { value: 'Ana' } });
    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Revisá las fechas');
    expect(desde).toHaveAttribute('aria-invalid', 'true');
    await waitFor(() => expect(lastListParams().get('search')).toBe('Ana'));
    expect(lastListParams().get('end_date')).toBe('2026-11-30');
    expect(lastListParams().has('start_date')).toBe(false);

    await user.type(desde, '2026');
    fireEvent.click(screen.getByRole('button', { name: 'Filtrar' }));
    await waitFor(() => expect(lastListParams().get('start_date')).toBe('2026-11-01'));
    expect(lastListParams().get('search')).toBe('Ana');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

describe('Reminders — estados', () => {
  it('muestra la carga y después los recordatorios', async () => {
    renderWithProviders(<Reminders />);
    expect(screen.getByText('Cargando recordatorios...')).toBeInTheDocument();
    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument();
  });

  it('muestra el vacío', async () => {
    api.get.mockResolvedValue({ data: { data: { service_reminders: [], pagination: {} } } });
    renderWithProviders(<Reminders />);
    expect(await screen.findByText('No hay recordatorios que coincidan con los filtros.')).toBeInTheDocument();
  });

  it('muestra el error', async () => {
    api.get.mockRejectedValue(new Error('boom'));
    renderWithProviders(<Reminders />);
    expect(await screen.findByText('Error al cargar los recordatorios')).toBeInTheDocument();
  });
});
