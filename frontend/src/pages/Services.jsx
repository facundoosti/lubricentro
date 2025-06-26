import React, { useState } from "react";
import ServicesTable from "@components/features/services/ServicesTable";
import ServiceModal from "@components/features/services/ServiceModal";
import { useServices, useDeleteService } from "@services/servicesService";
import { useNotificationService } from "@services/notificationService";

const Services = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [perPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  // Servicio de notificaciones
  const notification = useNotificationService();

  // Query para obtener servicios con paginación y búsqueda
  const {
    data: servicesData,
    isLoading,
    error
  } = useServices({
    page: currentPage,
    per_page: perPage,
    search: searchTerm,
  });

  // Mutation para eliminar servicios
  const deleteServiceMutation = useDeleteService();

  const services = servicesData?.data?.services || [];
  const pagination = servicesData?.data?.pagination || {};

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset a la primera página al buscar
  };

  const handleCreate = () => {
    setSelectedService(null);
    setIsModalOpen(true);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleView = (service) => {
    console.log("Ver servicio:", service);
    notification.showInfo(`Ver servicio: ${service.name}`);
  };

  const handleDelete = async (service) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el servicio ${service.name}?`)) {
      try {
        await deleteServiceMutation.mutateAsync(service.id);
        notification.showServiceSuccess('DELETED');
        // La invalidación del cache se maneja automáticamente en el servicio
      } catch (error) {
        console.error("Error al eliminar servicio:", error);
        const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
        notification.showServiceError('ERROR_DELETE', errorMessage);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const handleModalSuccess = () => {
    // El modal ya maneja el cierre y las notificaciones
    // Aquí podríamos agregar lógica adicional si es necesario
  };

  // Manejo de errores
  if (error) {
    console.error("Error loading services:", error);
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error al cargar servicios</h3>
          <p className="text-red-600 text-sm mt-1">
            {error.response?.data?.message || "Ocurrió un error inesperado"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Servicios
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestiona los servicios ofrecidos por el lubricentro
        </p>
      </div>

      <ServicesTable
        services={services}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onCreate={handleCreate}
        loading={isLoading}
      />

      {/* Modal para crear/editar servicios */}
      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        service={selectedService}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Services; 