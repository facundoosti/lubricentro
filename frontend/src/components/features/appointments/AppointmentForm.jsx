import { useForm } from 'react-hook-form';
import { useVehicles } from '@services/vehiclesService';
import InputField from '@ui/InputField';
import TextArea from '@ui/TextArea';
import CustomerSearchInput from '@components/features/customers/CustomerSearchInput';
import { useEffect, useState, useMemo } from 'react';

const AppointmentForm = ({ onSubmit, initialData, formId = 'appointment-form' }) => {
  // Función para obtener la fecha y hora actual
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`
    };
  };

  const currentDateTime = useMemo(() => getCurrentDateTime(), []);

  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger, reset } = useForm({
    defaultValues: {
      customer_id: '',
      vehicle_id: '',
      scheduled_date: currentDateTime.date,
      scheduled_time: currentDateTime.time,
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

  const statusOptions = [
    { value: 'scheduled', label: 'Agendado' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  // Horarios comunes para un lubricentro (8:00 AM a 6:00 PM)
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00'
  ];

  const handleFormSubmit = (data) => {
    setSubmitted(true);
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
      let scheduled_time = currentDateTime.time;

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
        scheduled_time: currentDateTime.time,
        status: 'scheduled',
        notes: '',
      });
    }
  }, [initialData, currentDateTime.date, currentDateTime.time, reset]);

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
    <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Cliente */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Cliente *
        </label>
        <CustomerSearchInput
          value={selectedCustomerId}
          onChange={handleCustomerChange}
          placeholder="Buscar cliente por nombre o email..."
          error={customerError}
          initialCustomer={initialData?.customer || null}
        />
      </div>

      {/* Vehículo */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Vehículo *
          {vehiclesLoading && selectedCustomerId && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              (Cargando...)
            </span>
          )}
        </label>
        <select
          {...register('vehicle_id', { required: 'Vehículo es requerido' })}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
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
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.vehicle_id.message}
          </p>
        )}
      </div>

      {/* Fecha y Hora */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fecha */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Fecha *
          </label>
          <input
            type="date"
            {...register('scheduled_date', { required: 'Fecha es requerida' })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
          {errors.scheduled_date && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.scheduled_date.message}
            </p>
          )}
        </div>

        {/* Hora */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
            Hora *
          </label>
          <select
            {...register('scheduled_time', { required: 'Hora es requerida' })}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          >
            <option value="">Seleccionar hora</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {errors.scheduled_time && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.scheduled_time.message}
            </p>
          )}
        </div>
      </div>

      {/* Estado */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Estado
        </label>
        <select
          {...register('status')}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notas */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
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