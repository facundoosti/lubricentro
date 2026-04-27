import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { Loader2, Sparkles } from "lucide-react";
import CustomerSearchInput from "@components/features/customers/CustomerSearchInput";
import ImageUpload from '@ui/ImageUpload';
import { lookupVehicleByPlate } from "@services/vehiclesService";

const VehicleForm = ({
  onSubmit,
  vehicle = null,
  isLoading = false,
  customerId = null,
  initialCustomer = null,
  formId = 'vehicle-form',
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || "");
  const [imageFile, setImageFile] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);
  const lastLookedUpPlate = useRef("");

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
      const formData = { ...data, customer_id: selectedCustomerId };
      if (imageFile) formData.image = imageFile;
      await onSubmit(formData);
      reset();
      setImageFile(null);
      setSelectedCustomerId("");
    } catch (error) {
      console.error('Error submitting vehicle form:', error);
    }
  };

  const currentYear = new Date().getFullYear();

  const PLATE_OLD = /^[A-Z]{3}\s?[0-9]{3}$/;        // ABC123 o ABC 123
  const PLATE_NEW = /^[A-Z]{2}\s?[0-9]{3}\s?[A-Z]{2}$/; // AC314BP o AC 314 BP

  const isValidArgentinePlate = (plate) =>
    PLATE_OLD.test(plate) || PLATE_NEW.test(plate);

  const handleLicensePlateChange = (e) => {
    if (e.target.value.trim() === "") {
      setValue("brand", "", { shouldValidate: false });
      setValue("model", "", { shouldValidate: false });
      setValue("year", "", { shouldValidate: false });
      setAutoFilled(false);
      lastLookedUpPlate.current = "";
    }
  };

  const handleLicensePlateBlur = async (e) => {
    const plate = e.target.value.trim().toUpperCase();

    if (!isValidArgentinePlate(plate) || plate === lastLookedUpPlate.current) return;

    lastLookedUpPlate.current = plate;
    setIsLookingUp(true);
    setAutoFilled(false);

    try {
      const response = await lookupVehicleByPlate(plate);
      const vehicleData = response?.data?.vehicle;

      if (vehicleData?.status === "found") {
        setValue("brand", vehicleData.make, { shouldValidate: true });
        setValue("model", vehicleData.model?.substring(0, 50), { shouldValidate: true });
        setValue("year", String(vehicleData.year), { shouldValidate: true });
        setAutoFilled(true);
      }
    } catch {
      // lookup failed silently — user fills manually
    } finally {
      setIsLookingUp(false);
    }
  };

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

  const { onChange: plateRhfOnChange, onBlur: plateRhfOnBlur, ...plateReg } = register("license_plate", {
    required: "La patente es requerida",
    validate: (value) => {
      const plate = value.trim().toUpperCase();
      return (
        /^[A-Z]{3}\s?[0-9]{3}$/.test(plate) ||
        /^[A-Z]{2}\s?[0-9]{3}\s?[A-Z]{2}$/.test(plate) ||
        "Formato inválido. Usá ABC123 (viejo) o AB123CD (nuevo)"
      );
    }
  });

  return (
    <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Patente */}
        <div className="md:col-span-2">
          <label htmlFor="license_plate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Patente *
          </label>
          <div className="relative">
            <input
              type="text"
              id="license_plate"
              {...plateReg}
              onChange={(e) => { plateRhfOnChange(e); handleLicensePlateChange(e); }}
              onBlur={(e) => { plateRhfOnBlur(e); handleLicensePlateBlur(e); }}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white font-mono pr-10 ${
                errors.license_plate ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: ABC123, AB 123 CD"
              style={{ textTransform: "uppercase" }}
            />
            {isLookingUp && (
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              </div>
            )}
          </div>
          {errors.license_plate && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.license_plate.message}
            </p>
          )}
          {!errors.license_plate && isLookingUp && (
            <p className="mt-1 text-sm text-blue-500 dark:text-blue-400">
              Buscando información del vehículo...
            </p>
          )}
        </div>

        {/* Marca */}
        <div className="relative">
          <label htmlFor="brand" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Marca *
            {autoFilled && !isLookingUp && (
              <span className="inline-flex items-center gap-1 text-xs font-normal text-blue-500 dark:text-blue-400">
                <Sparkles className="w-3 h-3" /> Autocompletado
              </span>
            )}
            {isLookingUp && (
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            )}
          </label>
          <input
            type="text"
            id="brand"
            disabled={isLookingUp}
            {...register("brand", {
              required: "La marca es requerida",
              minLength: { value: 2, message: "La marca debe tener al menos 2 caracteres" },
              maxLength: { value: 50, message: "La marca no puede exceder 50 caracteres" }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-opacity ${
              errors.brand ? 'border-red-500' : 'border-gray-300'
            } ${isLookingUp ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Ej: Toyota, Ford, Honda..."
          />
          {errors.brand && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.brand.message}</p>
          )}
        </div>

        {/* Modelo */}
        <div className="relative">
          <label htmlFor="model" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Modelo *
            {autoFilled && !isLookingUp && (
              <span className="inline-flex items-center gap-1 text-xs font-normal text-blue-500 dark:text-blue-400">
                <Sparkles className="w-3 h-3" /> Autocompletado
              </span>
            )}
            {isLookingUp && (
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            )}
          </label>
          <input
            type="text"
            id="model"
            disabled={isLookingUp}
            {...register("model", {
              required: "El modelo es requerido",
              minLength: { value: 2, message: "El modelo debe tener al menos 2 caracteres" },
              maxLength: { value: 50, message: "El modelo no puede exceder 50 caracteres" }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-opacity ${
              errors.model ? 'border-red-500' : 'border-gray-300'
            } ${isLookingUp ? 'opacity-50 cursor-not-allowed' : ''}`}
            placeholder="Ej: Corolla, Focus, Civic..."
          />
          {errors.model && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.model.message}</p>
          )}
        </div>

        {/* Año */}
        <div className="relative">
          <label htmlFor="year" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Año *
            {autoFilled && !isLookingUp && (
              <span className="inline-flex items-center gap-1 text-xs font-normal text-blue-500 dark:text-blue-400">
                <Sparkles className="w-3 h-3" /> Autocompletado
              </span>
            )}
            {isLookingUp && (
              <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
            )}
          </label>
          <select
            id="year"
            disabled={isLookingUp}
            {...register("year", {
              required: "El año es requerido",
              validate: (value) => {
                const year = parseInt(value);
                return (year >= 1990 && year <= currentYear) || "El año debe estar entre 1990 y el año actual";
              }
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white transition-opacity ${
              errors.year ? 'border-red-500' : 'border-gray-300'
            } ${isLookingUp ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <option value="">Seleccionar año</option>
            {Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {errors.year && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.year.message}</p>
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
            disabled={isLoading || !!customerId}
            initialCustomer={vehicle?.customer || initialCustomer}
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
        </div>
      </div>

      {/* Imagen */}
      <ImageUpload
        label="Foto del Vehículo"
        currentUrl={vehicle?.image_url}
        onChange={setImageFile}
      />

    </form>
  );
};

export default VehicleForm;