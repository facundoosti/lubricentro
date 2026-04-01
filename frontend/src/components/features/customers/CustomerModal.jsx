import { Users } from 'lucide-react';
import SlideOver from '@ui/SlideOver';
import CustomerForm from './CustomerForm';

const FORM_ID = 'customer-form';

const CustomerModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const isEditing = !!initialData;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
      subtitle={isEditing ? initialData.name : 'Completa los datos del cliente'}
      icon={Users}
      formId={FORM_ID}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Cliente'}
      isLoading={isLoading}
    >
      <CustomerForm
        onSubmit={onSubmit}
        initialData={initialData}
        isLoading={isLoading}
        formId={FORM_ID}
      />
    </SlideOver>
  );
};

export default CustomerModal;
