import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useVehicles } from '@services/vehiclesService';
import CustomerSearchInput from '@components/features/customers/CustomerSearchInput';

const ServiceRecordForm = ({
  record = null,
  onSubmit,
  isLoading = false,
  formId = 'service-record-form',
}) => {
  const today = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      customer_id: record?.vehicle?.customer_id || '',
      vehicle_id: record?.vehicle_id || '',
      service_date: record?.service_date || today,
      mileage: record?.mileage || '',
      total_amount: record?.total_amount || '',
      notes: record?.notes || '',
      next_service_date: record?.next_service_date || '',
    },
  });

  const selectedCustomerId = watch('customer_id');

  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles(
    selectedCustomerId ? { customer_id: selectedCustomerId } : {}
  );

  let vehicles = [];
  if (selectedCustomerId && vehiclesData) {
    if (vehiclesData.data?.vehicles && Array.isArray(vehiclesData.data.vehicles)) {
      vehicles = vehiclesData.data.vehicles;
    } else if (Array.isArray(vehiclesData.data)) {
      vehicles = vehiclesData.data;
    } else if (Array.isArray(vehiclesData.vehicles)) {
      vehicles = vehiclesData.vehicles;
    } else if (Array.isArray(vehiclesData)) {
      vehicles = vehiclesData;
    }
  }

  // When editing, populate customer_id from the record's vehicle
  useEffect(() => {
    if (record?.vehicle?.customer_id) {
      setValue('customer_id', record.vehicle.customer_id);
    }
  }, [record, setValue]);

  const handleCustomerChange = (customerId) => {
    setValue('customer_id', customerId);
    setValue('vehicle_id', '');
  };

  const handleFormSubmit = (data) => {
    const { customer_id, ...payload } = data;
    const cleanPayload = {
      ...payload,
      mileage: data.mileage ? parseInt(data.mileage, 10) : null,
      total_amount: data.total_amount ? parseFloat(data.total_amount) : null,
      next_service_date: data.next_service_date || null,
    };
    onSubmit(cleanPayload);
  };

  const inputClass = (hasError) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
      hasError ? 'border-red-500' : 'border-gray-300'
    }`;

  return (
    <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Cliente */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Cliente *
        </label>
        <CustomerSearchInput
          value={selectedCustomerId}
          onChange={handleCustomerChange}
          placeholder="Buscar cliente por nombre o email..."
          initialCustomer={record?.vehicle?.customer}
        />
      </div>

      {/* Vehículo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Vehículo *
          {vehiclesLoading && selectedCustomerId && (
            <span className="ml-2 text-xs text-gray-500">(Cargando...)</span>
          )}
        </label>
        <select
          {...register('vehicle_id', { required: 'Vehículo es requerido' })}
          disabled={vehiclesLoading || !selectedCustomerId}
          className={inputClass(errors.vehicle_id)}
        >
          <option value="">
            {!selectedCustomerId
              ? 'Primero selecciona un cliente'
              : vehiclesLoading
                ? 'Cargando vehículos...'
                : vehicles.length === 0
                  ? 'No hay vehículos para este cliente'
                  : 'Seleccionar vehículo'}
          </option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.brand} {v.model} - {v.license_plate}
            </option>
          ))}
        </select>
        {errors.vehicle_id && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.vehicle_id.message}</p>
        )}
      </div>

      {/* Fecha de atención y Kilometraje */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha de atención *
          </label>
          <input
            type="date"
            {...register('service_date', { required: 'Fecha es requerida' })}
            className={inputClass(errors.service_date)}
          />
          {errors.service_date && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.service_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Kilometraje
          </label>
          <input
            type="number"
            min="0"
            {...register('mileage', {
              min: { value: 0, message: 'El kilometraje no puede ser negativo' },
            })}
            className={inputClass(errors.mileage)}
            placeholder="Ej: 85000"
          />
          {errors.mileage && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.mileage.message}</p>
          )}
        </div>
      </div>

      {/* Total y Próximo servicio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Total (ARS)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('total_amount', {
                min: { value: 0, message: 'El total no puede ser negativo' },
              })}
              className={`${inputClass(errors.total_amount)} pl-7`}
              placeholder="0.00"
            />
          </div>
          {errors.total_amount && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.total_amount.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Próximo servicio
          </label>
          <input
            type="date"
            {...register('next_service_date')}
            className={inputClass(errors.next_service_date)}
          />
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notas
        </label>
        <textarea
          rows={3}
          {...register('notes')}
          className={inputClass(false)}
          placeholder="Observaciones, trabajos realizados..."
        />
      </div>
    </form>
  );
};

export default ServiceRecordForm;
