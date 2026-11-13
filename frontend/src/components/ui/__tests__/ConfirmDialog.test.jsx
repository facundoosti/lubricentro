import { useState } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import ConfirmDialog from '@ui/ConfirmDialog';
import Dialog from '@ui/Dialog';
import { useDialogPortalContainer } from '@ui/dialogContext';

const defaultProps = { isOpen: true, onClose: vi.fn(), onConfirm: vi.fn() };

describe('ConfirmDialog', () => {
  it('cerrado no renderiza nada', () => {
    render(<ConfirmDialog {...defaultProps} isOpen={false} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('es un alertdialog modal etiquetado por el título, con el mensaje como descripción', () => {
    render(<ConfirmDialog {...defaultProps} title="Eliminar Cliente" message="No se puede deshacer" />);
    const dialog = screen.getByRole('alertdialog', { name: 'Eliminar Cliente' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAccessibleDescription('No se puede deshacer');
  });

  it('muestra los textos por defecto', () => {
    render(<ConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Confirmar acción')).toBeInTheDocument();
    expect(screen.getByText('¿Está seguro de que desea realizar esta acción?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument();
  });

  it('confirmar llama onConfirm; cancelar llama onClose', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} onClose={onClose} confirmText="Eliminar" cancelText="Volver" />);
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Volver' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('con isLoading deshabilita ambos botones, muestra spinner y no confirma', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} isLoading confirmText="Eliminar" />);
    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
    const confirm = screen.getByRole('button', { name: /Eliminar/ });
    expect(confirm).toBeDisabled();
    expect(confirm.querySelector('svg')).toBeInTheDocument();
    fireEvent.click(confirm);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('click en el fondo cierra sin ejecutar la acción; click en el panel no', () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} onClose={onClose} />);
    const panel = screen.getByRole('alertdialog');
    fireEvent.pointerDown(panel);
    fireEvent.click(panel);
    expect(onClose).not.toHaveBeenCalled();
    fireEvent.pointerDown(panel.parentElement);
    fireEvent.click(panel.parentElement);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('seleccionar texto del mensaje y soltar sobre el fondo no cierra', () => {
    const onClose = vi.fn();
    render(<ConfirmDialog {...defaultProps} onClose={onClose} message="Texto largo" />);
    const viewport = screen.getByRole('alertdialog').parentElement;
    // pointerdown en el mensaje, el click lo recibe el ancestro común (el fondo)
    fireEvent.pointerDown(screen.getByText('Texto largo'));
    fireEvent.click(viewport);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('con isLoading no cierra por fondo, ✕ ni Escape', async () => {
    const onClose = vi.fn();
    render(<ConfirmDialog {...defaultProps} onClose={onClose} isLoading />);
    const panel = screen.getByRole('alertdialog');
    fireEvent.pointerDown(panel.parentElement);
    fireEvent.click(panel.parentElement);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    fireEvent.keyDown(panel, { key: 'Escape' });
    await new Promise((r) => setTimeout(r, 0));
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
  });

  it('la ✕ (nombre "Cerrar") cierra sin ejecutar la acción', async () => {
    const onConfirm = vi.fn();
    const onClose = vi.fn();
    render(<ConfirmDialog {...defaultProps} onConfirm={onConfirm} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledTimes(1));
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it.each([
    ['danger', 'bg-error', 'text-error'],
    ['warning', 'bg-warning-500', 'text-yellow-500'],
    ['default', 'bg-primary-container', 'text-on-surface-variant'],
  ])('variante %s: estilo del botón confirmar y del ícono', (variant, buttonClass, iconClass) => {
    render(<ConfirmDialog {...defaultProps} variant={variant} confirmText="Dale" />);
    expect(screen.getByRole('button', { name: 'Dale' })).toHaveClass(buttonClass);
    expect(screen.getByRole('alertdialog').querySelector('.lucide-triangle-alert, .lucide-alert-triangle')).toHaveClass(iconClass);
  });

  it('Escape cierra', () => {
    const onClose = vi.fn();
    render(<ConfirmDialog {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('al cancelar, el foco vuelve al botón Eliminar que la abrió', async () => {
    const user = userEvent.setup();
    const Harness = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Eliminar fila</button>
          <ConfirmDialog isOpen={open} onClose={() => setOpen(false)} onConfirm={vi.fn()} />
        </>
      );
    };
    render(<Harness />);
    await user.click(screen.getByRole('button', { name: 'Eliminar fila' }));
    await waitFor(() => expect(screen.getByRole('alertdialog')).toHaveFocus());
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Eliminar fila' })).toHaveFocus());
  });

  it('sobre un Dialog: queda encima y Escape cierra solo la confirmación', () => {
    const closeForm = vi.fn();
    const closeConfirm = vi.fn();
    render(
      <Dialog isOpen onClose={closeForm} title="Formulario" formId="f">
        <ConfirmDialog isOpen onClose={closeConfirm} onConfirm={vi.fn()} />
      </Dialog>,
    );
    const confirm = screen.getByRole('alertdialog');
    const form = screen.getByRole('dialog', { hidden: true });
    // la confirmación se renderiza después en el DOM (mismo z-index): queda encima
    expect(form.compareDocumentPosition(confirm) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.keyDown(confirm, { key: 'Escape' });
    expect(closeConfirm).toHaveBeenCalledTimes(1);
    expect(closeForm).not.toHaveBeenCalled();
  });

  it('provee el contenedor de portales: lo de adentro portea al panel de la confirmación', () => {
    const Probe = () => {
      const container = useDialogPortalContainer();
      return <span data-testid="probe">{container?.getAttribute('role') ?? 'none'}</span>;
    };
    render(<ConfirmDialog {...defaultProps} message={<Probe />} />);
    expect(screen.getByTestId('probe')).toHaveTextContent('alertdialog');
  });

  it('un Dialog abierto desde la confirmación se apila encima y Escape cierra solo ese', () => {
    const closeConfirm = vi.fn();
    const closeInner = vi.fn();
    render(
      <ConfirmDialog
        isOpen
        onClose={closeConfirm}
        onConfirm={vi.fn()}
        message={<Dialog isOpen onClose={closeInner} title="Detalle">contenido</Dialog>}
      />,
    );
    const inner = screen.getByRole('dialog', { name: 'Detalle' });
    expect(inner).toHaveAttribute('data-stacked');
    expect(inner).toHaveClass('max-w-xl');
    fireEvent.keyDown(inner, { key: 'Escape' });
    expect(closeInner).toHaveBeenCalledTimes(1);
    expect(closeConfirm).not.toHaveBeenCalled();
  });
});
