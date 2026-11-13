import Select from '@ui/Select';
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

  const handleChange = async (status) => {
    if (status === budget.status) return;
    try {
      await mutation.mutateAsync({ id: budget.id, status });
      showBudgetSuccess('STATUS_UPDATED');
    } catch (err) {
      showBudgetError('ERROR_STATUS', parseApiError(err));
    }
  };

  return (
    <Select
      options={BUDGET_STATUSES}
      value={budget.status}
      onChange={handleChange}
      disabled={mutation.isPending}
      aria-label={`Estado del presupuesto #${budget.id}`}
      showIcon={false}
      valueClassName="text-inherit"
      contentClassName="w-auto min-w-(--anchor-width)"
      className={`w-auto cursor-pointer gap-0 rounded border px-2 py-0.5 text-xs font-medium hover:border-current focus:border-current focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-60 ${
        STATUS_STYLES[budget.status] || 'text-secondary border-outline-variant'
      }`}
    />
  );
};

export default BudgetStatusSelect;
