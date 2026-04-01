import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import CustomerSearchInput from "@components/features/customers/CustomerSearchInput";

const VehicleForm = ({
  onSubmit,
  vehicle = null,
  isLoading = false,
  customerId = null,
  formId = 'vehicle-form',
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || "");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm({
    defaultValues: vehicle || {
      brand: "",
      model: "",
      license_plate: "",
      year: "",
      customer_id: customerId || ""
    }
  });

  // Sincronizar el customer_id del formulario con el estado local
  useEffect(() => {
    // Solo necesitamos sincronizar el estado local para el formulario
    const customerIdToUse = vehicle?.customer_id || customerId;
    if (customerIdToUse && customerIdToUse !== selectedCustomerId) {
      setSelectedCustomerId(customerIdToUse);
      setValue('customer_id', customerIdToUse);
    }
  }, [vehicle, customerId, selectedCustomerId, setValue]);

  // Debug: Log para verificar que el cliente se está pasando correctamente
  useEffect(() => {
    if (vehicle?.customer) {
      console.log('VehicleForm - Cliente cargado:', vehicle.customer);
    }
  }, [vehicle]);

  const handleFormSubmit = async (data) => {
    try {
      // Asegurar que el customer_id esté incluido en los datos
      const formData = {
        ...data,
        customer_id: selectedCustomerId
      };
      
      await onSubmit(formData);
      reset();
      setSelectedCustomerId("");
    } catch (error) {
      console.error('Error submitting vehicle form:', error);
    }
  };

  const currentYear = new Date().getFullYear();

  const handleCustomerSelect = (customer) => {
    if (customer) {
      setSelectedCustomerId(customer.id);
      setValue('customer_id', customer.id);
    } else {
      setSelectedCustomerId("");
      setValue('customer_id', "");
    }
  };

  const handleCustomerChange = (customerId) => {
    setSelectedCustomerId(customerId);
    setValue('customer_id', customerId);
  };

  return (
    <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
            value={vehicle?.customer_id || customerId || selectedCustomerId}
            onChange={handleCustomerChange}
            onSelect={handleCustomerSelect}
            placeholder="Buscar cliente por nombre o email..."
            error={errors.customer_id?.message}
            disabled={isLoading}
            initialCustomer={vehicle?.customer} // Pasar el cliente completo si existe
          />
          {/* Campo oculto para validación */}
          <input
            type="hidden"
            {...register("customer_id", {
              required: "El cliente es requerido",
              validate: (value) => {
                return value && value !== "" || "El cliente es requerido";
              }
            })}
          />
          {errors.customer_id && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.customer_id.message}
            </p>
          )}
        </div>
      </div>

    </form>
  );
};

export default VehicleForm; 