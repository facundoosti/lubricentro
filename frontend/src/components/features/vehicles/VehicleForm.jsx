import React from "react";
import { useForm } from "react-hook-form";
import { useCustomers } from "@services/customersService";
import InputField from "@ui/InputField";
import Button from "@ui/Button";

const VehicleForm = ({
  onSubmit,
  initialData = null,
  isLoading = false,
  onCancel,
  customerId = null
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: initialData || {
      brand: "",
      model: "",
      license_plate: "",
      year: "",
      customer_id: customerId || ""
    }
  });

  // Obtener lista de clientes para el selector
  const { data: customersData } = useCustomers({ per_page: 1000 });
  const customers = customersData?.data?.customers || [];

  const handleFormSubmit = (data) => {
    console.log("VehicleForm - handleFormSubmit called with:", data);
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Marca */}
        <div>
          <InputField
            label="Marca"
            {...register("brand", {
              required: "La marca es requerida",
              minLength: {
                value: 2,
                message: "La marca debe tener al menos 2 caracteres"
              }
            })}
            error={errors.brand?.message}
            placeholder="Ej: Toyota"
          />
        </div>

        {/* Modelo */}
        <div>
          <InputField
            label="Modelo"
            {...register("model", {
              required: "El modelo es requerido",
              minLength: {
                value: 2,
                message: "El modelo debe tener al menos 2 caracteres"
              }
            })}
            error={errors.model?.message}
            placeholder="Ej: Corolla"
          />
        </div>

        {/* Patente */}
        <div>
          <InputField
            label="Patente"
            {...register("license_plate", {
              required: "La patente es requerida",
              pattern: {
                value: /^[A-Z]{2}\d{3}[A-Z]{2}$|^[A-Z]{3}\d{3}$/,
                message: "Formato de patente inválido (ej: AB123CD o ABC123)"
              }
            })}
            error={errors.license_plate?.message}
            placeholder="Ej: AB123CD"
          />
        </div>

        {/* Año */}
        <div>
          <InputField
            label="Año"
            type="number"
            {...register("year", {
              required: "El año es requerido",
              min: {
                value: 1900,
                message: "El año debe ser mayor a 1900"
              },
              max: {
                value: new Date().getFullYear() + 1,
                message: `El año no puede ser mayor a ${new Date().getFullYear() + 1}`
              }
            })}
            error={errors.year?.message}
            placeholder="Ej: 2020"
          />
        </div>

        {/* Cliente (solo si no estamos editando o si no tenemos customerId) */}
        {(!customerId || initialData) && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cliente
            </label>
            <select
              {...register("customer_id", {
                required: "El cliente es requerido"
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="">Seleccionar cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
            {errors.customer_id && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.customer_id.message}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
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
          isLoading={isLoading}
          disabled={isLoading}
        >
          {initialData ? "Actualizar" : "Crear"} Vehículo
        </Button>
      </div>
    </form>
  );
};

export default VehicleForm; 