import { useForm, Controller } from 'react-hook-form';
import { useVehicles } from '@services/vehiclesService';
import SearchableSelect from '@ui/SearchableSelect';
import TextArea from '@ui/TextArea';
import CustomerSearchInput from '@components/features/customers/CustomerSearchInput';
import { useEffect, useState, useMemo } from 'react';

const fieldClass = (hasError) =>
  `h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-on-surface shadow-theme-xs placeholder:text-secondary focus:border-primary focus:outline-hidden focus:ring-3 focus:ring-primary/10 ${
    hasError ? 'border-error' : 'border-outline-variant'
  }`;

// Horarios en punto de 8 AM a 8 PM. value 'HH:00' (lo que se envía), label con AM/PM
const formatHour = (time) => {
  const [hh, mm] = time.split(':').map(Number);
  const suffix = hh < 12 ? 'AM' : 'PM';
  const h12 = hh % 12 || 12;
  return mm ? `${h12}:${String(mm).padStart(2, '0')} ${suffix}` : `${h12} ${suffix}`;
};
const HOUR_OPTIONS = Array.from({ length: 13 }, (_, i) => {
  const value = `${String(i + 8).padStart(2, '0')}:00`;
  return { value, label: formatHour(value) };
});

// Abre el calendario nativo al hacer click en cualquier parte del campo
const openPicker = (e) => {
  try {
    e.currentTarget.showPicker?.();
  } catch {
    // showPicker puede lanzar si el navegador no lo permite; el input sigue funcionando
  }
};

