import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '@/test/utils';
import MultiSelectSearch from '@ui/MultiSelectSearch';
import Modal from '@ui/Modal';

const OPTIONS = [
  { value: '1', label: 'Aceites' },
  { value: '2', label: 'Filtros' },
];

describe('MultiSelectSearch — Escape', () => {
  it('dentro de un Modal, Escape con la lista abierta cierra solo la lista; con la lista cerrada cierra el Modal', () => {
    const close = vi.fn();
    renderWithProviders(
      <Modal isOpen onClose={close} title="Filtros">
        <MultiSelectSearch options={OPTIONS} onChange={vi.fn()} placeholder="Categoría" />
      </Modal>,
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
