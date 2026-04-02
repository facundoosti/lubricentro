import { useCrudPage } from '@hooks/useCrudPage';
import { useModalError } from '@hooks/useModalError';
import PageHeader from '@ui/PageHeader';
import PageError from '@ui/PageError';
import ProductsTable from '@components/features/products/ProductsTable';
import ProductModal from '@components/features/products/ProductModal';
import ConfirmModal from '@ui/ConfirmModal';
import { useProducts, useDeleteProduct } from '@services/productsService';
import { showProductSuccess } from '@services/notificationService';

const Products = () => {
  const {
    currentPage, searchTerm, perPage,
    isModalOpen, selectedItem,
    isDeleteModalOpen, itemToDelete,
    handlePageChange, handleSearch,
    handleCreate, handleEdit, handleModalClose,
    handleDeleteRequest, handleDeleteModalClose,
  } = useCrudPage();

  const { handleError: handleDeleteError } = useModalError(handleDeleteModalClose);

  const { data: productsData, isLoading, error } = useProducts({
    page: currentPage,
    per_page: perPage,
    search: searchTerm,
  });

  const deleteMutation = useDeleteProduct();

  const products = productsData?.data?.products || [];
  const pagination = productsData?.data?.pagination || {};

  const handleDeleteConfirm = async () => {
    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      handleDeleteModalClose();
      showProductSuccess('DELETED');
    } catch (err) {
      handleDeleteError(err, 'Error al eliminar el producto');
    }
  };

  if (error) {
    return (
      <PageError
        title="Error al cargar productos"
        message={error.response?.data?.message || error.message}
      />
    );
  }

  return (
    <div id="tour-products-page" className="p-6">
      <PageHeader title="Productos" description="Gestiona el catálogo de productos del lubricentro" />

      <ProductsTable
        products={products}
        pagination={pagination}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onCreate={handleCreate}
        loading={isLoading || deleteMutation.isPending}
      />

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={selectedItem}
        onSuccess={handleModalClose}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Producto"
        message={`¿Estás seguro de que quieres eliminar el producto ${itemToDelete?.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default Products;
