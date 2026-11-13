import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { format } from 'date-fns';
import { useVehicles } from '@services/vehiclesService';
import CustomerSearchInput from '@components/features/customers/CustomerSearchInput';
import PhotosUpload from '@ui/PhotosUpload';
import Select from '@ui/Select';
import DateInput from '@ui/DateInput';
import { validInput } from '@/lib/maskedInput';

const ServiceRecordForm = ({
  record = null,
  onSubmit,
  formId = 'service-record-form',
}) => {
  // Fecha local (no UTC): a las 22 h en Argentina toISOString ya da el día siguiente.
  const today = format(new Date(), 'yyyy-MM-dd');
  const [photoFiles, setPhotoFiles] = useState([]);

  const { register, control, handleSubmit, formState: { errors }, watch, setValue } = useForm({
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
    if (photoFiles.length > 0) cleanPayload.photos = photoFiles;
    onSubmit(cleanPayload);
  };

  const inputClass = (hasError) =>
    `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
      hasError ? 'border-error' : 'border-outline-variant'
    }`;

  return (
    <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Cliente */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-2">
          Cliente *
        </label>
        <CustomerSearchInput
          value={selectedCustomerId}
          onChange={handleCustomerChange}
          placeholder="Buscar cliente por nombre o correo..."
          initialCustomer={record?.vehicle?.customer}
        />
      </div>

      {/* Vehículo */}
      <div>
        <label id="service-record-vehicle-label" className="block text-sm font-medium text-on-surface mb-2">
          Vehículo *
          {vehiclesLoading && selectedCustomerId && (
            <span className="ml-2 text-xs text-on-surface-variant">(Cargando...)</span>
          )}
        </label>
        <Controller
          name="vehicle_id"
          control={control}
          rules={{ required: 'Vehículo es requerido' }}
          render={({ field }) => (
            <Select
              options={vehicles.map((v) => ({ value: String(v.id), label: `${v.brand} ${v.model} - ${v.license_plate}` }))}
              value={field.value}
              onChange={field.onChange}
              placeholder={
                !selectedCustomerId
                  ? 'Primero selecciona un cliente'
                  : vehiclesLoading
                    ? 'Cargando vehículos...'
                    : vehicles.length === 0
                      ? 'No hay vehículos para este cliente'
                      : 'Seleccionar vehículo'
              }
              disabled={vehiclesLoading || !selectedCustomerId}
              aria-labelledby="service-record-vehicle-label"
              error={!!errors.vehicle_id}
              className={`${inputClass(errors.vehicle_id)} bg-transparent text-base`}
            />
          )}
        />
        {errors.vehicle_id && (
          <p className="mt-1 text-sm text-error">{errors.vehicle_id.message}</p>
        )}
      </div>

      {/* Fecha de atención y Kilometraje */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label id="service-record-date-label" className="block text-sm font-medium text-on-surface mb-2">
            Fecha de atención *
          </label>
          <Controller
            name="service_date"
            control={control}
            rules={{ required: 'Fecha es requerida', validate: validInput() }}
            render={({ field }) => (
              <DateInput
                ref={field.ref}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-labelledby="service-record-date-label"
                error={!!errors.service_date}
                className={inputClass(errors.service_date)}
              />
            )}
          />
          {errors.service_date && (
            <p className="mt-1 text-sm text-error">{errors.service_date.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">
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
            <p className="mt-1 text-sm text-error">{errors.mileage.message}</p>
          )}
        </div>
      </div>

      {/* Total y Próximo servicio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-on-surface mb-2">
            Total (ARS)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">$</span>
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
            <p className="mt-1 text-sm text-error">{errors.total_amount.message}</p>
          )}
        </div>

        <div>
          <label id="service-record-next-date-label" className="block text-sm font-medium text-on-surface mb-2">
            Próximo servicio
          </label>
          <Controller
            name="next_service_date"
            control={control}
            rules={{ validate: validInput() }}
            render={({ field }) => (
              <DateInput
                ref={field.ref}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-labelledby="service-record-next-date-label"
                error={!!errors.next_service_date}
                className={inputClass(errors.next_service_date)}
              />
            )}
          />
          {errors.next_service_date && (
            <p className="mt-1 text-sm text-error">{errors.next_service_date.message}</p>
          )}
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-on-surface mb-2">
          Notas
        </label>
        <textarea
          rows={3}
          {...register('notes')}
          className={inputClass(false)}
          placeholder="Observaciones, trabajos realizados..."
        />
      </div>

      {/* Fotos */}
      <PhotosUpload
        label="Fotos de la Atención"
        currentUrls={record?.photos_urls || []}
        onChange={setPhotoFiles}
      />
    </form>
  );
};

export default ServiceRecordForm;
