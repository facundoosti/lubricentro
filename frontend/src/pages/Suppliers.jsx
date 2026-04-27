import { useCrudPage } from '@hooks/useCrudPage';
import { useModalError } from '@hooks/useModalError';
import PageHeader from '@ui/PageHeader';
import PageError from '@ui/PageError';
import SuppliersTable from '@components/features/suppliers/SuppliersTable';
import SupplierModal from '@components/features/suppliers/SupplierModal';
import ConfirmModal from '@ui/ConfirmModal';
import { useSuppliers, useDeleteSupplier } from '@services/suppliersService';
import { showSupplierSuccess } from '@services/notificationService';

const Suppliers = () => {
  const {
    currentPage, searchTerm, perPage,
    isModalOpen, selectedItem,
    isDeleteModalOpen, itemToDelete,
    handlePageChange, handleSearch,
    handleCreate, handleEdit, handleModalClose,
    handleDeleteRequest, handleDeleteModalClose,
  } = useCrudPage();

  const { handleError: handleDeleteError } = useModalError(handleDeleteModalClose);

  const { data: suppliersData, isLoading, error } = useSuppliers({
    page: currentPage,
    per_page: perPage,
    search: searchTerm,
  });

  const deleteMutation = useDeleteSupplier();

  const suppliers = suppliersData?.data?.suppliers || [];
  const pagination = suppliersData?.data?.pagination || {};

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      handleDeleteModalClose();
      showSupplierSuccess('DELETED');
    } catch (err) {
      handleDeleteError(err, 'Error al eliminar el proveedor');
    }
  };

  if (error) {
    return (
      <PageError
        title="Error al cargar proveedores"
        message={error.response?.data?.message || error.message}
      />
    );
  }

  return (
    <div className="p-6">
      <PageHeader title="Proveedores" description="Gestiona los proveedores del lubricentro" />

      <SuppliersTable
        suppliers={suppliers}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onCreate={handleCreate}
        loading={isLoading || deleteMutation.isPending}
      />

      <SupplierModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        supplier={selectedItem}
        onSuccess={handleModalClose}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Proveedor"
        message={`¿Estás seguro de que quieres eliminar el proveedor "${itemToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Suppliers;
