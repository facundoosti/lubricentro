import { Truck } from 'lucide-react';
import SlideOver from '@ui/SlideOver';
import SupplierForm from '@components/features/suppliers/SupplierForm';
import { useCreateSupplier, useUpdateSupplier } from '@services/suppliersService';
import { showSupplierSuccess, showSupplierError, parseApiError } from '@services/notificationService';

const FORM_ID = 'supplier-form';

const SupplierModal = ({ isOpen, onClose, supplier = null, onSuccess }) => {
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const isEditing = !!supplier;
  const isLoading = createSupplier.isPending || updateSupplier.isPending;

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateSupplier.mutateAsync({ id: supplier.id, data });
        showSupplierSuccess('UPDATED');
      } else {
        await createSupplier.mutateAsync(data);
        showSupplierSuccess('CREATED');
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      const action = isEditing ? 'ERROR_UPDATE' : 'ERROR_CREATE';
      showSupplierError(action, parseApiError(error));
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      subtitle={isEditing ? supplier.name : 'Completa los datos del proveedor'}
      icon={Truck}
      formId={FORM_ID}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Proveedor'}
      isLoading={isLoading}
    >
      <SupplierForm supplier={supplier} onSubmit={handleSubmit} formId={FORM_ID} />
    </SlideOver>
  );
};

export default SupplierModal;
