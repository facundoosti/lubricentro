import React from "react";
import { Edit, Phone, Mail, MapPin, User } from "lucide-react";

const CustomerInfoCard = ({ customer, onEdit }) => {
  const handleEdit = () => {
    if (onEdit) {
      onEdit();
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
            Información de Contacto
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Nombre Completo
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {customer.name}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                ID de Cliente
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                #{customer.id}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {customer.email || "No especificado"}
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Teléfono
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {customer.phone || "No especificado"}
              </p>
            </div>

            <div className="lg:col-span-2">
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Dirección
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                {customer.address || "No especificada"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleEdit}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <Edit className="w-4 h-4" />
          Editar
        </button>
      </div>
    </div>
  );
};

export default CustomerInfoCard; 