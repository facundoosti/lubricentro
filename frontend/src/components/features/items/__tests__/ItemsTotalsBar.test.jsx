import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useForm } from 'react-hook-form';
import { renderWithProviders } from '@/test/utils';
import ItemsTotalsBar from '@components/features/items/ItemsTotalsBar';

const items = [
  { description: 'Aceite', quantity: 2, unit_price: 10000, iva_rate: '21' },
  { description: 'Lavado', quantity: 1, unit_price: 5000, iva_rate: '' },
];

const Harness = ({ showCard, surcharge = 10, onCancel = vi.fn() }) => {
  const { control } = useForm({ defaultValues: { items_attributes: items, card_surcharge_percentage: surcharge } });
  return (
    <ItemsTotalsBar control={control} formId="f" submitLabel="Guardar" onCancel={onCancel} showCard={showCard} />
  );
};

describe('ItemsTotalsBar', () => {
  it('con tarjeta muestra efectivo/débito y tarjeta con recargo', () => {
    renderWithProviders(<Harness />);
    expect(screen.getByText('Efectivo / Débito')).toBeInTheDocument();
    expect(screen.getByTestId('total-list')).toHaveTextContent('$29.200');
    expect(screen.getByTestId('total-card')).toHaveTextContent('$32.120');
    expect(screen.getByText('Tarjeta de crédito (+10%)')).toBeInTheDocument();
  });

  it('sin tarjeta muestra solo "Total" e ignora el recargo', () => {
    renderWithProviders(<Harness showCard={false} />);
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByTestId('total-list')).toHaveTextContent('$29.200');
    expect(screen.queryByTestId('total-card')).toBeNull();
    expect(screen.queryByText(/Tarjeta de crédito/)).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Desglose/ }));
    expect(screen.getByTestId('subtotal-net')).toHaveTextContent('$20.000');
    expect(screen.getByTestId('iva-21')).toHaveTextContent('$4.200');
    expect(screen.getByTestId('exempt-total')).toHaveTextContent('$5.000');
    expect(screen.queryByText(/Recargo tarjeta/)).toBeNull();
  });

  it('el botón de guardar envía el form y Cancelar avisa', () => {
    const onCancel = vi.fn();
    renderWithProviders(<Harness showCard={false} onCancel={onCancel} />);
    expect(screen.getByRole('button', { name: 'Guardar' })).toHaveAttribute('form', 'f');
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onCancel).toHaveBeenCalled();
  });
});
