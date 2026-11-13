import Button from '@ui/Button';
import InputField from '@ui/InputField';
import { usePlanForm } from '@components/features/settings/useInstallmentPlanForm';

const inputCls = 'h-9 px-2';

const InstallmentPlanForm = ({ initial, onSave, onCancel, isSaving, submitLabel }) => {
  const { values, error, set, submit } = usePlanForm(initial, onSave);

  return (
    <form onSubmit={submit} className="space-y-2" aria-label={submitLabel} noValidate>
      <div className="grid grid-cols-[1fr_90px_100px_80px] gap-2">
        <InputField aria-label="Nombre del plan" placeholder="Ej: VISA" value={values.name} onChange={set('name')} className={inputCls} />
        <InputField aria-label="Cuotas" type="number" min="2" step="1" placeholder="Cuotas" value={values.installments} onChange={set('installments')} className={inputCls} />
        <InputField aria-label="Recargo %" type="number" min="0" step="0.01" placeholder="Recargo %" value={values.surcharge_percentage} onChange={set('surcharge_percentage')} className={inputCls} />
        <InputField aria-label="Orden" type="number" min="0" step="1" placeholder="Orden" value={values.position} onChange={set('position')} className={inputCls} />
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
