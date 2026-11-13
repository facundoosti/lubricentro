import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/test/utils';
import ProductImportModal from '@components/features/products/ProductImportModal';

const mocks = vi.hoisted(() => ({
  mutateAsync: vi.fn(),
  isPending: false,
  importStatus: { data: undefined },
  cableHandlers: {},
  showSuccess: vi.fn(),
  showWarning: vi.fn(),
  showError: vi.fn(),
}));

vi.mock('@services/productsService', () => ({
  productKeys: { lists: () => ['products', 'list'] },
  useImportProducts: () => ({ mutateAsync: mocks.mutateAsync, isPending: mocks.isPending }),
  useDownloadImportTemplate: () => vi.fn(),
  useImportStatus: () => mocks.importStatus,
}));

vi.mock('@hooks/useImportCable', () => ({
  useImportCable: (_jobId, handlers) => {
    Object.assign(mocks.cableHandlers, handlers);
  },
}));

vi.mock('@services/notificationService', () => ({
  showSuccess: mocks.showSuccess,
  showWarning: mocks.showWarning,
  showError: mocks.showError,
}));

const xlsx = new File(['x'], 'productos.xlsx', {
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
});

const startImport = async () => {
  const user = userEvent.setup();
  const input = document.querySelector('input[type="file"]');
  await user.upload(input, xlsx);
  await user.click(screen.getByRole('button', { name: /importar$/i }));
  await waitFor(() => expect(screen.getByText(/iniciando importación/i)).toBeInTheDocument());
  return user;
};

