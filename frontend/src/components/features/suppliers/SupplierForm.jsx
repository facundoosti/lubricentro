import { useForm } from 'react-hook-form';

const SupplierForm = ({ supplier = null, onSubmit, formId = 'supplier-form' }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      name: supplier?.name || '',
      cuit: supplier?.cuit || '',
      email: supplier?.email || '',
      phone: supplier?.phone || '',
      address: supplier?.address || '',
      notes: supplier?.notes || '',
    },
  });

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset();
  };

  const inputClass = (hasError) =>
    `w-full px-3 py-2 bg-surface-variant border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface placeholder:text-secondary ${
      hasError ? 'border-error' : 'border-outline-variant'
    }`;

  return (
    <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nombre */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
            Nombre *
          </label>
          <input
            type="text"
            {...register('name', {
              required: 'El nombre es requerido',
              maxLength: { value: 150, message: 'Máximo 150 caracteres' },
            })}
            className={inputClass(errors.name)}
            placeholder="Ej: Distribuidora Norte SA"
          />
          {errors.name && <p className="mt-1 text-sm text-error">{errors.name.message}</p>}
        </div>

        {/* CUIT */}
        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
            CUIT
          </label>
          <input
            type="text"
            {...register('cuit', {
              maxLength: { value: 20, message: 'Máximo 20 caracteres' },
            })}
            className={inputClass(errors.cuit)}
            placeholder="Ej: 30-12345678-9"
          />
          {errors.cuit && <p className="mt-1 text-sm text-error">{errors.cuit.message}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
            Teléfono
          </label>
          <input
            type="text"
            {...register('phone', {
              maxLength: { value: 30, message: 'Máximo 30 caracteres' },
            })}
            className={inputClass(errors.phone)}
            placeholder="Ej: +54 11 1234-5678"
          />
          {errors.phone && <p className="mt-1 text-sm text-error">{errors.phone.message}</p>}
        </div>

        {/* Email */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
            Email
          </label>
          <input
            type="email"
            {...register('email', {
              maxLength: { value: 100, message: 'Máximo 100 caracteres' },
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email inválido',
              },
            })}
            className={inputClass(errors.email)}
            placeholder="Ej: ventas@proveedor.com"
          />
          {errors.email && <p className="mt-1 text-sm text-error">{errors.email.message}</p>}
        </div>

        {/* Dirección */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
            Dirección
          </label>
          <input
            type="text"
            {...register('address', {
              maxLength: { value: 200, message: 'Máximo 200 caracteres' },
            })}
            className={inputClass(errors.address)}
            placeholder="Ej: Av. Corrientes 1234, CABA"
          />
          {errors.address && <p className="mt-1 text-sm text-error">{errors.address.message}</p>}
        </div>

        {/* Notas */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
            Notas
          </label>
          <textarea
            rows={3}
            {...register('notes')}
            className={inputClass(false)}
            placeholder="Observaciones adicionales..."
          />
        </div>
      </div>
    </form>
  );
};

export default SupplierForm;
