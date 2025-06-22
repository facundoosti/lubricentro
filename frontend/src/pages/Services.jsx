import React, { useState } from "react";
import { toast } from "react-hot-toast";
import ServicesTable from "@components/features/services/ServicesTable";
import ConfirmModal from "@ui/ConfirmModal";
import { useServices, useDeleteService } from "@services/servicesService";

const Services = () => {
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    search: "",
  });

  const [selectedService, setSelectedService] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Hooks de React Query
  const { data, isLoading, error } = useServices(filters);
  const deleteServiceMutation = useDeleteService();

  // Extraer datos de la respuesta
  const services = data?.data?.services || [];
  const pagination = data?.data?.pagination || {};

  // Handlers
  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
  };

  const handleCreate = () => {
    // TODO: Implementar modal de creación
    toast.success("Funcionalidad de creación en desarrollo");
  };

  const handleEdit = (service) => {
    // TODO: Implementar modal de edición
    toast.success(`Editar servicio: ${service.name}`);
  };

  const handleView = (service) => {
    // TODO: Implementar modal de vista
    toast.success(`Ver servicio: ${service.name}`);
  };

  const handleDelete = (service) => {
    setSelectedService(service);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedService) return;

    try {
      await deleteServiceMutation.mutateAsync(selectedService.id);
      toast.success("Servicio eliminado exitosamente");
      setShowDeleteModal(false);
      setSelectedService(null);
    } catch (error) {
      console.error("Error deleting service:", error);
      const errorMessage = error.response?.data?.message || "Error al eliminar el servicio";
      toast.error(errorMessage);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedService(null);
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

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="Eliminar Servicio"
        message={`¿Estás seguro de que quieres eliminar el servicio "${selectedService?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmColor="danger"
        loading={deleteServiceMutation.isPending}
      />
    </div>
  );
};

export default Services; 