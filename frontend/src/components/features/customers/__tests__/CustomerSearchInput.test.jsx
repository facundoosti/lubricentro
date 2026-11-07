import { screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import CustomerSearchInput from '@components/features/customers/CustomerSearchInput';
import FormDialog from '@ui/FormDialog';
import { useCustomers, useCustomer } from '@services/customersService';

vi.mock('@services/customersService', () => ({
  useCustomers: vi.fn(() => ({ data: { data: { customers: [] } }, isLoading: false })),
  useCustomer: vi.fn(() => ({ data: undefined, isLoading: false })),
}));

describe('CustomerSearchInput — crear cliente', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCustomers.mockReturnValue({ data: { data: { customers: [] } }, isLoading: false });
  });

  it('ofrece crear un cliente con el texto buscado', async () => {
    const onCreateNew = vi.fn();
    renderWithProviders(<CustomerSearchInput value="" onCreateNew={onCreateNew} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Carlos Ruiz' } });

    const option = await screen.findByRole('button', { name: /Crear cliente "Carlos Ruiz"/ });
    fireEvent.click(option);
    expect(onCreateNew).toHaveBeenCalledWith('Carlos Ruiz');
  });

  it('no ofrece crear sin la prop onCreateNew', () => {
    renderWithProviders(<CustomerSearchInput value="" />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Carlos' } });
    expect(screen.queryByText(/Crear cliente/)).not.toBeInTheDocument();
  });

  it('muestra los resultados y también la opción de crear', async () => {
    useCustomers.mockReturnValue({
      data: { data: { customers: [{ id: 1, name: 'Carlos Ruiz', phone: '1155551234' }] } },
      isLoading: false,
    });
    renderWithProviders(<CustomerSearchInput value="" onCreateNew={vi.fn()} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Carlos' } });
    await waitFor(() => expect(screen.getByText('1155551234')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: /Crear cliente "Carlos"/ })).toBeInTheDocument();
  });

  it('sin resultados, flecha abajo + Enter elige "+ Crear cliente"', async () => {
    const onCreateNew = vi.fn();
    renderWithProviders(<CustomerSearchInput value="" onCreateNew={onCreateNew} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Carlos Ruiz' } });
    await screen.findByRole('button', { name: /Crear cliente "Carlos Ruiz"/ });

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCreateNew).toHaveBeenCalledWith('Carlos Ruiz');
  });

  it('con resultados, "+ Crear cliente" es la opción después del último cliente', async () => {
    useCustomers.mockReturnValue({
      data: { data: { customers: [{ id: 1, name: 'Carlos Ruiz', phone: '1155551234' }] } },
      isLoading: false,
    });
    const onCreateNew = vi.fn();
    const onSelect = vi.fn();
    renderWithProviders(<CustomerSearchInput value="" onCreateNew={onCreateNew} onSelect={onSelect} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Carlos' } });
    await waitFor(() => expect(screen.getByText('1155551234')).toBeInTheDocument());

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' }); // no pasa de la última opción
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onCreateNew).toHaveBeenCalledWith('Carlos');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('carga el cliente por id (respuesta de /customers/:id con el cliente en data)', async () => {
    useCustomer.mockReturnValue({ data: { data: { id: 7, name: 'Juan Pérez', phone: '1155551234' } }, isLoading: false });
    renderWithProviders(<CustomerSearchInput value="7" />);
    await waitFor(() => expect(screen.getByRole('textbox')).toHaveValue('Juan Pérez - 1155551234'));
  });
});

describe('CustomerSearchInput — botón de limpiar', () => {
  it('deja lugar para la X y la flecha cuando hay texto (el texto no queda debajo)', () => {
    renderWithProviders(<CustomerSearchInput value="" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toMatch(/\bpr-10\b/);
    fireEvent.change(input, { target: { value: 'Carlos' } });
    expect(screen.getByRole('button', { name: 'Limpiar selección' })).toBeInTheDocument();
    expect(input.className).toMatch(/\bpr-16\b/);
    expect(input.className).not.toMatch(/\bpr-10\b/);
  });
});

describe('CustomerSearchInput — Escape dentro de un diálogo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCustomers.mockReturnValue({ data: { data: { customers: [] } }, isLoading: false });
  });

  it('con la lista abierta, Escape cierra solo la lista; con la lista cerrada, cierra el diálogo', () => {
    const close = vi.fn();
    renderWithProviders(
      <FormDialog isOpen onClose={close} title="Nuevo turno">
        <CustomerSearchInput value="" />
      </FormDialog>,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Carlos' } });
    expect(screen.getByText('Escribe para buscar')).toBeInTheDocument();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByText('Escribe para buscar')).not.toBeInTheDocument();
    expect(close).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: 'Escape' });
    expect(close).toHaveBeenCalledTimes(1);
  });
});

