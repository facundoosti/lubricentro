import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import SearchableSelect from '@ui/SearchableSelect';
import FormDialog from '@ui/FormDialog';

const OPTIONS = [
  { value: '1', label: 'Juan Pérez' },
  { value: '2', label: 'Ana Gómez' },
];

describe('SearchableSelect — Escape', () => {
  it('dentro de un diálogo, Escape con la lista abierta cierra solo la lista; con la lista cerrada cierra el diálogo', () => {
    const close = vi.fn();
    renderWithProviders(
      <FormDialog isOpen onClose={close} title="Nuevo servicio">
        <SearchableSelect options={OPTIONS} onChange={vi.fn()} placeholder="Mecánico" />
      </FormDialog>,
    );
    const trigger = screen.getByRole('button', { name: /Mecánico/ });
    fireEvent.click(trigger);

    fireEvent.keyDown(screen.getByPlaceholderText('Buscar...'), { key: 'Escape' });
    expect(screen.queryByPlaceholderText('Buscar...')).not.toBeInTheDocument();
    expect(close).not.toHaveBeenCalled();

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(close).toHaveBeenCalledTimes(1);
  });
});

describe('SearchableSelect — opciones largas', () => {
  it('cada opción muestra su texto completo en el tooltip', () => {
    const label = 'Filtro de aire pesado WAP-203 - JOHN DEERE 9900 Algodonera JD 540 - JD 540A JD 440c - JD 540B JD 450E - CATERPILLAR 950 - KOMATSU WA200 - NEW HOLLAND W130 - Equivalencias MANN C 23 610 - BALDWIN PA 1890';
    renderWithProviders(<SearchableSelect options={[{ value: '9', label }]} onChange={vi.fn()} placeholder="Producto" />);
    fireEvent.click(screen.getByRole('button', { name: /Producto/ }));
    expect(screen.getByTitle(label)).toHaveTextContent(label);
  });
});
