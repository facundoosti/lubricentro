import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import CustomerCreatedDialog from '@components/features/customers/CustomerCreatedDialog';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));

describe('CustomerCreatedDialog', () => {
  beforeEach(() => vi.clearAllMocks());

  it('no muestra nada sin cliente', () => {
    renderWithProviders(<CustomerCreatedDialog customer={null} onClose={vi.fn()} />);
    expect(screen.queryByText('Cliente creado')).not.toBeInTheDocument();
  });

  it('"+ Agregar vehículo" abre el perfil con el alta de vehículo', () => {
    const onClose = vi.fn();
    renderWithProviders(<CustomerCreatedDialog customer={{ id: 5, name: 'Carlos Ruiz' }} onClose={onClose} />);
    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Agregar vehículo/ }));
    expect(onClose).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/customers/5?addVehicle=1');
  });

  it('"Ver perfil" navega al perfil', () => {
    renderWithProviders(<CustomerCreatedDialog customer={{ id: 5, name: 'Carlos Ruiz' }} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /Ver perfil/ }));
    expect(mockNavigate).toHaveBeenCalledWith('/customers/5');
  });

  it('es un diálogo con nombre accesible que cierra con click en el fondo y con Escape', () => {
    const onClose = vi.fn();
    renderWithProviders(<CustomerCreatedDialog customer={{ id: 5, name: 'Carlos Ruiz' }} onClose={onClose} />);
    expect(screen.getByRole('dialog', { name: 'Cliente creado' })).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('modal-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
