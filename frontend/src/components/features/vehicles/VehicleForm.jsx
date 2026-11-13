import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Loader2, Sparkles } from 'lucide-react';
import CustomerSearchInput from '@components/features/customers/CustomerSearchInput';
import CustomerModal from '@components/features/customers/CustomerModal';
import PlateStatus from '@components/features/vehicles/PlateStatus';
import ImageUpload from '@ui/ImageUpload';
import Select from '@ui/Select';
import { useVehiclePlate } from '@hooks/useVehiclePlate';
import { useCreateCustomer } from '@services/customersService';
import { showCustomerSuccess, showCustomerError, parseApiError } from '@services/notificationService';
import { inputClass, labelClass } from '@utils/formStyles';

export const MIN_VEHICLE_YEAR = 1950;
const AUTOFILL_FIELDS = ['brand', 'model', 'year'];

const lookupValues = (data) => ({
  brand: data.make,
  model: data.model?.substring(0, 50),
  year: data.year ? String(data.year) : '',
});

const AutoFilledBadge = () => (
  <span className="inline-flex items-center gap-1 text-xs font-normal text-primary">
    <Sparkles className="w-3 h-3" /> Autocompletado
  </span>
);

const VehicleForm = ({
  onSubmit,
  vehicle = null,
  isLoading = false,
  customerId = null,
  initialCustomer = null,
  formId = 'vehicle-form',
  onPlateConflictChange,
}) => {
  const [imageFile, setImageFile] = useState(null);
  // Campos completados por la búsqueda (se pueden volver a completar; los escritos a mano no)
  const [autoFilled, setAutoFilled] = useState({});
  const [newCustomerName, setNewCustomerName] = useState(null);
  const [createdCustomer, setCreatedCustomer] = useState(null);
  const createCustomer = useCreateCustomer();

  const currentYear = new Date().getFullYear();

  const { register, control, handleSubmit, formState: { errors }, reset, setValue, getValues, watch } = useForm({
    defaultValues: {
      brand: vehicle?.brand ?? '',
      model: vehicle?.model ?? '',
      license_plate: vehicle?.license_plate ?? '',
      year: vehicle?.year ? String(vehicle.year) : '',
      customer_id: vehicle?.customer_id ?? customerId ?? '',
    },
  });

  const selectedCustomerId = watch('customer_id');
  const { conflict, isValid: plateIsValid, lookupStatus, lookupData, lookupPlate, retryLookup } =
    useVehiclePlate(watch('license_plate'), { currentVehicleId: vehicle?.id, originalPlate: vehicle?.license_plate });

  useEffect(() => {
    onPlateConflictChange?.(!!conflict);
  }, [conflict, onPlateConflictChange]);

  // Aplica el resultado de la búsqueda una vez por patente, sin pisar lo escrito a mano
  const appliedPlate = useRef(null);
  useEffect(() => {
    if (!lookupData || appliedPlate.current === lookupPlate) return;
    appliedPlate.current = lookupPlate;
    const values = lookupValues(lookupData);
    const filled = {};
    AUTOFILL_FIELDS.forEach((field) => {
      if (values[field] && (!getValues(field) || autoFilled[field])) {
        setValue(field, values[field], { shouldValidate: true });
        filled[field] = true;
      }
    });
    setAutoFilled((prev) => ({ ...prev, ...filled }));
  }, [lookupData, lookupPlate, getValues, setValue, autoFilled]);

  const fieldRegister = (field, rules) => {
    const reg = register(field, rules);
    return {
      ...reg,
      onChange: (e) => {
        setAutoFilled((prev) => (prev[field] ? { ...prev, [field]: false } : prev));
        return reg.onChange(e);
      },
    };
  };

  const plateReg = register('license_plate', {
    required: 'La patente es requerida',
    validate: (value) =>
      /^[A-Z]{3}\s?[0-9]{3}$/.test(value.trim().toUpperCase()) ||
      /^[A-Z]{2}\s?[0-9]{3}\s?[A-Z]{2}$/.test(value.trim().toUpperCase()) ||
      'Formato inválido. Usá ABC123 (viejo) o AB123CD (nuevo)',
  });

  const handlePlateChange = (e) => {
    if (e.target.value.trim() === '') {
      // Al borrar la patente se limpian solo los datos autocompletados
      AUTOFILL_FIELDS.forEach((field) => autoFilled[field] && setValue(field, ''));
      setAutoFilled({});
      appliedPlate.current = null;
    }
    return plateReg.onChange(e);
  };

  const handleFormSubmit = async (data) => {
    if (conflict) return;
    const formData = { ...data };
    if (imageFile) formData.image = imageFile;
    try {
      await onSubmit(formData);
      reset();
      setImageFile(null);
      setAutoFilled({});
    } catch {
      // el contenedor ya informó el error
    }
  };

  const handleCustomerSelect = (customer) => {
    setValue('customer_id', customer?.id ?? '', { shouldValidate: !!customer });
  };

  const handleCreateCustomer = async (data) => {
    try {
      const response = await createCustomer.mutateAsync(data);
      const customer = response?.data;
      setCreatedCustomer(customer);
      setValue('customer_id', customer.id, { shouldValidate: true });
      setNewCustomerName(null);
      showCustomerSuccess('CREATED');
    } catch (error) {
      showCustomerError('ERROR_CREATE', parseApiError(error));
    }
  };

  const isLookingUp = lookupStatus === 'loading';
  const yearOptions = Array.from({ length: currentYear - MIN_VEHICLE_YEAR + 1 }, (_, i) => {
    const year = String(currentYear - i);
    return { value: year, label: year };
  });
  const autoFieldClass = (field) => `${inputClass(!!errors[field])} transition-opacity ${isLookingUp ? 'opacity-50' : ''}`;
  const autoLabel = (field, text) => (
    <label id={`${field}-label`} htmlFor={field} className={labelClass}>
      {text}
      {autoFilled[field] && !isLookingUp && <AutoFilledBadge />}
      {isLookingUp && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
    </label>
  );

  return (
    <>
      <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Patente */}
          <div className="md:col-span-2">
            <label htmlFor="license_plate" className={labelClass}>Patente *</label>
            <div className="relative">
              <input
                type="text"
                id="license_plate"
                {...plateReg}
                onChange={handlePlateChange}
                className={`${inputClass(!!errors.license_plate || !!conflict)} font-mono uppercase pr-11`}
                placeholder="Ej: ABC123, AB 123 CD"
                autoComplete="off"
              />
              <button
                type="button"
                onClick={retryLookup}
                disabled={!plateIsValid || isLookingUp}
                aria-label="Buscar datos de la patente"
                title={plateIsValid ? 'Buscar datos de la patente' : 'Ingresá una patente válida primero'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-primary disabled:text-on-surface-variant disabled:cursor-not-allowed"
              >
                {isLookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              </button>
            </div>
            {errors.license_plate ? (
              <p className="mt-1 text-sm text-error">{errors.license_plate.message}</p>
            ) : (
              <PlateStatus conflict={conflict} lookupStatus={lookupStatus} />
            )}
          </div>

          {/* Marca */}
          <div>
            {autoLabel('brand', 'Marca *')}
            <input
              type="text"
              id="brand"
              {...fieldRegister('brand', {
                required: 'La marca es requerida',
                minLength: { value: 2, message: 'La marca debe tener al menos 2 caracteres' },
                maxLength: { value: 50, message: 'La marca no puede exceder 50 caracteres' },
              })}
              className={autoFieldClass('brand')}
              placeholder="Ej: Toyota, Ford, Honda..."
            />
            {errors.brand && <p className="mt-1 text-sm text-error">{errors.brand.message}</p>}
          </div>

          {/* Modelo */}
          <div>
            {autoLabel('model', 'Modelo *')}
            <input
              type="text"
              id="model"
              {...fieldRegister('model', {
                required: 'El modelo es requerido',
                minLength: { value: 2, message: 'El modelo debe tener al menos 2 caracteres' },
                maxLength: { value: 50, message: 'El modelo no puede exceder 50 caracteres' },
              })}
              className={autoFieldClass('model')}
              placeholder="Ej: Corolla, Focus, Civic..."
            />
            {errors.model && <p className="mt-1 text-sm text-error">{errors.model.message}</p>}
          </div>

          {/* Año */}
          <div>
            {autoLabel('year', 'Año *')}
            <Controller
              name="year"
              control={control}
              rules={{
                required: 'El año es requerido',
                validate: (value) => {
                  const year = parseInt(value, 10);
                  return (year >= MIN_VEHICLE_YEAR && year <= currentYear + 1) ||
                    `El año debe estar entre ${MIN_VEHICLE_YEAR} y ${currentYear}`;
                },
              }}
              render={({ field }) => (
                <Select
                  id="year"
                  aria-labelledby="year-label"
                  options={yearOptions}
                  value={field.value}
                  onChange={(value) => {
                    setAutoFilled((prev) => (prev.year ? { ...prev, year: false } : prev));
                    field.onChange(value);
                  }}
                  placeholder="Seleccionar año"
                  error={!!errors.year}
                  className={autoFieldClass('year')}
                />
              )}
            />
            {errors.year && <p className="mt-1 text-sm text-error">{errors.year.message}</p>}
          </div>

          {/* Cliente */}
          <div className="md:col-span-2">
            <label htmlFor="customer_id" className={labelClass}>Cliente *</label>
            <CustomerSearchInput
              value={selectedCustomerId}
              onSelect={handleCustomerSelect}
              error={errors.customer_id?.message}
              disabled={isLoading || !!customerId}
              initialCustomer={createdCustomer || vehicle?.customer || initialCustomer}
              onCreateNew={customerId ? null : setNewCustomerName}
            />
            <input type="hidden" {...register('customer_id', { required: 'El cliente es requerido' })} />
          </div>
        </div>

        <ImageUpload label="Foto del Vehículo" currentUrl={vehicle?.image_url} onChange={setImageFile} />
      </form>

      {/* Fuera del <form> del vehículo: no se pueden anidar formularios */}
      <CustomerModal
        isOpen={newCustomerName !== null}
        onClose={() => setNewCustomerName(null)}
        onSubmit={handleCreateCustomer}
        initialData={newCustomerName !== null ? { name: newCustomerName } : null}
        isLoading={createCustomer.isPending}
        formId="inline-customer-form"
      />
    </>
  );
};

export default VehicleForm;
