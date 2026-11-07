import { useWatch } from 'react-hook-form';
import CustomerSearchInput from '@components/features/customers/CustomerSearchInput';
import { useVehicles } from '@services/vehiclesService';
import { BUDGET_STATUSES, formatVehicle } from '@utils/budget';

const fieldClass =
  'w-full px-3 py-2 bg-surface-variant border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary placeholder:text-secondary';
const labelClass = 'block text-sm font-medium text-on-surface mb-1';

// Fecha, estado, cliente, vehículo, recargo y notas.
const BudgetGeneralSection = ({ control, register, setValue, errors, initialCustomer }) => {
  const customerId = useWatch({ control, name: 'customer_id' });
  const vehicleId = useWatch({ control, name: 'vehicle_id' });
  const vehicleDescription = useWatch({ control, name: 'vehicle_description' });

  const { data: vehiclesData, isLoading: loadingVehicles } = useVehicles({
    customer_id: customerId,
    per_page: 50,
    enabled: !!customerId,
  });
  const vehicles = customerId ? vehiclesData?.data?.vehicles || [] : [];

  const handleCustomerChange = (id) => {
    const next = id || '';
    if (String(next) !== String(customerId || '')) {
      setValue('vehicle_id', null, { shouldDirty: true });
      setValue('vehicle_description', '', { shouldDirty: true });
    }
    setValue('customer_id', next, { shouldDirty: true });
  };

  const handleVehicleChange = (e) => {
    const vehicle = vehicles.find((v) => String(v.id) === e.target.value);
    setValue('vehicle_id', vehicle ? vehicle.id : null, { shouldDirty: true });
    setValue('vehicle_description', vehicle ? formatVehicle(vehicle) : '', { shouldDirty: true });
  };

  const useSelect = !!customerId && vehicles.length > 0;

  return (
    <section className="bg-surface-container border border-outline-variant rounded-lg p-4 sm:p-5 space-y-4">
      <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">Datos generales</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="budget-date" className={labelClass}>
            Fecha <span className="text-error">*</span>
          </label>
          <input
            id="budget-date"
            type="date"
            {...register('date', { required: 'La fecha es obligatoria' })}
            className={fieldClass}
          />
          {errors?.date && <p className="text-error text-xs mt-1">{errors.date.message}</p>}
        </div>

        <div>
          <label htmlFor="budget-status" className={labelClass}>Estado</label>
          <select id="budget-status" {...register('status')} className={fieldClass}>
            {BUDGET_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div>
          <span className={labelClass}>Cliente</span>
          <CustomerSearchInput
            value={customerId || ''}
            onChange={handleCustomerChange}
            // Solo si sigue siendo el cliente elegido: si no, el buscador volvería a mostrarlo.
            initialCustomer={
              initialCustomer && String(initialCustomer.id) === String(customerId) ? initialCustomer : null
            }
          />
        </div>

        <div>
          <label htmlFor="budget-vehicle" className={labelClass}>Vehículo</label>
          {useSelect ? (
            <>
              <select
                id="budget-vehicle"
                value={vehicleId ? String(vehicleId) : ''}
                onChange={handleVehicleChange}
                className={fieldClass}
              >
                <option value="">Seleccionar vehículo...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{formatVehicle(v)}</option>
                ))}
              </select>
              {!vehicleId && vehicleDescription && (
                <p className="text-xs text-secondary mt-1">Guardado como: {vehicleDescription}</p>
              )}
            </>
          ) : (
            <input
              id="budget-vehicle"
              type="text"
              disabled={!!customerId && loadingVehicles}
              placeholder={customerId ? 'Sin vehículos registrados: escribilo' : 'Ej: Ford Falcon 1986'}
              {...register('vehicle_description', { maxLength: 200 })}
              className={fieldClass}
            />
          )}
        </div>

        <div>
          <label htmlFor="budget-surcharge" className={labelClass}>Recargo tarjeta de crédito (%)</label>
          <input
            id="budget-surcharge"
            type="number"
            min="0"
            max="100"
            step="0.1"
            inputMode="decimal"
            {...register('card_surcharge_percentage', { min: 0, max: 100 })}
            className={`${fieldClass} sm:max-w-32`}
          />
          {errors?.card_surcharge_percentage && (
            <p className="text-error text-xs mt-1">El recargo debe estar entre 0 y 100</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="budget-notes" className={labelClass}>Notas</label>
        <textarea
          id="budget-notes"
          {...register('notes')}
          rows={2}
          placeholder="Observaciones..."
          className={`${fieldClass} resize-none`}
        />
      </div>
    </section>
  );
};

export default BudgetGeneralSection;
