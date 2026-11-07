import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import SlideOver from '@ui/SlideOver';

describe('SlideOver', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('con dos paneles apilados, Escape cierra solo el de arriba', () => {
    const closeBottom = vi.fn();
    const closeTop = vi.fn();
    render(
      <>
        <SlideOver isOpen onClose={closeBottom} title="Abajo">contenido</SlideOver>
        <SlideOver isOpen onClose={closeTop} title="Arriba">contenido</SlideOver>
      </>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closeTop).toHaveBeenCalledTimes(1);
    expect(closeBottom).not.toHaveBeenCalled();
  });

  it('bloquea el scroll del body y lo restaura al cerrar el último panel', () => {
    const { rerender } = render(
      <>
        <SlideOver isOpen onClose={vi.fn()} title="Abajo" />
        <SlideOver isOpen onClose={vi.fn()} title="Arriba" />
      </>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <>
        <SlideOver isOpen onClose={vi.fn()} title="Abajo" />
        <SlideOver isOpen={false} onClose={vi.fn()} title="Arriba" />
      </>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <>
        <SlideOver isOpen={false} onClose={vi.fn()} title="Abajo" />
        <SlideOver isOpen={false} onClose={vi.fn()} title="Arriba" />
      </>,
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('submitDisabled deshabilita el botón de guardar', () => {
    render(<SlideOver isOpen onClose={vi.fn()} title="Panel" formId="f" submitDisabled />);
    expect(screen.getByRole('button', { name: 'Guardar Cambios' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled();
  });

  it('se renderiza en document.body, enfoca el panel al abrir y devuelve el foco al cerrar', () => {
    const Harness = () => {
      const [open, setOpen] = useState(false);
      return (
        <div data-testid="host">
          <button type="button" onClick={() => setOpen(true)}>Abrir</button>
          <SlideOver isOpen={open} onClose={() => setOpen(false)} title="Panel">
            <p>contenido</p>
          </SlideOver>
        </div>
      );
    };
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Abrir' });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Panel' });
    expect(dialog.parentElement).toBe(document.body);
    expect(screen.getByTestId('host')).not.toContainElement(dialog);
    expect(dialog).toContainElement(document.activeElement);
    expect(document.activeElement).toHaveAttribute('tabindex', '-1');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
