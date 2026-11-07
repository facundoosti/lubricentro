import { useState } from 'react';
import { useWatch } from 'react-hook-form';
import { ChevronUp, Save } from 'lucide-react';
import { computeBudgetTotals } from '@utils/budgetMath';
import { formatCurrency } from '@utils/money';
import { formatIvaRate } from '@utils/iva';

const Row = ({ label, value, testId }) => (
  <div className="flex items-center justify-between gap-6 text-sm">
    <span className="text-on-surface-variant">{label}</span>
    <span className="font-medium text-on-surface tabular-nums" data-testid={testId}>{value}</span>
  </div>
);

// Barra fija al pie del formulario: totales en vivo (vista previa del cálculo del
// backend), desglose plegable y acciones Cancelar / Guardar.
const BudgetTotalsBar = ({ control, formId, isSaving, submitLabel, onCancel }) => {
  const [open, setOpen] = useState(false);
  const items = useWatch({ control, name: 'items_attributes' }) || [];
  const surcharge = Number(useWatch({ control, name: 'card_surcharge_percentage' })) || 0;
  const totals = computeBudgetTotals(items, surcharge);

  return (
    <div className="sticky bottom-0 z-20 -mx-6 sm:mx-0">
      <div className="border-t sm:border border-outline-variant bg-surface-container shadow-lg sm:rounded-t-lg">
        {open && (
          <div id="budget-breakdown" className="px-4 sm:px-5 pt-4 pb-2 space-y-1.5 border-b border-outline-variant">
            <Row label="Subtotal neto" value={formatCurrency(totals.subtotalNet)} testId="subtotal-net" />
            {totals.ivaBreakdown.map((row) => (
              <Row
                key={row.rate}
                label={`IVA ${formatIvaRate(row.rate)} s/ ${formatCurrency(row.base)}`}
                value={formatCurrency(row.amount)}
                testId={`iva-${row.rate}`}
              />
            ))}
            <Row label="Subtotal con IVA" value={formatCurrency(totals.subtotalGross)} testId="subtotal-gross" />
            {totals.exemptTotal > 0 && (
              <Row label="Sin IVA (servicios)" value={formatCurrency(totals.exemptTotal)} testId="exempt-total" />
            )}
            {surcharge > 0 && (
              <Row label={`Recargo tarjeta (${surcharge}%)`} value={formatCurrency(totals.surchargeAmount)} />
            )}
          </div>
        )}

        <div className="flex flex-col gap-3 px-4 sm:px-5 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="budget-breakdown"
              className="flex items-center gap-1 text-xs text-primary hover:underline shrink-0"
            >
              <ChevronUp className={`w-4 h-4 transition-transform ${open ? '' : 'rotate-180'}`} />
              Desglose
            </button>
            <div>
              <p className="text-xs text-secondary">Efectivo / Débito</p>
              <p className="text-lg font-bold text-on-surface tabular-nums" data-testid="total-list">
                {formatCurrency(totals.totalList)}
              </p>
            </div>
            <div>
              <p className="text-xs text-secondary">
                Tarjeta de crédito{surcharge > 0 ? ` (+${surcharge}%)` : ''}
              </p>
              <p className="text-lg font-bold text-primary tabular-nums" data-testid="total-card">
                {formatCurrency(totals.totalCard)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 md:flex-none px-4 py-2 rounded border border-outline-variant bg-surface-container-high text-on-surface text-sm hover:bg-surface-variant transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form={formId}
              disabled={isSaving}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 whitespace-nowrap px-4 sm:px-5 py-2 rounded bg-primary-container text-on-primary font-bold text-sm hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Save className="w-4 h-4 hidden sm:block" />
              {isSaving ? 'Guardando...' : submitLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetTotalsBar;
