import React, { useState } from "react";
import VehiclesTable from "@components/features/vehicles/VehiclesTable";
import { useVehicles, useDeleteVehicle } from "@services/vehiclesService";

const Vehicles = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [perPage] = useState(10);

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
    console.log("Crear nuevo vehículo");
    alert("Función de crear vehículo - En desarrollo");
  };

  const handleEdit = (vehicle) => {
    console.log("Editar vehículo:", vehicle);
    alert(`Editar vehículo: ${vehicle.brand} ${vehicle.model} - En desarrollo`);
  };

  const handleDelete = async (vehicle) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el vehículo ${vehicle.brand} ${vehicle.model}?`)) {
      try {
        await deleteVehicleMutation.mutateAsync(vehicle.id);
        // La invalidación del cache se maneja automáticamente en el servicio
      } catch (error) {
        console.error("Error al eliminar vehículo:", error);
        alert(`Error al eliminar vehículo: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleView = (vehicle) => {
    console.log("Ver vehículo:", vehicle);
    alert(`Ver detalles de: ${vehicle.brand} ${vehicle.model} - En desarrollo`);
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
    </div>
  );
};

export default Vehicles; 