import React from 'react';
import Modal from '@ui/Modal';
import VehicleForm from '@components/features/vehicles/VehicleForm';
import { useCreateVehicle, useUpdateVehicle } from '@services/vehiclesService';
import { useToast } from '@hooks/useToast';

const VehicleModal = ({ 
  isOpen, 
  onClose, 
  vehicle = null, 
  customerId = null,
  onSuccess 
}) => {
  const { showSuccess, showError } = useToast();
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();

  const isEditing = !!vehicle;
  const title = isEditing ? 'Editar Vehículo' : 'Nuevo Vehículo';

  const handleSubmit = async (data) => {
    try {
      if (isEditing) {
        await updateVehicle.mutateAsync({ id: vehicle.id, vehicleData: data });
        showSuccess('Vehículo actualizado exitosamente');
      } else {
        await createVehicle.mutateAsync(data);
        showSuccess('Vehículo creado exitosamente');
      }
      
      onClose();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error saving vehicle:', error);
      
      let errorMessage = 'Error al guardar el vehículo';
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

  const isLoading = createVehicle.isLoading || updateVehicle.isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      size="lg"
    >
      <VehicleForm
        vehicle={vehicle}
        customerId={customerId}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isLoading}
      />
    </Modal>
  );
};

export default VehicleModal; 