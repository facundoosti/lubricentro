import { showSuccess, showWarning, showError } from '@services/notificationService';

export const importErrorText = (e) => (typeof e === 'string' ? e : e?.message);

// Resumen final de una importación: 'success' | 'partial' | 'none' | 'failed'
//  - failed: el proceso no pudo completarse (archivo ilegible, error del servidor…)
//  - none:   terminó bien pero ninguna fila era válida
export const importOutcome = (result) => {
  const errors = result?.errors ?? [];
  if (result?.type === 'failed') return 'failed';
  if (!result?.imported) return 'none';
  return errors.length > 0 ? 'partial' : 'success';
};

export const notifyImportResult = (result) => {
  const errors = result?.errors ?? [];
  const imported = result?.imported ?? 0;
  const outcome = importOutcome(result);

  if (outcome === 'success') {
    showSuccess(`${imported} producto(s) importados exitosamente`);
  } else if (outcome === 'partial') {
    showWarning(`${imported} producto(s) importados`, `${errors.length} fila(s) con errores`);
  } else if (outcome === 'none') {
    showWarning('No se importó ningún producto', `${errors.length} fila(s) con errores`);
  } else {
    const detail = importErrorText(errors[errors.length - 1]) || 'Revisá el archivo e intentá de nuevo';
    showError(imported > 0 ? `Importación incompleta (${imported} importados)` : 'La importación falló', detail);
  }
};
