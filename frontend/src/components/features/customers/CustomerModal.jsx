import { Users } from 'lucide-react';
import SlideOver from '@ui/SlideOver';
import CustomerForm from '@components/features/customers/CustomerForm';

const CustomerModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
  formId = 'customer-form',
}) => {
  // initialData sin id = alta con datos prellenados (p. ej. el nombre buscado)
  const isEditing = !!initialData?.id;

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
      subtitle={isEditing ? initialData.name : 'Completa los datos del cliente'}
      icon={Users}
      formId={formId}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Cliente'}
      isLoading={isLoading}
    >
      <CustomerForm onSubmit={onSubmit} initialData={initialData} formId={formId} />
    </SlideOver>
  );
};

export default CustomerModal;
