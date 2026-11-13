import { useForm } from 'react-hook-form';
import Field from '@ui/Field';
import Input from '@ui/Input';
import Textarea from '@ui/Textarea';

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

  return (
    <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nombre */}
        <Field label="Nombre" required error={errors.name?.message} className="md:col-span-2">
          <Input
            {...register('name', {
              required: 'El nombre es requerido',
              maxLength: { value: 150, message: 'Máximo 150 caracteres' },
            })}
            placeholder="Ej: Distribuidora Norte SA"
          />
        </Field>

        {/* CUIT */}
        <Field label="CUIT" error={errors.cuit?.message}>
          <Input
            {...register('cuit', {
              maxLength: { value: 20, message: 'Máximo 20 caracteres' },
            })}
            placeholder="Ej: 30-12345678-9"
          />
        </Field>

        {/* Teléfono */}
        <Field label="Teléfono" error={errors.phone?.message}>
          <Input
            {...register('phone', {
              maxLength: { value: 30, message: 'Máximo 30 caracteres' },
            })}
            placeholder="Ej: +54 11 1234-5678"
          />
        </Field>

        {/* Email */}
        <Field label="Email" error={errors.email?.message} className="md:col-span-2">
          <Input
            type="email"
            {...register('email', {
              maxLength: { value: 100, message: 'Máximo 100 caracteres' },
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Email inválido',
              },
            })}
            placeholder="Ej: ventas@proveedor.com"
          />
        </Field>

        {/* Dirección */}
        <Field label="Dirección" error={errors.address?.message} className="md:col-span-2">
          <Input
            {...register('address', {
              maxLength: { value: 200, message: 'Máximo 200 caracteres' },
            })}
            placeholder="Ej: Av. Corrientes 1234, CABA"
          />
        </Field>

        {/* Notas */}
        <Field label="Notas" className="md:col-span-2">
          <Textarea
            rows={3}
            {...register('notes')}
            placeholder="Observaciones adicionales..."
          />
        </Field>
      </div>
    </form>
  );
};

export default SupplierForm;
