import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { importOutcome, importErrorText } from '@components/features/products/importResult';

const SUMMARY = {
  failed: { Icon: XCircle, box: 'bg-error-container/10 border-error/20', icon: 'text-error' },
  none: { Icon: AlertCircle, box: 'bg-error-container/10 border-error/20', icon: 'text-error' },
  ok: { Icon: CheckCircle, box: 'bg-tertiary-container/10 border-tertiary/20', icon: 'text-tertiary' },
};

const summaryText = (outcome, imported) => {
  if (outcome === 'failed') {
    return imported > 0
      ? `La importación no pudo completarse (${imported} producto(s) alcanzaron a importarse)`
      : 'La importación no pudo completarse';
  }
  if (outcome === 'none') return 'No se importó ningún producto: todas las filas tienen errores';
  return null;
};

const ProductImportResult = ({ result }) => {
  const errors = result?.errors ?? [];
  const imported = result?.imported ?? 0;
  const outcome = importOutcome(result);
  const { Icon, box, icon } = SUMMARY[outcome] ?? SUMMARY.ok;
  const text = summaryText(outcome, imported);

  return (
    <div className="space-y-3">
      <div role="status" className={`flex items-center gap-2 p-3 border rounded-lg ${box}`}>
        <Icon className={`w-4 h-4 shrink-0 ${icon}`} aria-hidden="true" />
        <p className="text-sm text-on-surface">
          {text ?? (
            <>
              <span className="font-semibold text-tertiary">{imported}</span> producto(s) importados correctamente
            </>
          )}
        </p>
      </div>

      {errors.length > 0 && (
        <div className="p-3 bg-error-container/10 border border-error/20 rounded-lg space-y-1.5">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-error shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium text-on-error-container">
              {errors.length} {errors.length === 1 ? 'error' : 'errores'}
            </p>
          </div>
          <ul className="text-xs text-on-surface-variant space-y-1 max-h-32 overflow-y-auto">
            {errors.map((e, i) => (
              <li key={i} className="flex gap-2">
                {e?.row && <span className="text-error font-mono shrink-0">Fila {e.row}:</span>}
                <span>{importErrorText(e)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductImportResult;
