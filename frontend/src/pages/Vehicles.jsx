import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VehiclesTable from "@components/features/vehicles/VehiclesTable";
import VehicleModal from "@components/features/vehicles/VehicleModal";
import { useVehicles, useDeleteVehicle } from "@services/vehiclesService";
import { useNotificationService } from "@services/notificationService";

const Vehicles = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [perPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Servicio de notificaciones
  const notification = useNotificationService();

  // Query para obtener vehículos con paginación y búsqueda
  const {
    data: vehiclesData,
    isLoading,
    error,
    refetch
  } = useVehicles({
    page: currentPage,
    per_page: perPage,
    search: searchTerm,
  });

  // Mutation para eliminar vehículos
  const deleteVehicleMutation = useDeleteVehicle();

  const vehicles = vehiclesData?.data?.vehicles || [];
  const pagination = vehiclesData?.data?.pagination || {};

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset a la primera página al buscar
  };

  const handleCreate = () => {
    setSelectedVehicle(null);
    setIsModalOpen(true);
  };

  const handleEdit = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalOpen(true);
  };

  const handleDelete = async (vehicle) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el vehículo ${vehicle.brand} ${vehicle.model}?`)) {
      try {
        await deleteVehicleMutation.mutateAsync(vehicle.id);
        notification.showVehicleSuccess('DELETED');
        // La invalidación del cache se maneja automáticamente en el servicio
      } catch (error) {
        console.error("Error al eliminar vehículo:", error);
        notification.showVehicleError('ERROR_DELETE', error.response?.data?.message || error.message);
      }
    }
  };

  const handleView = (vehicle) => {
    if (vehicle.customer_id) {
      navigate(`/customers/${vehicle.customer_id}`);
    } else {
      notification.showError("No se puede acceder al cliente: ID de cliente no disponible");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleModalSuccess = () => {
    // El modal ya maneja el cierre y las notificaciones
    // Aquí podríamos agregar lógica adicional si es necesario
  };

  // Manejo de errores
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error al cargar vehículos</h3>
          <p className="text-red-600 text-sm mt-1">
            {error.response?.data?.message || error.message || "Ocurrió un error inesperado"}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header de la página */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Vehículos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestiona los vehículos de los clientes
        </p>
      </div>

      {/* Tabla de vehículos */}
      <VehiclesTable
        vehicles={vehicles}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onCreate={handleCreate}
        loading={isLoading || deleteVehicleMutation.isPending}
      />

      {/* Modal para crear/editar vehículos */}
      <VehicleModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        vehicle={selectedVehicle}
        customerId={selectedVehicle?.customer_id}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Vehicles; 