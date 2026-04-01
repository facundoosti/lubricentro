import React, { useState } from "react";
import { useForm } from "react-hook-form";
import ImageUpload from '@ui/ImageUpload';

const CustomerForm = ({
  onSubmit,
  initialData = null,
  isLoading = false,
  formId = 'customer-form',
}) => {
  const [avatarFile, setAvatarFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    defaultValues: initialData || {
      name: "",
      phone: "",
      email: "",
      address: ""
    }
  });

  const handleFormSubmit = (data) => {
    const payload = { ...data };
    if (avatarFile) payload.avatar = avatarFile;
    onSubmit(payload);
  };

  console.log("CustomerForm - errors:", errors);
  console.log("CustomerForm - isLoading:", isLoading);

  return (
    <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo *
          </label>
          <input
            {...register("name", { 
              required: "El nombre es requerido",
              minLength: {
                value: 2,
                message: "El nombre debe tener al menos 2 caracteres"
              }
            })}
            type="text"
            id="name"
            className="w-full h-11 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ingrese el nombre completo"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono *
          </label>
          <input
            {...register("phone", { 
              required: "El teléfono es requerido",
              pattern: {
                value: /^[+]?[0-9\s\-()]+$/,
                message: "Ingrese un teléfono válido"
              }
            })}
            type="text"
            id="phone"
            className="w-full h-11 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ingrese el teléfono"
          />
          {errors.phone && (
            <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            {...register("email", { 
              required: "El email es requerido",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Ingrese un email válido"
              }
            })}
            type="email"
            id="email"
            className="w-full h-11 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ingrese el email"
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Dirección *
          </label>
          <input
            {...register("address", { 
              required: "La dirección es requerida"
            })}
            type="text"
            id="address"
            className="w-full h-11 rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ingrese la dirección"
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-500">{errors.address.message}</p>
          )}
        </div>
      </div>

      {/* Avatar */}
      <ImageUpload
        label="Foto del Cliente"
        currentUrl={initialData?.avatar_url}
        onChange={setAvatarFile}
      />

    </form>
  );
};

export default CustomerForm; 