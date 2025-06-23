import { useForm } from 'react-hook-form';
import { useCustomers } from '@services/customersService';
import { useVehicles } from '@services/vehiclesService';
import InputField from '@ui/InputField';
import TextArea from '@ui/TextArea';

const AppointmentForm = ({ onSubmit, initialData, isLoading, onCancel }) => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: initialData || {
      customer_id: '',
      vehicle_id: '',
      scheduled_at: '',
      status: 'scheduled',
      notes: ''
    }
  });

  const selectedCustomerId = watch('customer_id');

  // Fetch customers and vehicles
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: vehiclesData, isLoading: vehiclesLoading } = useVehicles(
    selectedCustomerId ? { customer_id: selectedCustomerId } : {}
  );

  // Ensure we always have arrays
  const customers = Array.isArray(customersData?.data) ? customersData.data : [];
  const vehicles = selectedCustomerId && Array.isArray(vehiclesData?.data) ? vehiclesData.data : [];

  // Debug logs
  console.log('AppointmentForm - customersData:', customersData);
  console.log('AppointmentForm - vehiclesData:', vehiclesData);
  console.log('AppointmentForm - selectedCustomerId:', selectedCustomerId);
  console.log('AppointmentForm - customers:', customers);
  console.log('AppointmentForm - vehicles:', vehicles);

  const statusOptions = [
    { value: 'scheduled', label: 'Agendado' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'completed', label: 'Completado' },
    { value: 'cancelled', label: 'Cancelado' }
  ];

  const handleFormSubmit = (data) => {
    // Convert date string to ISO format for backend
    if (data.scheduled_at) {
      const date = new Date(data.scheduled_at);
      data.scheduled_at = date.toISOString();
    }
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Cliente */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Cliente *
        </label>
        <select
          {...register('customer_id', { required: 'Cliente es requerido' })}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          disabled={customersLoading}
        >
          <option value="">Seleccionar cliente</option>
          {Array.isArray(customers) && customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.name} - {customer.phone}
            </option>
          ))}
        </select>
        {errors.customer_id && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.customer_id.message}
          </p>
        )}
      </div>

      {/* Vehículo */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Vehículo *
        </label>
        <select
          {...register('vehicle_id', { required: 'Vehículo es requerido' })}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          disabled={vehiclesLoading || !selectedCustomerId}
        >
          <option value="">
            {!selectedCustomerId ? 'Primero selecciona un cliente' : 'Seleccionar vehículo'}
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
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
          Fecha y Hora *
        </label>
        <input
          type="datetime-local"
          {...register('scheduled_at', { required: 'Fecha y hora es requerida' })}
          className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
        {errors.scheduled_at && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.scheduled_at.message}
          </p>
        )}
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

      {/* Botones */}
      <div className="flex items-center gap-3 sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 sm:w-auto"
        >
          {isLoading ? 'Guardando...' : (initialData ? 'Actualizar' : 'Crear')}
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm; 