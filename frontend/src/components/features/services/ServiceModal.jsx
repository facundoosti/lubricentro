import React from 'react';
import Modal from '@ui/Modal';
import ServiceForm from '@components/features/services/ServiceForm';
import { useCreateService, useUpdateService } from '@services/servicesService';
import { useToast } from '@hooks/useToast';

const ServiceModal = ({ 
  isOpen, 
  onClose, 
  service = null, 
  onSuccess 
}) => {
  const { showSuccess, showError } = useToast();
  const createService = useCreateService();
  const updateService = useUpdateService();

  const isEditing = !!service;
  const title = isEditing ? 'Editar Servicio' : 'Nuevo Servicio';

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateService.mutateAsync({ id: service.id, serviceData: data });
        showSuccess('Servicio actualizado exitosamente');
      } else {
        await createService.mutateAsync(data);
        showSuccess('Servicio creado exitosamente');
      }
      
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving service:', error);
      
      let errorMessage = 'Error al guardar el servicio';
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

  const isLoading = createService.isLoading || updateService.isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      size="lg"
    >
      <ServiceForm
        service={service}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={isLoading}
      />
    </Modal>
  );
};

export default ServiceModal; 