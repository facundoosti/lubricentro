import React, { useState } from "react";
import { toast } from "react-hot-toast";
import ProductsTable from "@components/features/products/ProductsTable";
import ConfirmModal from "@ui/ConfirmModal";
import { useProducts, useDeleteProduct } from "@services/productsService";

const Products = () => {
  const [filters, setFilters] = useState({
    page: 1,
    per_page: 10,
    search: "",
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Hooks de React Query
  const { data, isLoading, error } = useProducts(filters);
  const deleteProductMutation = useDeleteProduct();

  // Extraer datos de la respuesta
  const products = data?.data?.products || [];
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

  const handleEdit = (product) => {
    // TODO: Implementar modal de edición
    toast.success(`Editar producto: ${product.name}`);
  };

  const handleView = (product) => {
    // TODO: Implementar modal de vista
    toast.success(`Ver producto: ${product.name}`);
  };

  const handleDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProductMutation.mutateAsync(selectedProduct.id);
      toast.success("Producto eliminado exitosamente");
      setShowDeleteModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      const errorMessage = error.response?.data?.message || "Error al eliminar el producto";
      toast.error(errorMessage);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setSelectedProduct(null);
  };

  // Manejo de errores
  if (error) {
    console.error("Error loading products:", error);
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error al cargar productos</h3>
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
          Productos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestiona el catálogo de productos del lubricentro
        </p>
      </div>

      <ProductsTable
        products={products}
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
        title="Eliminar Producto"
        message={`¿Estás seguro de que quieres eliminar el producto "${selectedProduct?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmColor="danger"
        loading={deleteProductMutation.isPending}
      />
    </div>
  );
};

export default Products; 