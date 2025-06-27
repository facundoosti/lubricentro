import React, { useState } from "react";
import CustomersTable from "@components/features/customers/CustomersTable";
import CustomerModal from "@components/features/customers/CustomerModal";
import ConfirmModal from "@components/ui/ConfirmModal";
import { useCustomers, useDeleteCustomer, useCreateCustomer, useUpdateCustomer } from "@services/customersService";
import { useNotificationService } from "@services/notificationService";
import { useModalError } from "@hooks/useModalError";

const Customers = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [perPage] = useState(10);
  
  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Servicio de notificaciones
  const notification = useNotificationService();

  // Hooks para manejo de errores en modales
  const { handleError: handleCreateError } = useModalError(() => setIsCreateModalOpen(false));
  const { handleError: handleEditError } = useModalError(() => {
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
  });
  const { handleError: handleDeleteError } = useModalError(() => {
    setIsDeleteModalOpen(false);
    setSelectedCustomer(null);
  });

  // Query para obtener clientes con paginación y búsqueda
  const {
    data: customersData,
    isLoading,
    error,
    refetch
  } = useCustomers({
    page: currentPage,
    per_page: perPage,
    search: searchTerm,
  });

  // Mutations
  const createCustomerMutation = useCreateCustomer();
  const updateCustomerMutation = useUpdateCustomer();
  const deleteCustomerMutation = useDeleteCustomer();

  const customers = customersData?.data?.customers || [];
  const pagination = customersData?.data?.pagination || {};

  // Debug logs para paginación
  console.log("Customers - customersData:", customersData);
  console.log("Customers - pagination object:", pagination);
  console.log("Customers - pagination.total_pages:", pagination.total_pages);
  console.log("Customers - pagination.current_page:", pagination.current_page);
  console.log("Customers - pagination.total_count:", pagination.total_count);
  console.log("Customers - pagination.per_page:", pagination.per_page);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset a la primera página al buscar
  };

  // Handlers para modales
  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    setIsEditModalOpen(true);
  };

  const handleDelete = (customer) => {
    setSelectedCustomer(customer);
    setIsDeleteModalOpen(true);
  };

  // Handlers para formularios
  const handleCreateSubmit = async (data) => {
    console.log("Customers - handleCreateSubmit called with data:", data);
    try {
      console.log("Customers - calling createCustomerMutation.mutateAsync");
      await createCustomerMutation.mutateAsync(data);
      console.log("Customers - createCustomerMutation.mutateAsync completed successfully");
      setIsCreateModalOpen(false);
      notification.showCustomerSuccess('CREATED');
    } catch (error) {
      handleCreateError(error, 'Error al crear el cliente');
    }
  };

  const handleEditSubmit = async (data) => {
    console.log("Customers - handleEditSubmit called with data:", data);
    try {
      await updateCustomerMutation.mutateAsync({ 
        id: selectedCustomer.id, 
        customerData: data 
      });
      setIsEditModalOpen(false);
      setSelectedCustomer(null);
      notification.showCustomerSuccess('UPDATED');
    } catch (error) {
      handleEditError(error, 'Error al actualizar el cliente');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteCustomerMutation.mutateAsync(selectedCustomer.id);
      setIsDeleteModalOpen(false);
      setSelectedCustomer(null);
      notification.showCustomerSuccess('DELETED');
    } catch (error) {
      handleDeleteError(error, 'Error al eliminar el cliente');
    }
  };

  // Cerrar modales
  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCustomer(null);
  };

  // Manejo de errores
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error al cargar clientes</h3>
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
          Clientes
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestiona los clientes del lubricentro
        </p>
      </div>

      {/* Tabla de clientes */}
      <CustomersTable
        customers={customers}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreate={handleCreate}
        loading={isLoading || deleteCustomerMutation.isPending}
      />

      {/* Modal para crear cliente */}
      <CustomerModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onSubmit={handleCreateSubmit}
        isLoading={createCustomerMutation.isPending}
      />

      {/* Modal para editar cliente */}
      <CustomerModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSubmit={handleEditSubmit}
        initialData={selectedCustomer}
        isLoading={updateCustomerMutation.isPending}
      />

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que quieres eliminar a ${selectedCustomer?.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteCustomerMutation.isPending}
      />
    </div>
  );
};

export default Customers; 