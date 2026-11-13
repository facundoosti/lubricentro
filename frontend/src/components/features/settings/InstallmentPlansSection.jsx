import { useState } from 'react';
import { CreditCard, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  useInstallmentPlans,
  useCreateInstallmentPlan,
  useUpdateInstallmentPlan,
  useDeleteInstallmentPlan,
} from '@services/installmentPlansService';
import { showSuccess, showError } from '@services/notificationService';
import ConfirmDialog from '@ui/ConfirmDialog';
import Switch from '@ui/Switch';
import Button from '@ui/Button';
import PageError from '@ui/PageError';
import InstallmentPlanForm from '@components/features/settings/InstallmentPlanForm';
import { EMPTY_PLAN, nextPosition, toPlanPayload } from '@components/features/settings/useInstallmentPlanForm';

const formatPercent = (value) => `${Number(value).toLocaleString('es-AR', { maximumFractionDigits: 2 })}%`;

// ABM de planes de cuotas (Configuración). La hoja de presupuesto muestra hasta 3 planes activos, por orden.
const InstallmentPlansSection = () => {
  const { data, isLoading, isError, error, refetch } = useInstallmentPlans();
  const createMutation = useCreateInstallmentPlan();
  const updateMutation = useUpdateInstallmentPlan();
  const deleteMutation = useDeleteInstallmentPlan();
  const [editingId, setEditingId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const plans = data?.data?.installment_plans || [];
  const errorDetail = (err) => err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message;

  const create = async (values) => {
    try {
      await createMutation.mutateAsync(toPlanPayload(values, nextPosition(plans)));
      showSuccess('Plan de cuotas creado');
      setAdding(false);
    } catch (err) {
      showError('Error al crear el plan de cuotas', errorDetail(err));
    }
  };

  const update = async (id, data, message = 'Plan de cuotas actualizado') => {
    try {
      await updateMutation.mutateAsync({ id, data });
      showSuccess(message);
      setEditingId(null);
    } catch (err) {
      showError('Error al actualizar el plan de cuotas', errorDetail(err));
    }
  };

  const remove = async () => {
    try {
      await deleteMutation.mutateAsync(toDelete.id);
      showSuccess('Plan de cuotas eliminado');
    } catch (err) {
      showError('Error al eliminar el plan de cuotas', errorDetail(err));
    } finally {
      setToDelete(null);
    }
  };

  return (
    <section className="bg-surface-container border border-outline-variant rounded-lg p-5" aria-labelledby="installment-plans-title">
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <h2 id="installment-plans-title" className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
            Planes de cuotas
          </h2>
        </div>
        {!adding && !isError && (
          <Button variant="secondary" size="sm" onClick={() => setAdding(true)} startIcon={<Plus className="w-4 h-4" />}>
            Agregar plan
          </Button>
        )}
      </div>
      <p className="text-xs text-secondary mb-3">
        El recargo se aplica sobre el precio de lista. La hoja de presupuesto muestra hasta 3 planes activos, en orden.
      </p>

      {isLoading ? (
        <div className="h-10 bg-surface-container-high rounded-lg animate-pulse" />
      ) : isError ? (
        <PageError title="No se pudieron cargar los planes de cuotas" message={error?.message} onRetry={() => refetch()} />
      ) : (
        <ul className="space-y-2">
          {plans.length === 0 && !adding && <li className="text-sm text-secondary">No hay planes de cuotas cargados.</li>}
          {plans.map((plan) =>
            editingId === plan.id ? (
              <li key={plan.id} className="rounded-lg border border-primary/40 p-3">
                <InstallmentPlanForm
                  initial={{
                    name: plan.name,
                    installments: String(plan.installments),
                    surcharge_percentage: String(Number(plan.surcharge_percentage)),
                    position: String(plan.position),
                  }}
                  onSave={(values) => update(plan.id, toPlanPayload(values, plan.position))}
                  onCancel={() => setEditingId(null)}
                  isSaving={updateMutation.isPending}
                  submitLabel="Guardar plan"
                />
              </li>
            ) : (
              <li key={plan.id} className="flex items-center gap-3 rounded-lg border border-outline-variant bg-surface-container-high px-3 py-2">
                <Switch
                  aria-label={`Activar ${plan.name}`}
                  checked={!!plan.active}
                  onCheckedChange={(active) => update(plan.id, { active }, active ? 'Plan activado' : 'Plan desactivado')}
                />
                <span className={`flex-1 text-sm ${plan.active ? 'text-on-surface' : 'text-secondary'}`}>
                  <strong>{plan.name}</strong> · {plan.installments} cuotas · recargo {formatPercent(plan.surcharge_percentage)}
                </span>
                <span className="text-xs text-secondary">Orden {plan.position}</span>
                <Button variant="ghost" size="sm" aria-label={`Editar ${plan.name}`} onClick={() => setEditingId(plan.id)} className="!px-1.5 text-secondary">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" aria-label={`Eliminar ${plan.name}`} onClick={() => setToDelete(plan)} className="!px-1.5 text-secondary hover:text-error">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ),
          )}
          {adding && (
            <li className="rounded-lg border border-primary/40 p-3">
              <InstallmentPlanForm initial={EMPTY_PLAN} onSave={create} onCancel={() => setAdding(false)} isSaving={createMutation.isPending} submitLabel="Crear plan" />
            </li>
          )}
        </ul>
      )}

      <ConfirmDialog
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={remove}
        title="Eliminar plan de cuotas"
        message={toDelete ? `¿Eliminar el plan "${toDelete.name}"? Deja de aparecer en los presupuestos.` : ''}
        confirmText="Eliminar"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </section>
  );
};

export default InstallmentPlansSection;
