import { Package } from 'lucide-react';
import SlideOver from '@ui/SlideOver';
import ProductForm from '@components/features/products/ProductForm';
import { useCreateProduct, useUpdateProduct } from '@services/productsService';
import { showProductSuccess, showProductError, parseApiError } from '@services/notificationService';

const FORM_ID = 'product-form';

const ProductModal = ({ isOpen, onClose, product = null, onSuccess }) => {
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const isEditing = !!product;
  const isLoading = createProduct.isPending || updateProduct.isPending;

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id: product.id, productData: data });
        showProductSuccess('UPDATED');
      } else {
        await createProduct.mutateAsync(data);
        showProductSuccess('CREATED');
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      const action = isEditing ? 'ERROR_UPDATE' : 'ERROR_CREATE';
      showProductError(action, parseApiError(error));
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      subtitle={isEditing ? `ID: ${product.id}` : 'Completa los datos del producto'}
      icon={Package}
      formId={FORM_ID}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Producto'}
      isLoading={isLoading}
    >
      <ProductForm product={product} onSubmit={handleSubmit} loading={isLoading} formId={FORM_ID} />
    </SlideOver>
  );
};

export default ProductModal;
