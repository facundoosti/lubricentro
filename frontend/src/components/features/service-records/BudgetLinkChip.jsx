import { FileText, X } from 'lucide-react';

// Chip "Desde presupuesto #N" de una atención nueva copiada de un presupuesto.
// Quitar el vínculo deja los ítems copiados pero la atención se guarda sin budget_id.
const BudgetLinkChip = ({ budgetId, onUnlink }) => (
  <div className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full bg-primary-container/20 text-primary text-xs font-medium">
    <FileText className="w-3.5 h-3.5" />
    <span>Desde presupuesto #{budgetId}</span>
    <button
      type="button"
      onClick={onUnlink}
      aria-label={`Quitar vínculo con el presupuesto #${budgetId}`}
      title="Quitar vínculo"
      className="p-0.5 rounded-full hover:bg-primary-container/30 transition-colors"
    >
      <X className="w-3.5 h-3.5" />
    </button>
  </div>
);

export default BudgetLinkChip;