describe('CustomerSearchInput — lista en portal (no la recorta el cuerpo del diálogo)', () => {
  const customer = { id: 3, name: 'Ana Gómez', phone: '1144440000' };

  beforeEach(() => {
    vi.clearAllMocks();
    useCustomers.mockReturnValue({ data: { data: { customers: [customer] } }, isLoading: false });
  });

  const openListInDialog = (props = {}) => {
    const close = vi.fn();
    renderWithProviders(
      <FormDialog isOpen onClose={close} title="Nuevo Vehículo">
        <CustomerSearchInput value="" {...props} />
      </FormDialog>,
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Ana' } });
    return { input, close };
  };

  it('renderiza la lista en document.body, fuera del diálogo, con position fixed y z-index alto', () => {
    openListInDialog();
    const list = screen.getByTestId('customer-search-results');
    expect(list.parentElement).toBe(document.body);
    expect(screen.getByRole('dialog')).not.toContainElement(list);
    expect(list.style.position).toBe('fixed');
    expect(Number(list.style.zIndex)).toBeGreaterThan(50);
  });

  it('click en una opción selecciona el cliente (el mousedown en la lista no la cierra antes)', () => {
    const onSelect = vi.fn();
    const onChange = vi.fn();
    const { input } = openListInDialog({ onSelect, onChange });
    const option = screen.getByRole('button', { name: /Ana Gómez/ });

    fireEvent.mouseDown(option);
    expect(screen.getByTestId('customer-search-results')).toBeInTheDocument();

    fireEvent.click(option);
    expect(onSelect).toHaveBeenCalledWith(customer);
    expect(onChange).toHaveBeenCalledWith(3);
    expect(input).toHaveValue('Ana Gómez - 1144440000');
    expect(screen.queryByTestId('customer-search-results')).not.toBeInTheDocument();
  });

  it('click afuera de input y lista cierra la lista', () => {
    openListInDialog();
    fireEvent.mouseDown(screen.getByRole('heading', { name: 'Nuevo Vehículo' }));
    expect(screen.queryByTestId('customer-search-results')).not.toBeInTheDocument();
  });

  it('navegación con teclado + Enter selecciona desde la lista en portal', () => {
    const onSelect = vi.fn();
    const { input } = openListInDialog({ onSelect });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledWith(customer);
  });

  it('Escape cierra solo la lista, no el diálogo', () => {
    const { input, close } = openListInDialog();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByTestId('customer-search-results')).not.toBeInTheDocument();
    expect(close).not.toHaveBeenCalled();
  });

  it('abre hacia arriba si abajo no hay lugar para la lista', () => {
    const rectSpy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      top: window.innerHeight - 60, bottom: window.innerHeight - 16, left: 100, right: 500,
      width: 400, height: 44, x: 100, y: window.innerHeight - 60,
    });
    openListInDialog();
    const list = screen.getByTestId('customer-search-results');
    expect(list.style.top).toBe('');
    expect(list.style.bottom).toBe('64px');
    expect(list.style.left).toBe('100px');
    expect(list.style.width).toBe('400px');
    rectSpy.mockRestore();
  });
});
