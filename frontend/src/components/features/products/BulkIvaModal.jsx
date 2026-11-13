import { useEffect, useState } from 'react';
import { Percent } from 'lucide-react';
import Dialog from '@ui/Dialog';
import { useBulkIvaUpdate } from '@services/productsService';
import { showSuccess, showError, parseApiError } from '@services/notificationService';
import { PRODUCT_IVA_OPTIONS } from '@utils/iva';

// target = { type: 'ids', ids } | { type: 'filters', search, brand, supplierId, categoryId, active }
const buildParams = (target, ivaRate) => {
  const base = { iva_rate: Number(ivaRate) };
  if (target?.type === 'ids') return { ...base, product_ids: target.ids };
  const filters = {
    search: target?.search || undefined,
    brand: target?.brand || undefined,
    supplier_id: target?.supplierId || undefined,
    category_id: target?.categoryId || undefined,
    active: target?.active || undefined,
  };
  // Sin filtros = todo el catálogo: el backend lo exige explícito.
  const hasFilter = Object.values(filters).some(Boolean);
  return { ...base, ...filters, ...(hasFilter ? {} : { all: true }) };
};

const plural = (n) => `${n} producto${n !== 1 ? 's' : ''}`;

const BulkIvaModal = ({ isOpen, onClose, target, count, onDone }) => {
  const [ivaRate, setIvaRate] = useState('10.5');
  const mutation = useBulkIvaUpdate();

  useEffect(() => {
    if (isOpen) setIvaRate('10.5');
  }, [isOpen]);

  const handleApply = async () => {
    try {
      const res = await mutation.mutateAsync(buildParams(target, ivaRate));
      showSuccess(res?.message || `Alícuota actualizada en ${plural(res?.data?.updated ?? count)}`);
      onDone?.();
      onClose();
    } catch (err) {
      showError('Error al cambiar el IVA', parseApiError(err));
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="sm" title="Cambiar IVA" closeOnBackdrop={false}>
      <div className="space-y-5">
        <p className="text-sm text-on-surface-variant">
          Se cambia solo la alícuota de <strong className="text-on-surface">{plural(count)}</strong>.
          Los precios guardados (sin IVA) no se modifican.
        </p>

        <div role="radiogroup" aria-label="Alícuota de IVA" className="grid grid-cols-2 gap-3">
          {PRODUCT_IVA_OPTIONS.map((opt) => {
            const selected = ivaRate === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setIvaRate(opt.value)}
                className={`flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-base font-semibold transition-colors ${
                  selected
                    ? 'border-primary bg-primary-container/20 text-primary'
                    : 'border-outline-variant bg-surface-container-high text-on-surface hover:bg-surface-variant'
                }`}
              >
                <Percent className="w-4 h-4" />
                {opt.label}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded border border-outline-variant bg-surface-container-high text-on-surface text-sm hover:bg-surface-variant transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={mutation.isPending || count === 0}
            className="px-4 py-2 rounded bg-primary-container text-on-primary text-sm font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {mutation.isPending ? 'Aplicando...' : `Aplicar a ${plural(count)}`}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default BulkIvaModal;
