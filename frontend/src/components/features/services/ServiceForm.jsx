import React from 'react';
import { useForm } from 'react-hook-form';
import Button from '@ui/Button';

const ServiceForm = ({ 
  service = null, 
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Nombre */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Nombre del Servicio *
        </label>
        <input
          type="text"
          id="name"
          {...register('name', {
            required: 'El nombre es requerido',
            maxLength: {
              value: 100,
              message: 'El nombre no puede exceder 100 caracteres'
            }
          })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Ej: Cambio de Aceite, Alineación, Frenos..."
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Descripción */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descripción
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description', {
            maxLength: {
              value: 1000,
              message: 'La descripción no puede exceder 1000 caracteres'
            }
          })}
          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
            errors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Descripción detallada del servicio..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Precio Base */}
      <div>
        <label htmlFor="base_price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Precio Base (ARS) *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            $
          </span>
          <input
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
            className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
              errors.base_price ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
        </div>
        {errors.base_price && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.base_price.message}
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          onClick={onCancel}
          variant="outline"
          disabled={loading || isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading || isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {service ? 'Actualizando...' : 'Creando...'}
            </div>
          ) : (
            service ? 'Actualizar Servicio' : 'Crear Servicio'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ServiceForm; 