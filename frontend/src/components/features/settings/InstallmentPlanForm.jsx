import { useId } from 'react';
import Button from '@ui/Button';
import { Field, inputCls } from '@components/features/settings/SettingsField';
import { usePlanForm } from '@components/features/settings/useInstallmentPlanForm';

// Label visible por campo: con valores cargados (edición, recargo 0) el placeholder no se ve.
const InstallmentPlanForm = ({ initial, onSave, onCancel, isSaving, submitLabel }) => {
  const { values, error, set, submit } = usePlanForm(initial, onSave);
  const id = useId();

  return (
    <form onSubmit={submit} className="space-y-2" aria-label={submitLabel} noValidate>
      <div className="grid grid-cols-[1fr_96px_112px_96px] gap-2">
        <Field label="Nombre del plan" htmlFor={`${id}-name`}>
          <input id={`${id}-name`} placeholder="Ej: VISA" value={values.name} onChange={set('name')} className={inputCls} />
        </Field>
        <Field label="Cuotas" htmlFor={`${id}-installments`}>
          <input id={`${id}-installments`} type="number" min="2" step="1" placeholder="Ej: 3" value={values.installments} onChange={set('installments')} className={inputCls} />
        </Field>
        <Field label="Recargo %" htmlFor={`${id}-surcharge_percentage`}>
          <input id={`${id}-surcharge_percentage`} type="number" min="0" step="0.01" placeholder="Ej: 10" value={values.surcharge_percentage} onChange={set('surcharge_percentage')} className={inputCls} />
        </Field>
        <Field label="Orden" htmlFor={`${id}-position`}>
          <input id={`${id}-position`} type="number" min="0" step="1" placeholder="Auto" value={values.position} onChange={set('position')} className={inputCls} />
        </Field>
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
