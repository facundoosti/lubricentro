import { BUDGET_STATUSES } from '@utils/budget';

const OPTIONS = [{ value: '', label: 'Todos' }, ...BUDGET_STATUSES];

// Chips de filtro por estado ('' = todos).
const BudgetStatusFilter = ({ value, onChange }) => (
  <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
    {OPTIONS.map((opt) => {
      const active = value === opt.value;
      return (
        <button
          key={opt.value || 'all'}
          type="button"
          aria-pressed={active}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 rounded-full border text-xs font-medium transition-colors ${
            active
              ? 'bg-primary-container/20 text-primary border-primary/40'
              : 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-high'
          }`}
        >
          {opt.label}
        </button>
      );
    })}
  </div>
);

export default BudgetStatusFilter;
