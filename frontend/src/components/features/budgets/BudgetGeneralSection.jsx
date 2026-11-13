import { useEffect, useMemo } from 'react';
import { Controller, useWatch } from 'react-hook-form';
import Select from '@ui/Select';
import DateInput from '@ui/DateInput';
import { validInput } from '@/lib/maskedInput';
import CustomerSearchInput from '@components/features/customers/CustomerSearchInput';
import { useVehicles } from '@services/vehiclesService';
import { BUDGET_STATUSES, formatVehicle } from '@utils/budget';

const fieldClass =
  'w-full px-3 py-2 bg-surface-variant border border-outline-variant rounded-lg text-on-surface text-sm focus:outline-none focus:border-primary placeholder:text-secondary';
const labelClass = 'block text-sm font-medium text-on-surface mb-1';

// "Sin vehículo" quita el vehículo; en la lista usa un valor propio (el Select trata '' como "sin elegir").
const NO_VEHICLE = 'none';

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
  const vehicles = useMemo(
    () => (customerId ? vehiclesData?.data?.vehicles || [] : []),
    [customerId, vehiclesData],
  );

  const handleCustomerChange = (id) => {
    const next = id || '';
    if (String(next) !== String(customerId || '')) {
      setValue('vehicle_id', null, { shouldDirty: true });
      setValue('vehicle_description', '', { shouldDirty: true });
    }
    setValue('customer_id', next, { shouldDirty: true });
  };

  const handleVehicleChange = (value) => {
    const vehicle = value === NO_VEHICLE ? null : vehicles.find((v) => String(v.id) === value);
    setValue('vehicle_id', vehicle ? vehicle.id : null, { shouldDirty: true });
    setValue('vehicle_description', vehicle ? formatVehicle(vehicle) : '', { shouldDirty: true });
  };

  // Vehículo preelegido por URL: completa la descripción cuando llegan los vehículos del cliente
  useEffect(() => {
    if (!vehicleId || vehicleDescription) return;
    const vehicle = vehicles.find((v) => String(v.id) === String(vehicleId));
    if (vehicle) setValue('vehicle_description', formatVehicle(vehicle));
  }, [vehicleId, vehicleDescription, vehicles, setValue]);

  const useSelect = !!customerId && vehicles.length > 0;

  return (
    <section className="bg-surface-container border border-outline-variant rounded-lg p-4 sm:p-5 space-y-4">
      <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">Datos generales</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="budget-date" className={labelClass}>
            Fecha <span className="text-error">*</span>
          </label>
          <Controller
            name="date"
            control={control}
            rules={{ required: 'La fecha es obligatoria', validate: validInput() }}
            render={({ field }) => (
              <DateInput
                ref={field.ref}
                id="budget-date"
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={!!errors?.date}
                className={fieldClass}
              />
            )}
          />
          {errors?.date && <p className="text-error text-xs mt-1">{errors.date.message}</p>}
        </div>

        <div>
          <label id="budget-status-label" className={labelClass}>Estado</label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                id="budget-status"
                aria-labelledby="budget-status-label"
                options={BUDGET_STATUSES}
                value={field.value}
                onChange={field.onChange}
                className={fieldClass}
              />
            )}
          />
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
          <label id="budget-vehicle-label" htmlFor="budget-vehicle" className={labelClass}>Vehículo</label>
          {useSelect ? (
            <>
              <Select
                id="budget-vehicle"
                aria-labelledby="budget-vehicle-label"
                options={[
                  { value: NO_VEHICLE, label: 'Sin vehículo' },
                  ...vehicles.map((v) => ({ value: String(v.id), label: formatVehicle(v) })),
                ]}
                value={vehicleId ? String(vehicleId) : ''}
                // Vehículo guardado que ya no está entre los del cliente: se muestra su descripción, no el id.
                orphanLabel={vehicleDescription || undefined}
                onChange={handleVehicleChange}
                placeholder="Seleccionar vehículo..."
                className={fieldClass}
              />
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
