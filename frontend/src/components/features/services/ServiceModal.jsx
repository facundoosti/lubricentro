import { Wrench } from 'lucide-react';
import SlideOver from '@ui/SlideOver';
import ServiceForm from '@components/features/services/ServiceForm';
import { useCreateService, useUpdateService } from '@services/servicesService';
import { showServiceSuccess, showServiceError, parseApiError } from '@services/notificationService';

const FORM_ID = 'service-form';

const ServiceModal = ({ isOpen, onClose, service = null, onSuccess }) => {
  const createService = useCreateService();
  const updateService = useUpdateService();

  const isEditing = !!service;
  const isLoading = createService.isPending || updateService.isPending;

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateService.mutateAsync({ id: service.id, serviceData: data });
        showServiceSuccess('UPDATED');
      } else {
        await createService.mutateAsync(data);
        showServiceSuccess('CREATED');
      }
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      const action = isEditing ? 'ERROR_UPDATE' : 'ERROR_CREATE';
      showServiceError(action, parseApiError(error));
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Servicio' : 'Nuevo Servicio'}
      subtitle={isEditing ? `ID: ${service.id}` : 'Completa los datos del servicio'}
      icon={Wrench}
      formId={FORM_ID}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Servicio'}
      isLoading={isLoading}
    >
      <ServiceForm service={service} onSubmit={handleSubmit} loading={isLoading} formId={FORM_ID} />
    </SlideOver>
  );
};

export default ServiceModal;
