import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import CustomerSearchInput from '@components/features/customers/CustomerSearchInput';
import Dialog from '@ui/Dialog';
import { useCustomers, useCustomer } from '@services/customersService';

vi.mock('@services/customersService', () => ({
  useCustomers: vi.fn(),
  useCustomer: vi.fn(() => ({ data: undefined, isLoading: false })),
}));

const ANA = { id: 1, name: 'Ana Pérez', email: 'ana@mail.com' };
const ANA_G = { id: 3, name: 'Ana Gómez', phone: '1144440000' };

// Devuelve resultados solo cuando se buscó algo (como el backend real)
const mockResults = (customers) => {
  useCustomers.mockImplementation(({ search }) => ({
    data: search ? { data: { customers } } : undefined,
    isLoading: false,
  }));
};

const input = () => screen.getByRole('combobox', { name: '' });

const typeAndWait = async (user, text) => {
  await user.type(input(), text);
  await screen.findByRole('listbox');
};

describe('CustomerSearchInput', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResults([]);
    useCustomer.mockReturnValue({ data: undefined, isLoading: false });
  });

  it('↓↓ Enter elige el segundo cliente, muestra "<nombre> - <contacto>" y cierra la lista', async () => {
    mockResults([ANA, ANA_G]);
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSelect = vi.fn();
    renderWithProviders(<CustomerSearchInput value="" onChange={onChange} onSelect={onSelect} />);
    await user.type(input(), 'Ana');
    await screen.findByRole('option', { name: /Ana Gómez/ });
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith(ANA_G);
    expect(onChange).toHaveBeenCalledWith(3);
    expect(input()).toHaveValue('Ana Gómez - 1144440000');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('click en una opción elige el cliente', async () => {
    mockResults([ANA_G]);
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithProviders(<CustomerSearchInput value="" onSelect={onSelect} />);
    await user.type(input(), 'Ana');
    await user.click(await screen.findByRole('option', { name: /Ana Gómez/ }));
    expect(onSelect).toHaveBeenCalledWith(ANA_G);
    expect(input()).toHaveValue('Ana Gómez - 1144440000');
  });

  it('sin resultados muestra "No se encontraron clientes"', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CustomerSearchInput value="" />);
    await typeAndWait(user, 'Zzz');
    expect(await screen.findByText('No se encontraron clientes')).toBeInTheDocument();
  });

  it('antes de buscar muestra "Escribe para buscar"', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CustomerSearchInput value="" />);
    await user.click(input());
    expect(await screen.findByText('Escribe para buscar')).toBeInTheDocument();
  });

  it('limpiar deja el campo vacío y avisa con "" / null', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSelect = vi.fn();
    renderWithProviders(<CustomerSearchInput value="1" initialCustomer={ANA} onChange={onChange} onSelect={onSelect} />);
    expect(input()).toHaveValue('Ana Pérez - ana@mail.com');
    expect(input().className).toMatch(/\bborder-tertiary\b/);
    expect(input().className).toMatch(/\bpr-16\b/);
    await user.click(screen.getByRole('button', { name: 'Limpiar selección' }));
    expect(onChange).toHaveBeenCalledWith('');
    expect(onSelect).toHaveBeenCalledWith(null);
    expect(input()).toHaveValue('');
  });

  it('"+ Crear cliente" con ↓ Enter cuando no hay resultados', async () => {
    const user = userEvent.setup();
    const onCreateNew = vi.fn();
    renderWithProviders(<CustomerSearchInput value="" onCreateNew={onCreateNew} />);
    await user.type(input(), 'Carlos Ruiz');
    await screen.findByRole('option', { name: /Crear cliente "Carlos Ruiz"/ });
    await user.keyboard('{ArrowDown}{Enter}');
    expect(onCreateNew).toHaveBeenCalledWith('Carlos Ruiz');
  });

  it('"+ Crear cliente" va después del último cliente', async () => {
    mockResults([ANA]);
    const user = userEvent.setup();
    const onCreateNew = vi.fn();
    const onSelect = vi.fn();
    renderWithProviders(<CustomerSearchInput value="" onCreateNew={onCreateNew} onSelect={onSelect} />);
    await user.type(input(), 'Ana');
    await screen.findByRole('option', { name: /Ana Pérez/ });
    const options = screen.getAllByRole('option');
    expect(options.at(-1)).toHaveTextContent('+ Crear cliente "Ana"');
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onCreateNew).toHaveBeenCalledWith('Ana');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('no ofrece crear sin la prop onCreateNew', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CustomerSearchInput value="" />);
    await typeAndWait(user, 'Carlos');
    expect(screen.queryByText(/Crear cliente/)).not.toBeInTheDocument();
  });

  it('carga el cliente por id (respuesta de /customers/:id con el cliente en data)', async () => {
    useCustomer.mockReturnValue({ data: { data: { id: 7, name: 'Juan Pérez', phone: '1155551234' } }, isLoading: false });
    renderWithProviders(<CustomerSearchInput value="7" />);
    await waitFor(() => expect(input()).toHaveValue('Juan Pérez - 1155551234'));
  });

  it('muestra "Cliente no encontrado" si el id no existe', async () => {
    useCustomer.mockReturnValue({ data: undefined, isLoading: false });
    renderWithProviders(<CustomerSearchInput value="99" />);
    await waitFor(() => expect(input()).toHaveValue('Cliente no encontrado'));
  });

  it('Escape con la lista cerrada no borra el cliente elegido', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSelect = vi.fn();
    renderWithProviders(<CustomerSearchInput value="1" initialCustomer={ANA} onChange={onChange} onSelect={onSelect} />);
    input().focus();
    await user.keyboard('{Escape}');
    expect(onChange).not.toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
    expect(input()).toHaveValue('Ana Pérez - ana@mail.com');
  });

  it('al reabrir después de elegir muestra "Escribe para buscar" (no "No se encontraron")', async () => {
    mockResults([ANA_G]);
    const user = userEvent.setup();
    renderWithProviders(<CustomerSearchInput value="" />);
    await user.type(input(), 'Ana');
    await user.click(await screen.findByRole('option', { name: /Ana Gómez/ }));
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: 'Mostrar/ocultar opciones' }));
    expect(await screen.findByText('Escribe para buscar')).toBeInTheDocument();
    expect(screen.queryByText('No se encontraron clientes')).not.toBeInTheDocument();
  });

  it('editar el texto conserva la selección si contiene el nombre y deselecciona si no', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onSelect = vi.fn();
    renderWithProviders(<CustomerSearchInput value="1" initialCustomer={ANA} onChange={onChange} onSelect={onSelect} />);
    await user.type(input(), 'x');
    expect(onChange).not.toHaveBeenCalled();
    expect(input().className).toMatch(/\bborder-tertiary\b/);
    await user.clear(input());
    await user.type(input(), 'Ana P');
    expect(onChange).toHaveBeenCalledWith('');
    expect(onSelect).toHaveBeenCalledWith(null);
    expect(input().className).not.toMatch(/\bborder-tertiary\b/);
  });

  it('initialCustomer prellena sin pedir GET /customers/:id', () => {
    renderWithProviders(<CustomerSearchInput value="1" initialCustomer={ANA} />);
    expect(input()).toHaveValue('Ana Pérez - ana@mail.com');
    expect(useCustomer).toHaveBeenCalledWith('1', { enabled: false });
  });

  it('el campo desactiva el autocompletado del navegador y muestra el error', () => {
    renderWithProviders(<CustomerSearchInput value="" error="Requerido" />);
    expect(input()).toHaveAttribute('autocomplete', 'off');
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Requerido')).toBeInTheDocument();
  });
});

