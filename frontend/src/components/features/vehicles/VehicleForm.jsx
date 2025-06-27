import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "@ui/Button";
import CustomerSearchInput from "@components/features/customers/CustomerSearchInput";

const VehicleForm = ({
  onSubmit,
  vehicle = null,
  isLoading = false,
  onCancel,
  customerId = null
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    defaultValues: vehicle || {
      brand: "",
      model: "",
      license_plate: "",
      year: "",
      customer_id: customerId || ""
    }
  });

  // Efecto para inicializar el customer_id cuando se edita un vehículo
  useEffect(() => {
    if (vehicle && vehicle.customer_id) {
      setValue('customer_id', vehicle.customer_id);
    } else if (customerId) {
      setValue('customer_id', customerId);
    }
  }, [vehicle, customerId, setValue]);

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
      reset();
    } catch (error) {
      console.error('Error submitting vehicle form:', error);
    }
  };

  const currentYear = new Date().getFullYear();

  const handleCustomerSelect = (customer) => {
    if (customer) {
      setValue('customer_id', customer.id);
    } else {
      setValue('customer_id', '');
    }
  };

  const customerIdValue = watch('customer_id');

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marca */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Marca *
          </label>
          <input
            type="text"
            id="brand"
            {...register("brand", {
              required: "La marca es requerida",
              minLength: {
                value: 2,
                message: "La marca debe tener al menos 2 caracteres"
              },
              maxLength: {
                value: 50,
                message: "La marca no puede exceder 50 caracteres"
              }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.brand ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: Toyota, Ford, Honda..."
          />
          {errors.brand && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.brand.message}
            </p>
          )}
        </div>

        {/* Modelo */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Modelo *
          </label>
          <input
            type="text"
            id="model"
            {...register("model", {
              required: "El modelo es requerido",
              minLength: {
                value: 2,
                message: "El modelo debe tener al menos 2 caracteres"
              },
              maxLength: {
                value: 50,
                message: "El modelo no puede exceder 50 caracteres"
              }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.model ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: Corolla, Focus, Civic..."
          />
          {errors.model && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.model.message}
            </p>
          )}
        </div>

        {/* Patente */}
        <div>
          <label htmlFor="license_plate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Patente *
          </label>
          <input
            type="text"
            id="license_plate"
            {...register("license_plate", {
              required: "La patente es requerida",
              pattern: {
                value: /^[A-Za-z0-9\s]{6,10}$/,
                message: "La patente debe tener entre 6 y 10 caracteres (letras, números y espacios)"
              }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white font-mono ${
              errors.license_plate ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Ej: ABC123, AB 123 CD"
            style={{ textTransform: "uppercase" }}
          />
          {errors.license_plate && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.license_plate.message}
            </p>
          )}
        </div>

        {/* Año */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Año *
          </label>
          <select
            id="year"
            {...register("year", {
              required: "El año es requerido",
              validate: (value) => {
                const year = parseInt(value);
                return (year >= 1990 && year <= currentYear) || "El año debe estar entre 1990 y el año actual";
              }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.year ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Seleccionar año</option>
            {Array.from({ length: 30 }, (_, i) => currentYear - i).map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {errors.year && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.year.message}
            </p>
          )}
        </div>

        {/* Cliente - Búsqueda avanzada */}
        <div className="md:col-span-2">
          <label htmlFor="customer_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cliente *
          </label>
          <CustomerSearchInput
            value={customerIdValue}
            onChange={(value) => setValue('customer_id', value)}
            onSelect={handleCustomerSelect}
            placeholder="Buscar cliente por nombre o email..."
            error={errors.customer_id?.message}
            disabled={isLoading}
          />
          {/* Campo oculto para validación */}
          <input
            type="hidden"
            {...register("customer_id", {
              required: "El cliente es requerido"
            })}
          />
          {errors.customer_id && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.customer_id.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          disabled={isLoading}
        >
          {vehicle ? "Actualizar" : "Crear"} Vehículo
        </Button>
      </div>
    </form>
  );
};

export default VehicleForm; 