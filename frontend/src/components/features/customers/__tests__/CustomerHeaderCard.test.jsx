import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import CustomerHeaderCard from '@components/features/customers/CustomerHeaderCard';

const customer = { id: 4, name: 'Juan Pérez', phone: '11 5555-1234', email: 'juan@test.com', address: 'Calle 123', vehicles_count: 2 };

describe('CustomerHeaderCard', () => {
  it('muestra los datos de contacto y un solo botón Editar', () => {
    renderWithProviders(<CustomerHeaderCard customer={customer} onEdit={vi.fn()} onNewBudget={vi.fn()} />);
    expect(screen.getByText('11 5555-1234')).toBeInTheDocument();
    expect(screen.getByText('juan@test.com')).toBeInTheDocument();
    expect(screen.getByText('Calle 123')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Editar/ })).toHaveLength(1);
  });

  it('WhatsApp abre wa.me con el teléfono normalizado en otra pestaña', () => {
    renderWithProviders(<CustomerHeaderCard customer={customer} onEdit={vi.fn()} onNewBudget={vi.fn()} />);
    const link = screen.getByRole('link', { name: 'WhatsApp' });
    expect(link).toHaveAttribute('href', 'https://wa.me/5491155551234');
    expect(link).toHaveAttribute('target', '_blank');
    expect(screen.getByRole('link', { name: 'Llamar' })).toHaveAttribute('href', 'tel:11 5555-1234');
    expect(screen.getByRole('link', { name: 'Enviar email' })).toHaveAttribute('href', 'mailto:juan@test.com');
  });

  it('sin teléfono no muestra Llamar ni WhatsApp', () => {
    renderWithProviders(
      <CustomerHeaderCard customer={{ ...customer, phone: null, email: null }} onEdit={vi.fn()} onNewBudget={vi.fn()} />,
    );
    expect(screen.queryByRole('link', { name: 'WhatsApp' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Llamar' })).not.toBeInTheDocument();
    expect(screen.getByText('Sin teléfono')).toBeInTheDocument();
  });

  it('dispara Nuevo presupuesto y Editar', () => {
    const onEdit = vi.fn();
    const onNewBudget = vi.fn();
    renderWithProviders(<CustomerHeaderCard customer={customer} onEdit={onEdit} onNewBudget={onNewBudget} />);
    fireEvent.click(screen.getByRole('button', { name: /Nuevo presupuesto/ }));
    fireEvent.click(screen.getByRole('button', { name: /Editar/ }));
    expect(onNewBudget).toHaveBeenCalled();
    expect(onEdit).toHaveBeenCalled();
  });
});