describe('CustomerSearchInput — dentro de un Dialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResults([ANA_G]);
  });

  it('la lista va al panel del diálogo y Escape cierra solo la lista', async () => {
    const user = userEvent.setup();
    const close = vi.fn();
    renderWithProviders(
      <Dialog isOpen onClose={close} title="Nuevo Vehículo" formId="vehicle-form">
        <CustomerSearchInput value="" />
      </Dialog>,
    );
    await user.type(input(), 'Ana');
    const listbox = await screen.findByRole('listbox');
    expect(screen.getByRole('dialog', { name: 'Nuevo Vehículo' })).toContainElement(listbox);
    await act(async () => { await user.keyboard('{Escape}'); });
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(close).not.toHaveBeenCalled();
  });

  it('en un diálogo apilado, un click elige el cliente con ambos abiertos', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    const close = vi.fn();
    const closeBottom = vi.fn();
    renderWithProviders(
      <Dialog isOpen onClose={closeBottom} title="Base" formId="base-form">
        <Dialog isOpen onClose={close} title="Nuevo Vehículo" formId="vehicle-form">
          <CustomerSearchInput value="" onSelect={onSelect} />
        </Dialog>
      </Dialog>,
    );
    await user.type(input(), 'Ana');
    await user.click(await screen.findByRole('option', { name: /Ana Gómez/ }));
    expect(onSelect).toHaveBeenCalledWith(ANA_G);
    expect(close).not.toHaveBeenCalled();
    expect(closeBottom).not.toHaveBeenCalled();
  });
});
