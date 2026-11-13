import { useState } from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Dialog from '@ui/Dialog';

const FormDialog = ({ onClose = vi.fn(), children, ...props }) => (
  <Dialog isOpen onClose={onClose} title="Nuevo cliente" subtitle="Completá los datos" formId="customer-form" submitLabel="Guardar" {...props}>
    {children ?? <form id="customer-form"><input aria-label="Nombre" /></form>}
  </Dialog>
);

// Abre el diálogo desde un botón, para probar el retorno de foco
const Opener = ({ renderDialog }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Abrir</button>
      {renderDialog({ isOpen: open, onClose: () => setOpen(false) })}
    </>
  );
};

const bodyLocked = () => document.body.style.overflowY === 'hidden' || document.documentElement.style.overflowY === 'hidden'
  || document.body.style.overflow === 'hidden' || document.documentElement.style.overflow === 'hidden';

// Base UI mueve el foco inicial de forma asíncrona (después del montaje)
const waitForInitialFocus = () => waitFor(() => expect(document.activeElement?.closest('[role="dialog"]')).not.toBeNull());

// Base UI atrapa el Tab con "focus guards": al llegar a uno, redirige el foco en el siguiente tick
const tab = async (user, options) => {
  await user.tab(options);
  await waitFor(() => expect(document.activeElement?.hasAttribute('data-base-ui-focus-guard')).toBe(false));
};

