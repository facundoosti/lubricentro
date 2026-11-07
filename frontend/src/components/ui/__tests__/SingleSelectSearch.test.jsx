import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import SingleSelectSearch from '@ui/SingleSelectSearch';
import FormDialog from '@ui/FormDialog';

const OPTIONS = [
  { value: '1', label: 'Aceites' },
  { value: '2', label: 'Filtros' },
];

describe('SingleSelectSearch — Escape', () => {
  it('con la lista abierta, Escape la cierra', () => {
    renderWithProviders(<SingleSelectSearch options={OPTIONS} onChange={vi.fn()} placeholder="Categoría" />);
    fireEvent.click(screen.getByRole('button', { name: /Categoría/ }));
    const search = screen.getByPlaceholderText('Buscar...');

    fireEvent.keyDown(search, { key: 'Escape' });
    expect(screen.queryByPlaceholderText('Buscar...')).not.toBeInTheDocument();
  });

  it('dentro de un diálogo, Escape con la lista abierta no cierra el diálogo; con la lista cerrada sí', () => {
    const close = vi.fn();
    renderWithProviders(
      <FormDialog isOpen onClose={close} title="Nuevo producto">
        <SingleSelectSearch options={OPTIONS} onChange={vi.fn()} placeholder="Categoría" />
      </FormDialog>,
    );
    const trigger = screen.getByRole('button', { name: /Categoría/ });
    fireEvent.click(trigger);

    fireEvent.keyDown(screen.getByPlaceholderText('Buscar...'), { key: 'Escape' });
    expect(screen.queryByPlaceholderText('Buscar...')).not.toBeInTheDocument();
    expect(close).not.toHaveBeenCalled();

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(close).toHaveBeenCalledTimes(1);
  });
});
