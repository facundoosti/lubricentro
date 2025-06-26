import React, { useState } from "react";
import ProductsTable from "@components/features/products/ProductsTable";
import ProductModal from "@components/features/products/ProductModal";
import { useProducts, useDeleteProduct } from "@services/productsService";
import { useNotificationService } from "@services/notificationService";

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [perPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Servicio de notificaciones
  const notification = useNotificationService();

  // Query para obtener productos con paginación y búsqueda
  const {
    data: productsData,
    isLoading,
    error
  } = useProducts({
    page: currentPage,
    per_page: perPage,
    search: searchTerm,
  });

  // Mutation para eliminar productos
  const deleteProductMutation = useDeleteProduct();

  const products = productsData?.data?.products || [];
  const pagination = productsData?.data?.pagination || {};

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Reset a la primera página al buscar
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleView = (product) => {
    console.log("Ver producto:", product);
    notification.showInfo(`Ver producto: ${product.name}`);
  };

  const handleDelete = async (product) => {
    if (confirm(`¿Estás seguro de que quieres eliminar el producto ${product.name}?`)) {
      try {
        await deleteProductMutation.mutateAsync(product.id);
        notification.showProductSuccess('DELETED');
        // La invalidación del cache se maneja automáticamente en el servicio
      } catch (error) {
        console.error("Error al eliminar producto:", error);
        const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
        notification.showProductError('ERROR_DELETE', errorMessage);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleModalSuccess = () => {
    // El modal ya maneja el cierre y las notificaciones
    // Aquí podríamos agregar lógica adicional si es necesario
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

      {/* Modal para crear/editar productos */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={selectedProduct}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
};

export default Products; 