import { useUpdateBudgetStatus } from '@services/budgetsService';
import { showBudgetSuccess, showBudgetError, parseApiError } from '@services/notificationService';
import { BUDGET_STATUSES } from '@utils/budget';

const STATUS_STYLES = {
  draft: 'bg-surface-container-high text-secondary border-outline-variant',
  sent: 'bg-primary-container/20 text-primary border-transparent',
  approved: 'bg-tertiary/10 text-tertiary border-transparent',
  rejected: 'bg-error-container text-on-error-container border-transparent',
};

// Badge de estado que es a la vez un menú: cambia el estado sin abrir el formulario.
const BudgetStatusSelect = ({ budget }) => {
  const mutation = useUpdateBudgetStatus();

  const handleChange = async (e) => {
    const status = e.target.value;
    if (status === budget.status) return;
    try {
      await mutation.mutateAsync({ id: budget.id, status });
      showBudgetSuccess('STATUS_UPDATED');
    } catch (err) {
      showBudgetError('ERROR_STATUS', parseApiError(err));
    }
  };

  return (
    <select
      value={budget.status}
      onChange={handleChange}
      disabled={mutation.isPending}
      aria-label={`Estado del presupuesto #${budget.id}`}
      className={`appearance-none cursor-pointer rounded border px-2 py-0.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 ${
        STATUS_STYLES[budget.status] || 'text-secondary border-outline-variant'
      }`}
    >
      {BUDGET_STATUSES.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
};

export default BudgetStatusSelect;
