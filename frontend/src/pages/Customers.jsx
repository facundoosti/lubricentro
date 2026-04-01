import { useCrudPage } from '@hooks/useCrudPage';
import { useModalError } from '@hooks/useModalError';
import PageHeader from '@ui/PageHeader';
import PageError from '@ui/PageError';
import CustomersTable from '@components/features/customers/CustomersTable';
import CustomerModal from '@components/features/customers/CustomerModal';
import ConfirmModal from '@ui/ConfirmModal';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from '@services/customersService';
import { showCustomerSuccess } from '@services/notificationService';

const Customers = () => {
  const {
    currentPage, searchTerm, perPage,
    isModalOpen, selectedItem,
    isDeleteModalOpen, itemToDelete,
    handlePageChange, handleSearch,
    handleCreate, handleEdit, handleModalClose,
    handleDeleteRequest, handleDeleteModalClose,
  } = useCrudPage();

  const { handleError: handleFormError } = useModalError(handleModalClose);
  const { handleError: handleDeleteError } = useModalError(handleDeleteModalClose);

  const { data: customersData, isLoading, error, refetch } = useCustomers({
    page: currentPage,
    per_page: perPage,
    search: searchTerm,
  });

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const customers = customersData?.data?.customers || [];
  const pagination = customersData?.data?.pagination || {};

  const handleFormSubmit = async (data) => {
    try {
      if (selectedItem) {
        await updateMutation.mutateAsync({ id: selectedItem.id, customerData: data });
        showCustomerSuccess('UPDATED');
      } else {
        await createMutation.mutateAsync(data);
        showCustomerSuccess('CREATED');
      }
      handleModalClose();
    } catch (err) {
      handleFormError(err, selectedItem ? 'Error al actualizar el cliente' : 'Error al crear el cliente');
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      handleDeleteModalClose();
      showCustomerSuccess('DELETED');
    } catch (err) {
      handleDeleteError(err, 'Error al eliminar el cliente');
    }
  };

  if (error) {
    return (
      <PageError
        title="Error al cargar clientes"
        message={error.response?.data?.message || error.message}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="p-6">
      <PageHeader title="Clientes" description="Gestiona los clientes del lubricentro" />

      <CustomersTable
        customers={customers}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onCreate={handleCreate}
        loading={isLoading || deleteMutation.isPending}
      />

      <CustomerModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSubmit={handleFormSubmit}
        initialData={selectedItem}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Cliente"
        message={`¿Estás seguro de que quieres eliminar a ${itemToDelete?.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Customers;
