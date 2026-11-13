import { useId } from 'react';
import Button from '@ui/Button';
import InputField from '@ui/InputField';
import { usePlanForm } from '@components/features/settings/useInstallmentPlanForm';

// Label visible por campo: con valores cargados (edición, recargo 0) el placeholder no se ve.
const InstallmentPlanForm = ({ initial, onSave, onCancel, isSaving, submitLabel }) => {
  const { values, error, set, submit } = usePlanForm(initial, onSave);
  const id = useId();

  return (
    <form onSubmit={submit} className="space-y-2" aria-label={submitLabel} noValidate>
      <div className="grid grid-cols-[1fr_96px_112px_96px] gap-2">
        <InputField id={`${id}-name`} label="Nombre del plan" placeholder="Ej: VISA" value={values.name} onChange={set('name')} />
        <InputField id={`${id}-installments`} label="Cuotas" type="number" min="2" step="1" placeholder="Ej: 3" value={values.installments} onChange={set('installments')} />
        <InputField id={`${id}-surcharge`} label="Recargo %" type="number" min="0" step="0.01" placeholder="Ej: 10" value={values.surcharge_percentage} onChange={set('surcharge_percentage')} />
        <InputField id={`${id}-position`} label="Orden" type="number" min="0" step="1" placeholder="Auto" value={values.position} onChange={set('position')} />
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" size="sm" loading={isSaving}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default InstallmentPlanForm;