const AppointmentForm = ({ onSubmit, initialData, formId = 'appointment-form' }) => {
  // Fecha actual (la hora arranca vacía: se elige siempre)
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return { date: `${year}-${month}-${day}` };
  };

  const currentDateTime = useMemo(() => getCurrentDateTime(), []);

  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, control, formState: { errors }, watch, setValue, trigger, reset } = useForm({
    defaultValues: {
      customer_id: '',
      vehicle_id: '',
      scheduled_date: currentDateTime.date,
      scheduled_time: '',
      status: 'scheduled',
      notes: ''
    },
    mode: 'onChange'
  });

  const selectedCustomerId = watch('customer_id');

  // Fetch vehicles for selected customer
  const { data: vehiclesData, isLoading: vehiclesLoading, error: vehiclesError } = useVehicles(
    selectedCustomerId ? { customer_id: selectedCustomerId } : {}
  );

  // Ensure we always have arrays - manejar la estructura de respuesta del backend
  const vehicles = useMemo(() => {
    if (!selectedCustomerId || !vehiclesData) return [];
    // La respuesta del backend tiene estructura: { success: true, data: { vehicles: [...] } }
    if (vehiclesData.data && Array.isArray(vehiclesData.data.vehicles)) {
      return vehiclesData.data.vehicles;
    } else if (Array.isArray(vehiclesData.data)) {
      return vehiclesData.data;
    } else if (Array.isArray(vehiclesData.vehicles)) {
      return vehiclesData.vehicles;
    } else if (Array.isArray(vehiclesData)) {
      return vehiclesData;
    }
    return [];
  }, [selectedCustomerId, vehiclesData]);

  // Turnos viejos con minutos (p. ej. 10:30): se agrega su horario para poder mostrarlo
  const selectedTime = watch('scheduled_time');
  const hourOptions = selectedTime && !HOUR_OPTIONS.some((o) => o.value === selectedTime)
    ? [...HOUR_OPTIONS, { value: selectedTime, label: formatHour(selectedTime) }].sort((a, b) => a.value.localeCompare(b.value))
    : HOUR_OPTIONS;

  const statusOptions = [
    { value: 'scheduled', label: 'Agendado' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const handleFormSubmit = (data) => {
    // Validate customer_id before submission
    if (!data.customer_id) {
      return;
    }
    
    // Combine date and time into scheduled_at for backend
    if (data.scheduled_date && data.scheduled_time) {
      const dateTimeString = `${data.scheduled_date}T${data.scheduled_time}`;
      const date = new Date(dateTimeString);
      data.scheduled_at = date.toISOString();
    }
    
    // Remove the separate date and time fields before sending
    delete data.scheduled_date;
    delete data.scheduled_time;
    
    onSubmit(data);
  };

  // Effect to handle initial data when editing
  useEffect(() => {
    if (initialData) {
      let scheduled_date = currentDateTime.date;
      let scheduled_time = '';

      if (initialData.scheduled_at) {
        const date = new Date(initialData.scheduled_at);
        scheduled_date = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        scheduled_time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      }

      reset({
        customer_id: initialData.customer_id || initialData.customer?.id || '',
        vehicle_id: initialData.vehicle_id || initialData.vehicle?.id || '',
        scheduled_date,
        scheduled_time,
        status: initialData.status || 'scheduled',
        notes: initialData.notes || '',
      });
    } else {
      reset({
        customer_id: '',
        vehicle_id: '',
        scheduled_date: currentDateTime.date,
        scheduled_time: '',
        status: 'scheduled',
        notes: '',
      });
    }
  }, [initialData, currentDateTime.date, reset]);

  // When editing, set vehicle_id once vehicles finish loading
  useEffect(() => {
    if (initialData && vehicles.length > 0) {
      const vehicleId = initialData.vehicle_id || initialData.vehicle?.id;
      if (vehicleId) {
        setValue('vehicle_id', String(vehicleId));
      }
    }
  }, [vehicles, initialData, setValue]);

  const handleCustomerChange = async (customerId) => {
    setValue('customer_id', customerId);
    // Clear vehicle selection when customer changes
    setValue('vehicle_id', '');

    // Trigger validation for customer_id field
    await trigger('customer_id');
  };

  // Custom validation for customer_id — only show after a submit attempt
  const customerError = submitted && !selectedCustomerId ? 'Cliente es requerido' : null;

  return (
    <form
      id={formId}
      onSubmit={(e) => {
        // Se marca antes de validar: si falla otro campo, RHF no llama a handleFormSubmit
        // y el error de "Cliente" (validado a mano) nunca se mostraría
        setSubmitted(true);
        return handleSubmit(handleFormSubmit)(e);
      }}
      className="space-y-6"
    >
      {/* Cliente */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-on-surface">
          Cliente *
        </label>
        <CustomerSearchInput
          value={selectedCustomerId}
          onChange={handleCustomerChange}
          placeholder="Buscar cliente por nombre o correo..."
          error={customerError}
          initialCustomer={initialData?.customer || null}
        />
      </div>

      {/* Vehículo */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-on-surface">
          Vehículo *
          {vehiclesLoading && selectedCustomerId && (
            <span className="ml-2 text-xs text-on-surface-variant">
              (Cargando...)
            </span>
          )}
        </label>
        <select
          {...register('vehicle_id', { required: 'Vehículo es requerido' })}
          className={fieldClass(!!errors.vehicle_id)}
          aria-invalid={!!errors.vehicle_id}
          disabled={vehiclesLoading || !selectedCustomerId}
        >
          <option value="">
            {!selectedCustomerId 
              ? 'Primero selecciona un cliente' 
              : vehiclesLoading 
                ? 'Cargando vehículos...' 
                : vehiclesError
                  ? 'Error al cargar vehículos'
                  : vehicles.length === 0 
                    ? 'No hay vehículos registrados para este cliente'
                    : 'Seleccionar vehículo'
            }
          </option>
          {Array.isArray(vehicles) && vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.brand} {vehicle.model} - {vehicle.license_plate}
            </option>
          ))}
        </select>
        {errors.vehicle_id && (
          <p className="mt-1 text-sm text-error">
            {errors.vehicle_id.message}
          </p>
        )}
      </div>

      {/* Fecha y Hora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fecha */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-on-surface">
            Fecha *
          </label>
          <input
            type="date"
            {...register('scheduled_date', { required: 'Fecha es requerida' })}
            onClick={openPicker}
            className={`${fieldClass(!!errors.scheduled_date)} cursor-pointer`}
            aria-invalid={!!errors.scheduled_date}
          />
          {errors.scheduled_date && (
            <p className="mt-1 text-sm text-error">
              {errors.scheduled_date.message}
            </p>
          )}
        </div>

        {/* Hora */}
        <div>
          <label id="appointment-time-label" className="mb-1.5 block text-sm font-medium text-on-surface">
            Hora *
          </label>
          <Controller
            name="scheduled_time"
            control={control}
            rules={{ required: 'Hora es requerida' }}
            render={({ field }) => (
              <SearchableSelect
                options={hourOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Seleccionar hora"
                searchable={false}
                clearable={false}
                aria-labelledby="appointment-time-label"
                error={!!errors.scheduled_time}
                className="h-11 px-4"
              />
            )}
          />
          {errors.scheduled_time && (
            <p className="mt-1 text-sm text-error">
              {errors.scheduled_time.message}
            </p>
          )}
        </div>
      </div>

      {/* Estado */}
      <div>
        <label id="appointment-status-label" className="mb-1.5 block text-sm font-medium text-on-surface">
          Estado
        </label>
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <SearchableSelect
              options={statusOptions}
              value={field.value}
              onChange={field.onChange}
              searchable={false}
              clearable={false}
              aria-labelledby="appointment-status-label"
              className="h-11 px-4"
            />
          )}
        />
      </div>

      {/* Notas */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-on-surface">
          Notas
        </label>
        <TextArea
          {...register('notes')}
          placeholder="Observaciones adicionales..."
          rows={3}
        />
      </div>

    </form>
  );
};

export default AppointmentForm; 