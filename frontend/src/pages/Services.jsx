import { useCrudPage } from '@hooks/useCrudPage';
import { useModalError } from '@hooks/useModalError';
import PageHeader from '@ui/PageHeader';
import PageError from '@ui/PageError';
import ServicesTable from '@components/features/services/ServicesTable';
import ServiceModal from '@components/features/services/ServiceModal';
import ConfirmModal from '@ui/ConfirmModal';
import { useServices, useDeleteService } from '@services/servicesService';
import { showServiceSuccess } from '@services/notificationService';

const Services = () => {
  const {
    currentPage, searchTerm, perPage,
    isModalOpen, selectedItem,
    isDeleteModalOpen, itemToDelete,
    handlePageChange, handleSearch,
    handleCreate, handleEdit, handleModalClose,
    handleDeleteRequest, handleDeleteModalClose,
  } = useCrudPage();

  const { handleError: handleDeleteError } = useModalError(handleDeleteModalClose);

  const { data: servicesData, isLoading, error } = useServices({
    page: currentPage,
    per_page: perPage,
    search: searchTerm,
  });

  const deleteMutation = useDeleteService();

  const services = servicesData?.data?.services || [];
  const pagination = servicesData?.data?.pagination || {};

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      handleDeleteModalClose();
      showServiceSuccess('DELETED');
    } catch (err) {
      handleDeleteError(err, 'Error al eliminar el servicio');
    }
  };

  if (error) {
    return (
      <PageError
        title="Error al cargar servicios"
        message={error.response?.data?.message || error.message}
      />
    );
  }

  return (
    <div className="p-6">
      <PageHeader title="Servicios" description="Gestiona los servicios ofrecidos por el lubricentro" />

      <ServicesTable
        services={services}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onCreate={handleCreate}
        loading={isLoading || deleteMutation.isPending}
      />

      <ServiceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        service={selectedItem}
        onSuccess={handleModalClose}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Servicio"
        message={`¿Estás seguro de que quieres eliminar el servicio ${itemToDelete?.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Services;