describe('ProductImportModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.importStatus = { data: undefined };
    mocks.isPending = false;
    mocks.mutateAsync.mockResolvedValue({ data: { job_id: 'job-1' } });
  });

  it('termina y avisa éxito cuando el estado llega por la consulta periódica', async () => {
    const { rerender } = renderWithProviders(<ProductImportModal isOpen onClose={vi.fn()} />);
    await startImport();

    mocks.importStatus = { data: { type: 'complete', imported: 1790, errors: [] } };
    rerender(<ProductImportModal isOpen onClose={vi.fn()} />);

    expect(await screen.findByText(/producto\(s\) importados correctamente/i)).toBeInTheDocument();
    expect(screen.getByText('1790')).toBeInTheDocument();
    screen.getAllByRole('button', { name: /^cerrar$/i }).forEach((b) => expect(b).toBeEnabled());
    expect(mocks.showSuccess).toHaveBeenCalledWith('1790 producto(s) importados exitosamente');
  });

  it('muestra el progreso que llega por la conexión en vivo', async () => {
    renderWithProviders(<ProductImportModal isOpen onClose={vi.fn()} />);
    await startImport();

    act(() => mocks.cableHandlers.onProgress({ type: 'progress', processed: 40, total: 100, imported: 39, errors_count: 1 }));

    expect(await screen.findByText(/procesando fila 40 de 100/i)).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('avisa una sola vez aunque el fin llegue por las dos vías', async () => {
    const { rerender } = renderWithProviders(<ProductImportModal isOpen onClose={vi.fn()} />);
    await startImport();

    const done = { type: 'complete', imported: 5, errors: [{ row: 3, message: 'El nombre es requerido' }] };
    act(() => mocks.cableHandlers.onComplete(done));
    mocks.importStatus = { data: done };
    rerender(<ProductImportModal isOpen onClose={vi.fn()} />);

    expect(await screen.findByText(/fila 3:/i)).toBeInTheDocument();
    expect(mocks.showWarning).toHaveBeenCalledTimes(1);
    expect(mocks.showWarning).toHaveBeenCalledWith('5 producto(s) importados', '1 fila(s) con errores');
  });

  it('muestra la falla cuando el job no pudo completarse', async () => {
    renderWithProviders(<ProductImportModal isOpen onClose={vi.fn()} />);
    await startImport();

    act(() => mocks.cableHandlers.onFailed({ type: 'failed', imported: 0, errors: ['Error al leer el archivo: no existe'] }));

    expect(await screen.findByText(/no pudo completarse/i)).toBeInTheDocument();
    expect(screen.getByText('Error al leer el archivo: no existe')).toBeInTheDocument();
    expect(mocks.showError).toHaveBeenCalledWith('La importación falló', 'Error al leer el archivo: no existe');
  });

  it('distingue "ningún producto válido" de una falla del proceso', async () => {
    const { rerender } = renderWithProviders(<ProductImportModal isOpen onClose={vi.fn()} />);
    await startImport();

    mocks.importStatus = { data: { type: 'complete', imported: 0, errors: [{ row: 2, message: 'El nombre es requerido' }] } };
    rerender(<ProductImportModal isOpen onClose={vi.fn()} />);

    expect(await screen.findByText(/todas las filas tienen errores/i)).toBeInTheDocument();
    expect(screen.queryByText(/no pudo completarse/i)).not.toBeInTheDocument();
    expect(mocks.showWarning).toHaveBeenCalledWith('No se importó ningún producto', '1 fila(s) con errores');
  });

  it('se rinde y lo informa si la consulta del estado falla de forma persistente', async () => {
    const { rerender } = renderWithProviders(<ProductImportModal isOpen onClose={vi.fn()} />);
    await startImport();

    mocks.importStatus = { data: undefined, isError: true };
    rerender(<ProductImportModal isOpen onClose={vi.fn()} />);

    expect(await screen.findByText(/no pudimos confirmar el estado/i)).toBeInTheDocument();
    screen.getAllByRole('button', { name: /^cerrar$/i }).forEach((b) => expect(b).toBeEnabled());
    expect(mocks.showError).toHaveBeenCalledTimes(1);
  });

  it('permite cerrar durante la importación y avisa igual al terminar', async () => {
    const onClose = vi.fn();
    const { rerender } = renderWithProviders(<ProductImportModal isOpen onClose={onClose} />);
    const user = await startImport();

    expect(screen.getByText(/podés cerrar esta ventana/i)).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /cerrar/i })[0]);
    expect(onClose).toHaveBeenCalled();

    rerender(<ProductImportModal isOpen={false} onClose={onClose} />);
    mocks.importStatus = { data: { type: 'complete', imported: 7, errors: [] } };
    rerender(<ProductImportModal isOpen={false} onClose={onClose} />);

    await waitFor(() => expect(mocks.showSuccess).toHaveBeenCalledWith('7 producto(s) importados exitosamente'));
  });

  it('expone el modal como diálogo accesible', () => {
    renderWithProviders(<ProductImportModal isOpen onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: /importar productos/i })).toBeInTheDocument();
  });

  it('muestra un error si no se pudo iniciar la importación', async () => {
    mocks.mutateAsync.mockRejectedValue({ response: { data: { message: 'Formato no soportado' } } });
    renderWithProviders(<ProductImportModal isOpen onClose={vi.fn()} />);
    const user = userEvent.setup();
    await user.upload(document.querySelector('input[type="file"]'), xlsx);
    await user.click(screen.getByRole('button', { name: /importar$/i }));

    await waitFor(() => expect(mocks.showError).toHaveBeenCalledWith('Error al importar', 'Formato no soportado'));
  });

  describe('cierre', () => {
    it('Escape cierra cuando no está subiendo', () => {
      const onClose = vi.fn();
      renderWithProviders(<ProductImportModal isOpen onClose={onClose} />);
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('Escape no cierra mientras sube el archivo (✕ y Cancelar deshabilitados)', () => {
      mocks.isPending = true;
      const onClose = vi.fn();
      renderWithProviders(<ProductImportModal isOpen onClose={onClose} />);
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      screen.getAllByRole('button', { name: /^(cerrar|cancelar)$/i }).forEach((b) => expect(b).toBeDisabled());
    });

    it('click en el fondo no cierra', () => {
      const onClose = vi.fn();
      renderWithProviders(<ProductImportModal isOpen onClose={onClose} />);
      // Base UI detecta el click en el fondo en pointerdown/mousedown
      const backdrop = screen.getByTestId('dialog-backdrop');
      fireEvent.pointerDown(backdrop);
      fireEvent.mouseDown(backdrop);
      fireEvent.click(backdrop);
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