describe('Dialog — modo formulario', () => {
  it('es un diálogo modal etiquetado por su título, con Cancelar y Guardar (submit del form)', () => {
    render(<FormDialog />);
    const dialog = screen.getByRole('dialog', { name: 'Nuevo cliente' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('Completá los datos');
    expect(within(dialog).getByRole('button', { name: 'Cancelar' })).toHaveAttribute('type', 'button');
    const submit = within(dialog).getByRole('button', { name: 'Guardar' });
    expect(submit).toHaveAttribute('type', 'submit');
    expect(submit).toHaveAttribute('form', 'customer-form');
  });

  it('cerrado no renderiza nada', () => {
    render(<FormDialog isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('con isLoading muestra "Guardando..." y deshabilita ambos botones', () => {
    render(<FormDialog isLoading />);
    expect(screen.getByRole('button', { name: /Guardando/ })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });

  it('submitDisabled deshabilita el botón de guardar', () => {
    render(<FormDialog submitDisabled />);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled();
  });

  it('ancho máximo 768px (max-w-3xl), alto máximo 90vh y cuerpo con scroll', () => {
    render(<FormDialog />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveClass('max-w-3xl', 'max-h-[90vh]', 'flex-col');
    expect(screen.getByRole('textbox', { name: 'Nombre' }).closest('.overflow-y-auto')).not.toBeNull();
  });

  it('click en el fondo NO cierra', () => {
    const onClose = vi.fn();
    render(<FormDialog onClose={onClose} />);
    const backdrop = screen.getByTestId('dialog-backdrop');
    fireEvent.pointerDown(backdrop);
    fireEvent.mouseDown(backdrop);
    fireEvent.click(backdrop);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('la ✕ (nombre "Cerrar") y Cancelar cierran', () => {
    const onClose = vi.fn();
    render(<FormDialog onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe('Dialog — modo libre', () => {
  it('sin formId no muestra el footer y sí el contenido y la ✕', () => {
    render(<Dialog isOpen onClose={vi.fn()} title="Info"><p>Contenido propio</p></Dialog>);
    expect(screen.getByText('Contenido propio')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancelar' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Guardar/ })).not.toBeInTheDocument();
  });

  it('showCloseButton=false oculta la ✕ y ariaLabel nombra el diálogo sin título', () => {
    render(<Dialog isOpen onClose={vi.fn()} showCloseButton={false} ariaLabel="Cliente creado">x</Dialog>);
    expect(screen.getByRole('dialog', { name: 'Cliente creado' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument();
  });

  it('bare + ariaLabelledBy: el consumidor arma el contenido y la etiqueta', () => {
    render(
      <Dialog isOpen onClose={vi.fn()} bare ariaLabelledBy="t1">
        <h2 id="t1">Importar</h2>
      </Dialog>,
    );
    expect(screen.getByRole('dialog', { name: 'Importar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument();
  });

  it('click en el fondo cierra; con closeOnBackdrop=false no', () => {
    const onClose = vi.fn();
    const { rerender } = render(<Dialog isOpen onClose={onClose} title="Info">x</Dialog>);
    fireEvent.pointerDown(screen.getByTestId('dialog-backdrop'));
    fireEvent.mouseDown(screen.getByTestId('dialog-backdrop'));
    fireEvent.click(screen.getByTestId('dialog-backdrop'));
    expect(onClose).toHaveBeenCalledTimes(1);

    onClose.mockClear();
    rerender(<Dialog isOpen onClose={onClose} title="Info" closeOnBackdrop={false}>x</Dialog>);
    fireEvent.pointerDown(screen.getByTestId('dialog-backdrop'));
    fireEvent.mouseDown(screen.getByTestId('dialog-backdrop'));
    fireEvent.click(screen.getByTestId('dialog-backdrop'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('un click en un toast no cierra el diálogo', () => {
    const toasts = document.createElement('section');
    toasts.setAttribute('data-sileo-viewport', '');
    toasts.innerHTML = '<button type="button">Cerrar toast</button>';
    document.body.appendChild(toasts);
    const onClose = vi.fn();
    render(<Dialog isOpen onClose={onClose} title="Info">x</Dialog>);
    const toastButton = toasts.querySelector('button');
    fireEvent.pointerDown(toastButton);
    fireEvent.mouseDown(toastButton);
    fireEvent.click(toastButton);
    expect(onClose).not.toHaveBeenCalled();
    toasts.remove();
  });

  it('size="full" ocupa toda la pantalla y no renderiza el fondo', () => {
    render(<Dialog isOpen onClose={vi.fn()} size="full" bare ariaLabel="Visor">x</Dialog>);
    expect(screen.getByRole('dialog', { name: 'Visor' })).toHaveClass('h-full', 'max-w-none');
    expect(screen.queryByTestId('dialog-backdrop')).not.toBeInTheDocument();
  });
});

describe('Dialog — Escape', () => {
  it('Escape cierra', () => {
    const onClose = vi.fn();
    render(<FormDialog onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('Escape que un hijo ya atendió (preventDefault) no cierra', () => {
    const onClose = vi.fn();
    render(
      <FormDialog onClose={onClose}>
        <input aria-label="Lista" onKeyDown={(e) => { if (e.key === 'Escape') e.preventDefault(); }} />
      </FormDialog>,
    );
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Lista' }), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closeOnEscape=false ignora el Escape', () => {
    const onClose = vi.fn();
    render(<FormDialog onClose={onClose} closeOnEscape={false} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe('Dialog — apilado', () => {
  const Stacked = ({ onCloseBottom, onCloseTop, topOpen = true }) => (
    <FormDialog onClose={onCloseBottom} title="Vehículo" formId="vehicle-form">
      <Dialog isOpen={topOpen} onClose={onCloseTop} title="Cliente" formId="inline-customer-form">
        <input aria-label="Nombre del cliente" />
      </Dialog>
    </FormDialog>
  );

  it('Escape cierra solo el de arriba', () => {
    const onCloseBottom = vi.fn();
    const onCloseTop = vi.fn();
    render(<Stacked onCloseBottom={onCloseBottom} onCloseTop={onCloseTop} />);
    fireEvent.keyDown(screen.getByRole('textbox', { name: 'Nombre del cliente' }), { key: 'Escape' });
    expect(onCloseTop).toHaveBeenCalledTimes(1);
    expect(onCloseBottom).not.toHaveBeenCalled();
  });

  it('el de arriba es más angosto (max-w-xl) y con fondo más oscuro', () => {
    render(<Stacked />);
    const top = screen.getByRole('dialog', { name: 'Cliente' });
    expect(top).toHaveClass('max-w-xl');
    expect(top).not.toHaveClass('max-w-3xl');
    const backdrops = screen.getAllByTestId('dialog-backdrop');
    expect(backdrops).toHaveLength(2);
    expect(backdrops[1]).toHaveClass('bg-black/70');
    expect(backdrops[0]).toHaveClass('bg-black/60');
  });

  it('al cerrar el de arriba, el de abajo vuelve a responder al Escape', async () => {
    const onCloseBottom = vi.fn();
    const { rerender } = render(<Stacked onCloseBottom={onCloseBottom} />);
    rerender(<Stacked onCloseBottom={onCloseBottom} topOpen={false} />);
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Cliente' })).not.toBeInTheDocument());
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Vehículo' }), { key: 'Escape' });
    expect(onCloseBottom).toHaveBeenCalledTimes(1);
  });

  it('con dos diálogos hermanos abiertos, al cerrar el de abajo el de arriba sigue respondiendo a Escape', async () => {
    const closeFirst = vi.fn();
    const closeSecond = vi.fn();
    const Siblings = ({ firstOpen }) => (
      <>
        <Dialog isOpen={firstOpen} onClose={closeFirst} title="Primero">uno</Dialog>
        <Dialog isOpen onClose={closeSecond} title="Segundo">dos</Dialog>
      </>
    );
    const { rerender } = render(<Siblings firstOpen />);
    rerender(<Siblings firstOpen={false} />);
    await waitFor(() => expect(screen.queryByRole('dialog', { name: 'Primero', hidden: true })).not.toBeInTheDocument());
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Segundo' }), { key: 'Escape' });
    expect(closeSecond).toHaveBeenCalledTimes(1);
    expect(closeFirst).not.toHaveBeenCalled();
  });

  it('al cerrar el de abajo de dos anidados se cierra también el de arriba (es su hijo en el árbol)', async () => {
    const { rerender } = render(<FormDialog title="Vehículo" formId="vehicle-form"><Dialog isOpen onClose={vi.fn()} title="Cliente">c</Dialog></FormDialog>);
    rerender(<FormDialog isOpen={false} title="Vehículo" formId="vehicle-form"><Dialog isOpen onClose={vi.fn()} title="Cliente">c</Dialog></FormDialog>);
    await waitFor(() => expect(screen.queryAllByRole('dialog', { hidden: true })).toHaveLength(0));
  });

  it('un diálogo que estuvo apilado vuelve al nivel 0 (ancho normal) al abrirlo solo', async () => {
    const Customer = (props) => <Dialog isOpen onClose={vi.fn()} title="Cliente" formId="customer-form" {...props}>c</Dialog>;
    const { rerender } = render(<FormDialog title="Vehículo" formId="vehicle-form"><Customer /></FormDialog>);
    expect(screen.getByRole('dialog', { name: 'Cliente' })).toHaveAttribute('data-stacked');
    rerender(<FormDialog isOpen={false} title="Vehículo" formId="vehicle-form"><Customer /></FormDialog>);
    await waitFor(() => expect(screen.queryAllByRole('dialog', { hidden: true })).toHaveLength(0));
    rerender(<Customer />);
    const alone = screen.getByRole('dialog', { name: 'Cliente' });
    expect(alone).not.toHaveAttribute('data-stacked');
    expect(alone).toHaveClass('max-w-3xl');
    expect(alone).not.toHaveClass('max-w-xl');
  });

  it('con dos apilados, Tab nunca llega a un elemento del de abajo', async () => {
    const user = userEvent.setup();
    render(<Stacked />);
    const top = screen.getByRole('dialog', { name: 'Cliente' });
    await waitFor(() => expect(top.contains(document.activeElement)).toBe(true));
    for (let i = 0; i < 6; i += 1) {
      await tab(user);
      expect(top.contains(document.activeElement)).toBe(true);
    }
  });
});

describe('Dialog — foco, fondo y scroll', () => {
  it('enfoca el panel al abrir y devuelve el foco al botón que lo abrió', async () => {
    const user = userEvent.setup();
    render(<Opener renderDialog={(p) => <FormDialog {...p} />} />);
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    await waitFor(() => expect(screen.getByRole('dialog')).toHaveFocus());
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus());
  });

  it('respeta el autoFocus de un campo y al cerrar devuelve el foco', async () => {
    const user = userEvent.setup();
    render(
      <Opener
        renderDialog={(p) => (
          <FormDialog {...p}><input aria-label="Patente" autoFocus /></FormDialog>
        )}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Abrir' }));
    await waitForInitialFocus();
    expect(screen.getByRole('textbox', { name: 'Patente' })).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Abrir' })).toHaveFocus());
  });

  it('Tab desde el último elemento vuelve al primero y Shift+Tab desde el primero va al último', async () => {
    const user = userEvent.setup();
    render(<FormDialog />);
    const dialog = screen.getByRole('dialog');
    const close = within(dialog).getByRole('button', { name: 'Cerrar' });
    const submit = within(dialog).getByRole('button', { name: 'Guardar' });
    await waitForInitialFocus();
    submit.focus();
    await tab(user);
    expect(close).toHaveFocus();
    await tab(user, { shift: true });
    expect(submit).toHaveFocus();
  });

  it('el contenido de la app queda fuera del árbol accesible y del Tab con el diálogo abierto', async () => {
    const user = userEvent.setup();
    render(
      <>
        <div data-testid="app"><button type="button">Botón de la app</button></div>
        <FormDialog />
      </>,
    );
    expect(screen.getByTestId('app').closest('[aria-hidden="true"], [inert]')).not.toBeNull();
    const dialog = screen.getByRole('dialog');
    await waitForInitialFocus();
    for (let i = 0; i < 5; i += 1) {
      await tab(user);
      expect(dialog.contains(document.activeElement)).toBe(true);
    }
  });

  it('bloquea el scroll del body mientras está abierto y lo restaura al cerrar', async () => {
    const { rerender } = render(<FormDialog />);
    await waitFor(() => expect(bodyLocked()).toBe(true));
    rerender(<FormDialog isOpen={false} />);
    await waitFor(() => expect(bodyLocked()).toBe(false));
  });

  it('al cerrar restaura el overflow previo del body', async () => {
    document.body.style.overflow = 'scroll';
    try {
      const { rerender } = render(<FormDialog />);
      await waitFor(() => expect(bodyLocked()).toBe(true));
      rerender(<FormDialog isOpen={false} />);
      await waitFor(() => expect(document.body.style.overflow).toBe('scroll'));
    } finally {
      document.body.style.overflow = '';
    }
  });
});
