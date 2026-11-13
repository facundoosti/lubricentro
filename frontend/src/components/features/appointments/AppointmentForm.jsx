import { useForm, Controller } from 'react-hook-form';
import { useVehicles } from '@services/vehiclesService';
import Select from '@ui/Select';
import DateInput from '@ui/DateInput';
import { isInvalidInput, validInput } from '@/lib/maskedInput';
import Field from '@ui/Field';
import Textarea from '@ui/Textarea';
import CustomerSearchInput from '@components/features/customers/CustomerSearchInput';
import { useEffect, useState, useMemo } from 'react';

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

  const { register, handleSubmit, control, formState: { errors }, watch, setValue, trigger, reset, clearErrors } = useForm({
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

  const vehicleOptions = vehicles.map((vehicle) => ({
    value: String(vehicle.id),
    label: `${vehicle.brand} ${vehicle.model} - ${vehicle.license_plate}`,
  }));
  const vehiclePlaceholder = !selectedCustomerId
    ? 'Primero selecciona un cliente'
    : vehiclesLoading
      ? 'Cargando vehículos...'
      : vehiclesError
        ? 'Error al cargar vehículos'
        : vehicles.length === 0
          ? 'No hay vehículos registrados para este cliente'
          : 'Seleccionar vehículo';

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
      <Field id="appointment-customer" label="Cliente" required error={customerError}>
        <CustomerSearchInput
          value={selectedCustomerId}
          onChange={handleCustomerChange}
          placeholder="Buscar cliente por nombre o correo..."
          initialCustomer={initialData?.customer || null}
        />
      </Field>

      {/* Vehículo */}
      <Field
        id="appointment-vehicle"
        label="Vehículo"
        required
        error={errors.vehicle_id?.message}
        labelAddon={vehiclesLoading && selectedCustomerId && (
          <span className="text-xs font-normal text-on-surface-variant">(Cargando...)</span>
        )}
      >
        <Controller
          name="vehicle_id"
          control={control}
          rules={{ required: 'Vehículo es requerido' }}
          render={({ field }) => (
            <Select
              options={vehicleOptions}
              value={field.value}
              onChange={field.onChange}
              placeholder={vehiclePlaceholder}
              disabled={vehiclesLoading || !selectedCustomerId}
              id="appointment-vehicle"
              aria-labelledby="appointment-vehicle-label"
              error={!!errors.vehicle_id}
              // Deshabilitado como el <select> nativo que reemplaza: transparente y con el texto pleno
              className="disabled:bg-transparent disabled:opacity-100"
              valueClassName={vehiclesLoading || !selectedCustomerId ? 'data-placeholder:text-on-surface' : undefined}
            />
          )}
        />
      </Field>

      {/* Fecha y Hora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fecha */}
        <Field id="appointment-date" label="Fecha" required error={errors.scheduled_date?.message}>
          <Controller
            name="scheduled_date"
            control={control}
            rules={{ required: 'Fecha es requerida', validate: validInput() }}
            render={({ field }) => (
              <DateInput
                ref={field.ref}
                name={field.name}
                value={field.value}
                // mode 'onChange': una fecha a medio tipear no muestra error; se valida al salir o al enviar.
                onChange={(value) => {
                  if (isInvalidInput(value)) {
                    setValue('scheduled_date', value, { shouldDirty: true });
                    clearErrors('scheduled_date');
                  } else {
                    field.onChange(value);
                  }
                }}
                onBlur={() => {
                  field.onBlur();
                  if (isInvalidInput(field.value)) trigger('scheduled_date');
                }}
                id="appointment-date"
                aria-labelledby="appointment-date-label"
                error={!!errors.scheduled_date}
              />
            )}
          />
        </Field>

        {/* Hora */}
        <Field id="appointment-time" label="Hora" required error={errors.scheduled_time?.message}>
          <Controller
            name="scheduled_time"
            control={control}
            rules={{ required: 'Hora es requerida' }}
            render={({ field }) => (
              <Select
                options={hourOptions}
                value={field.value}
                onChange={field.onChange}
                placeholder="Seleccionar hora"
                id="appointment-time"
                aria-labelledby="appointment-time-label"
                error={!!errors.scheduled_time}
              />
            )}
          />
        </Field>
      </div>

      {/* Estado */}
      <Field id="appointment-status" label="Estado">
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select
              options={statusOptions}
              value={field.value}
              onChange={field.onChange}
              id="appointment-status"
              aria-labelledby="appointment-status-label"
            />
          )}
        />
      </Field>

      {/* Notas */}
      <Field label="Notas">
        <Textarea
          {...register('notes')}
          placeholder="Observaciones adicionales..."
          rows={3}
        />
      </Field>

    </form>
  );
};

export default AppointmentForm; 