import React from 'react';
import Modal from '@ui/Modal';
import ProductForm from '@components/features/products/ProductForm';
import { useCreateProduct, useUpdateProduct } from '@services/productsService';
import { useToast } from '@hooks/useToast';

const ProductModal = ({ 
  isOpen, 
  onClose, 
  product = null, 
  onSuccess 
}) => {
  const { showSuccess, showError } = useToast();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const isEditing = !!product;
  const title = isEditing ? 'Editar Producto' : 'Nuevo Producto';

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id: product.id, productData: data });
        showSuccess('Producto actualizado exitosamente');
      } else {
        await createProduct.mutateAsync(data);
        showSuccess('Producto creado exitosamente');
      }
      
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving product:', error);
      
      let errorMessage = 'Error al guardar el producto';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = Object.values(errors).flat().join(', ');
      }
      
      showError(errorMessage);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const isLoading = createProduct.isLoading || updateProduct.isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      size="lg"
    >
      <ProductForm
        product={product}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={isLoading}
      />
    </Modal>
  );
};

export default ProductModal; 