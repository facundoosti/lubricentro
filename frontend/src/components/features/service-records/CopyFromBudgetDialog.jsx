import { useEffect, useId, useState } from 'react';
import { AlertTriangle, FileText, Search } from 'lucide-react';
import FormDialog from '@ui/FormDialog';
import { useBudget, useBudgets } from '@services/budgetsService';
import { formatCurrency } from '@utils/money';

const DEBOUNCE_MS = 300;
const PER_PAGE = 20;

const formatDate = (iso) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('es-AR') : '—');

const BudgetOption = ({ budget, name, checked, onChange }) => (
  <label
    className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer border-l-2 transition-colors ${
      checked ? 'bg-primary-container/15 border-primary' : 'border-transparent hover:bg-surface-container-high'
    }`}
  >
    <input
      type="radio"
      name={name}
      value={budget.id}
      checked={checked}
      onChange={() => onChange(budget.id)}
      className="accent-primary"
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-on-surface">Presupuesto #{budget.id}</span>
        <span className="text-xs text-secondary">{formatDate(budget.date)}</span>
        {budget.status_label && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
            {budget.status_label}
          </span>
        )}
      </div>
      <p className="text-xs text-secondary truncate">
        {[budget.customer?.name, budget.vehicle_description].filter(Boolean).join(' · ') || 'Sin cliente'}
        {' · '}
        {budget.items?.length ?? 0} ítems
      </p>
    </div>
    <span className="text-sm font-medium text-on-surface tabular-nums shrink-0">{formatCurrency(budget.total_list)}</span>
  </label>
);

const BudgetList = ({ isLoading, isError, budgets, name, selectedId, onSelect }) => {
  if (isLoading) return <p role="status" className="px-3 py-4 text-sm text-secondary">Buscando presupuestos...</p>;
  if (isError) return <p role="alert" className="px-3 py-4 text-sm text-error">No se pudieron cargar los presupuestos. Probá de nuevo.</p>;
  if (budgets.length === 0) return <p className="px-3 py-4 text-sm text-secondary">No hay presupuestos para copiar.</p>;
  return budgets.map((b) => (
    <BudgetOption key={b.id} budget={b} name={name} checked={selectedId === b.id} onChange={onSelect} />
  ));
};

/**
 * CopyFromBudgetDialog — elige un presupuesto para precargar la atención.
 * Lista filtrada por cliente (si hay uno elegido), sin rechazados. Al confirmar trae
 * el presupuesto completo y llama a `onCopy(budget)`. Si la atención ya tiene líneas
 * con datos, pide confirmar antes de reemplazarlas.
 * Montarlo solo mientras está abierto (`{open && <CopyFromBudgetDialog isOpen ... />}`): así
 * cada apertura arranca sin búsqueda ni selección.
 */
const CopyFromBudgetDialog = ({ isOpen, onClose, customerId, hasFilledItems, onCopy }) => {
  const formId = useId();
  const listName = useId();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = useBudgets({
    customer_id: customerId || undefined,
    search: debouncedSearch,
    per_page: PER_PAGE,
  });
  const budgets = (data?.data?.budgets || []).filter((b) => b.status !== 'rejected');

  const { data: detailData, isLoading: loadingDetail, isError: detailError } = useBudget(selectedId);
  const budget = detailData?.data;

  const handleSelect = (id) => {
    setSelectedId(id);
    setConfirming(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!budget) return;
    if (hasFilledItems && !confirming) {
      setConfirming(true);
      return;
    }
    onCopy(budget);
    onClose();
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Copiar desde presupuesto"
      subtitle={customerId ? 'Presupuestos del cliente elegido' : 'Elegí un presupuesto para precargar la atención'}
      icon={FileText}
      formId={formId}
      size="md"
      submitLabel={confirming ? 'Reemplazar ítems' : 'Copiar'}
      submitDisabled={!budget}
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar presupuesto"
            placeholder="Buscar por cliente, vehículo o notas..."
            className="w-full pl-9 pr-3 py-2 bg-surface-variant border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary placeholder:text-secondary"
          />
        </div>

        <div
          role="radiogroup"
          aria-label="Presupuestos"
          className="border border-outline-variant rounded-lg divide-y divide-outline-variant max-h-80 overflow-y-auto"
        >
          <BudgetList
            isLoading={isLoading}
            isError={isError}
            budgets={budgets}
            name={listName}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </div>

        {selectedId && loadingDetail && <p className="text-xs text-secondary">Cargando presupuesto...</p>}
        {selectedId && detailError && (
          <p role="alert" className="text-xs text-error">No se pudo cargar el presupuesto elegido.</p>
        )}

        {confirming && (
          <div role="alert" className="flex items-start gap-2 p-3 rounded-lg bg-error-container text-on-error-container text-sm">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>La atención ya tiene líneas cargadas. Si continuás, se reemplazan por las del presupuesto.</span>
          </div>
        )}
      </form>
    </FormDialog>
  );
};

export default CopyFromBudgetDialog;
