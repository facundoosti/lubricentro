import { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import FormDialog from '@ui/FormDialog';

describe('FormDialog', () => {
  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renderiza un diálogo modal etiquetado por su título, con Cancelar y Guardar', () => {
    render(
      <FormDialog isOpen onClose={vi.fn()} title="Nuevo cliente" subtitle="Completa los datos" formId="f">
        <p>contenido</p>
      </FormDialog>,
    );

    const dialog = screen.getByRole('dialog', { name: 'Nuevo cliente' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('Completa los datos');
    expect(dialog).toHaveClass('max-w-3xl');
    expect(screen.getByText('contenido')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Guardar Cambios' })).toHaveAttribute('form', 'f');
  });

  it('no renderiza nada cerrado', () => {
    render(<FormDialog isOpen={false} onClose={vi.fn()} title="Panel" />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('con isLoading muestra "Guardando..." y deshabilita ambos botones', () => {
    render(<FormDialog isOpen onClose={vi.fn()} title="Panel" formId="f" isLoading />);
    const submit = screen.getByRole('button', { name: /Guardando\.\.\./ });
    expect(submit).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });

  it('submitDisabled deshabilita el botón de guardar', () => {
    render(<FormDialog isOpen onClose={vi.fn()} title="Panel" formId="f" submitDisabled />);
    expect(screen.getByRole('button', { name: 'Guardar Cambios' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeEnabled();
  });

  it('bloquea el scroll del body y lo restaura al cerrar el último diálogo', () => {
    const { rerender } = render(
      <>
        <FormDialog isOpen onClose={vi.fn()} title="Abajo" />
        <FormDialog isOpen onClose={vi.fn()} title="Arriba" />
      </>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <>
        <FormDialog isOpen onClose={vi.fn()} title="Abajo" />
        <FormDialog isOpen={false} onClose={vi.fn()} title="Arriba" />
      </>,
    );
    expect(document.body.style.overflow).toBe('hidden');

    rerender(
      <>
        <FormDialog isOpen={false} onClose={vi.fn()} title="Abajo" />
        <FormDialog isOpen={false} onClose={vi.fn()} title="Arriba" />
      </>,
    );
    expect(document.body.style.overflow).toBe('');
  });

  it('se renderiza en document.body, enfoca el diálogo al abrir y devuelve el foco al cerrar', () => {
    const Harness = () => {
      const [open, setOpen] = useState(false);
      return (
        <div data-testid="host">
          <button type="button" onClick={() => setOpen(true)}>Abrir</button>
          <FormDialog isOpen={open} onClose={() => setOpen(false)} title="Panel">
            <p>contenido</p>
          </FormDialog>
        </div>
      );
    };
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Abrir' });
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Panel' });
    expect(screen.getByTestId('form-dialog-backdrop').parentElement).toBe(document.body);
    expect(screen.getByTestId('host')).not.toContainElement(dialog);
    expect(dialog).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('con un hijo autoFocus, al cerrar devuelve el foco al botón que abrió', () => {
    const Harness = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Abrir</button>
          <FormDialog isOpen={open} onClose={() => setOpen(false)} title="Panel">
            <input aria-label="Nombre" autoFocus />
          </FormDialog>
        </>
      );
    };
    render(<Harness />);
    const trigger = screen.getByRole('button', { name: 'Abrir' });
    trigger.focus();
    fireEvent.click(trigger);

    expect(screen.getByRole('textbox', { name: 'Nombre' })).toHaveFocus();

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});

describe('FormDialog — cierre', () => {
  it('click en el fondo NO cierra el diálogo', () => {
    const close = vi.fn();
    render(<FormDialog isOpen onClose={close} title="Panel">contenido</FormDialog>);
    fireEvent.click(screen.getByTestId('form-dialog-backdrop'));
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Panel' })).toBeInTheDocument();
  });

  it('la ✕ tiene nombre accesible y cierra', () => {
    const close = vi.fn();
    render(<FormDialog isOpen onClose={close} title="Nuevo turno">contenido</FormDialog>);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('Cancelar cierra', () => {
    const close = vi.fn();
    render(<FormDialog isOpen onClose={close} title="Panel">contenido</FormDialog>);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('Escape cierra', () => {
    const close = vi.fn();
    render(<FormDialog isOpen onClose={close} title="Panel">contenido</FormDialog>);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(close).toHaveBeenCalledTimes(1);
  });

  it('Escape que un hijo ya atendió (preventDefault) no cierra el diálogo', () => {
    const close = vi.fn();
    render(
      <FormDialog isOpen onClose={close} title="Panel">
        <input
          aria-label="Campo"
          onKeyDown={(e) => {
            if (e.key === 'Escape') e.preventDefault();
          }}
        />
      </FormDialog>,
    );
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Campo' }), { key: 'Escape' });
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Panel' })).toBeInTheDocument();
  });
});

describe('FormDialog — apilado', () => {
  it('con dos diálogos apilados, Escape cierra solo el de arriba', () => {
    const closeBottom = vi.fn();
    const closeTop = vi.fn();
    render(
      <>
        <FormDialog isOpen onClose={closeBottom} title="Abajo">contenido</FormDialog>
        <FormDialog isOpen onClose={closeTop} title="Arriba">contenido</FormDialog>
      </>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closeTop).toHaveBeenCalledTimes(1);
    expect(closeBottom).not.toHaveBeenCalled();
  });

  it('el de arriba es más angosto, con fondo más oscuro y z-index mayor', () => {
    render(
      <>
        <FormDialog isOpen onClose={vi.fn()} title="Abajo">contenido</FormDialog>
        <FormDialog isOpen onClose={vi.fn()} title="Arriba">contenido</FormDialog>
      </>,
    );

    const bottom = screen.getByRole('dialog', { name: 'Abajo' });
    const top = screen.getByRole('dialog', { name: 'Arriba' });
    expect(bottom).toHaveClass('max-w-3xl');
    expect(top).toHaveClass('max-w-xl');
    expect(top).not.toHaveClass('max-w-3xl');

    const [bottomBackdrop, topBackdrop] = screen.getAllByTestId('form-dialog-backdrop');
    expect(bottomBackdrop).toHaveClass('bg-black/60');
    expect(topBackdrop).toHaveClass('bg-black/70');
    expect(Number(topBackdrop.style.zIndex)).toBeGreaterThan(Number(bottomBackdrop.style.zIndex));
  });

  it('al cerrar el de arriba, el de abajo vuelve a responder al Escape', () => {
    const closeBottom = vi.fn();
    const { rerender } = render(
      <>
        <FormDialog isOpen onClose={closeBottom} title="Abajo" />
        <FormDialog isOpen onClose={vi.fn()} title="Arriba" />
      </>,
    );
    rerender(
      <>
        <FormDialog isOpen onClose={closeBottom} title="Abajo" />
        <FormDialog isOpen={false} onClose={vi.fn()} title="Arriba" />
      </>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closeBottom).toHaveBeenCalledTimes(1);
  });

  it('un diálogo que estuvo apilado vuelve al nivel 0 al reabrirlo solo', () => {
    const { rerender } = render(
      <>
        <FormDialog isOpen onClose={vi.fn()} title="Abajo" />
        <FormDialog isOpen onClose={vi.fn()} title="Arriba" />
      </>,
    );
    expect(screen.getByRole('dialog', { name: 'Arriba' })).toHaveClass('max-w-xl');

    rerender(
      <>
        <FormDialog isOpen={false} onClose={vi.fn()} title="Abajo" />
        <FormDialog isOpen={false} onClose={vi.fn()} title="Arriba" />
      </>,
    );
    rerender(
      <>
        <FormDialog isOpen={false} onClose={vi.fn()} title="Abajo" />
        <FormDialog isOpen onClose={vi.fn()} title="Arriba" />
      </>,
    );

    const reopened = screen.getByRole('dialog', { name: 'Arriba' });
    expect(reopened).toHaveClass('max-w-3xl');
    expect(reopened).not.toHaveClass('max-w-xl');
  });

  it('al cerrar el de abajo con el de arriba abierto, el de arriba sigue respondiendo al Escape', () => {
    const closeBottom = vi.fn();
    const closeTop = vi.fn();
    const { rerender } = render(
      <>
        <FormDialog isOpen onClose={closeBottom} title="Abajo" />
        <FormDialog isOpen onClose={closeTop} title="Arriba" />
      </>,
    );
    rerender(
      <>
        <FormDialog isOpen={false} onClose={closeBottom} title="Abajo" />
        <FormDialog isOpen onClose={closeTop} title="Arriba" />
      </>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closeTop).toHaveBeenCalledTimes(1);
    expect(closeBottom).not.toHaveBeenCalled();
  });
});
