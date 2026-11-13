import React from 'react';
import { useForm } from 'react-hook-form';
import Field from '@ui/Field';
import Input from '@ui/Input';
import Textarea from '@ui/Textarea';

const ServiceForm = ({
  service = null,
  onSubmit,
  formId = 'service-form',
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      base_price: service?.base_price || ''
    }
  });

  const handleFormSubmit = async (data) => {
    try {
      // Convertir base_price a número
      const formData = {
        ...data,
        base_price: parseFloat(data.base_price)
      };
      
      await onSubmit(formData);
      reset();
    } catch (error) {
      console.error('Error submitting service form:', error);
    }
  };

  return (
    <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-6">
      {/* Nombre */}
      <Field label="Nombre del Servicio" required error={errors.name?.message}>
        <Input
          id="name"
          {...register('name', {
            required: 'El nombre es requerido',
            maxLength: {
              value: 100,
              message: 'El nombre no puede exceder 100 caracteres'
            }
          })}
          placeholder="Ej: Cambio de Aceite, Alineación, Frenos..."
        />
      </Field>

      {/* Precio Base */}
      <Field id="base_price" label="Precio Base (ARS)" required error={errors.base_price?.message}>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant">
            $
          </span>
          <Input
            type="number"
            id="base_price"
            step="0.01"
            min="0.01"
            {...register('base_price', {
              required: 'El precio base es requerido',
              min: {
                value: 0.01,
                message: 'El precio debe ser mayor a 0'
              },
              validate: (value) => {
                const price = parseFloat(value);
                return !isNaN(price) && price > 0 || 'Precio inválido';
              }
            })}
            error={!!errors.base_price}
            className="pl-8"
            placeholder="0.00"
          />
        </div>
      </Field>

      {/* Descripción: ancho completo */}
      <Field label="Descripción" error={errors.description?.message} className="md:col-span-2">
        <Textarea
          id="description"
          rows={3}
          {...register('description', {
            maxLength: {
              value: 1000,
              message: 'La descripción no puede exceder 1000 caracteres'
            }
          })}
          placeholder="Descripción detallada del servicio..."
        />
      </Field>
    </form>
  );
};

export default ServiceForm; 