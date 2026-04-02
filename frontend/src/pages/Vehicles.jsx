import { useNavigate } from 'react-router-dom';
import { useCrudPage } from '@hooks/useCrudPage';
import { useModalError } from '@hooks/useModalError';
import PageHeader from '@ui/PageHeader';
import PageError from '@ui/PageError';
import VehiclesTable from '@components/features/vehicles/VehiclesTable';
import VehicleModal from '@components/features/vehicles/VehicleModal';
import ConfirmModal from '@ui/ConfirmModal';
import { useVehicles, useDeleteVehicle } from '@services/vehiclesService';
import { showVehicleSuccess, showError } from '@services/notificationService';

const Vehicles = () => {
  const navigate = useNavigate();
  const {
    currentPage, searchTerm, perPage,
    isModalOpen, selectedItem,
    isDeleteModalOpen, itemToDelete,
    handlePageChange, handleSearch,
    handleCreate, handleEdit, handleModalClose,
    handleDeleteRequest, handleDeleteModalClose,
  } = useCrudPage();

  const { handleError: handleDeleteError } = useModalError(handleDeleteModalClose);

  const { data: vehiclesData, isLoading, error, refetch } = useVehicles({
    page: currentPage,
    per_page: perPage,
    search: searchTerm,
  });

  const deleteMutation = useDeleteVehicle();

  const vehicles = vehiclesData?.data?.vehicles || [];
  const pagination = vehiclesData?.data?.pagination || {};

  const handleView = (vehicle) => {
    if (vehicle.customer_id) {
      navigate(`/customers/${vehicle.customer_id}`);
    } else {
      showError('No se puede acceder al cliente: ID de cliente no disponible');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      handleDeleteModalClose();
      showVehicleSuccess('DELETED');
    } catch (err) {
      handleDeleteError(err, 'Error al eliminar el vehículo');
    }
  };

  if (error) {
    return (
      <PageError
        title="Error al cargar vehículos"
        message={error.response?.data?.message || error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <div id="tour-vehicles-page" className="p-6">
      <PageHeader title="Vehículos" description="Gestiona los vehículos de los clientes" />

      <VehiclesTable
        vehicles={vehicles}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onView={handleView}
        onCreate={handleCreate}
        loading={isLoading || deleteMutation.isPending}
      />

      <VehicleModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        vehicle={selectedItem}
        customerId={selectedItem?.customer_id}
        onSuccess={handleModalClose}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Vehículo"
        message={`¿Estás seguro de que quieres eliminar el vehículo ${itemToDelete?.brand} ${itemToDelete?.model}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Vehicles;
