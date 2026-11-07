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
