import { useState } from 'react';
import { TrendingUp, FileSpreadsheet } from 'lucide-react';
import { useCrudPage } from '@hooks/useCrudPage';
import { useModalError } from '@hooks/useModalError';
import PageHeader from '@ui/PageHeader';
import PageError from '@ui/PageError';
import ProductsTable from '@components/features/products/ProductsTable';
import ProductModal from '@components/features/products/ProductModal';
import ProductImportModal from '@components/features/products/ProductImportModal';
import BulkPriceModal from '@components/features/products/BulkPriceModal';
import ConfirmModal from '@ui/ConfirmModal';
import { useProducts, useDeleteProduct } from '@services/productsService';
import { showProductSuccess } from '@services/notificationService';

const Products = () => {
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isBulkPriceOpen, setIsBulkPriceOpen] = useState(false);

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
      <PageHeader
        title="Productos"
        description="Gestiona el catálogo de productos del lubricentro"
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => setIsBulkPriceOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              Actualizar precios
            </button>
            <button
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Importar Excel
            </button>
          </div>
        }
      />

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

      <ProductImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
      />

      <BulkPriceModal
        isOpen={isBulkPriceOpen}
        onClose={() => setIsBulkPriceOpen(false)}
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
