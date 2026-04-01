import { Car } from 'lucide-react';
import SlideOver from '@ui/SlideOver';
import VehicleForm from '@components/features/vehicles/VehicleForm';
import { useCreateVehicle, useUpdateVehicle } from '@services/vehiclesService';
import { showSuccess, showError } from '@services/notificationService';

const FORM_ID = 'vehicle-form';

const VehicleModal = ({ isOpen, onClose, vehicle = null, customerId = null, onSuccess }) => {
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();

  const isEditing = !!vehicle;
  const isLoading = createVehicle.isPending || updateVehicle.isPending;

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
      if (onSuccess) onSuccess();
    } catch (error) {
      const msg = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Error al guardar el vehículo';
      showError(msg);
    }
  };

  return (
    <SlideOver
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Vehículo' : 'Nuevo Vehículo'}
      subtitle={isEditing ? `${vehicle.brand} ${vehicle.model} · ${vehicle.license_plate}` : 'Completa los datos del vehículo'}
      icon={Car}
      formId={FORM_ID}
      submitLabel={isEditing ? 'Guardar Cambios' : 'Crear Vehículo'}
      isLoading={isLoading}
    >
      <VehicleForm
        vehicle={vehicle}
        customerId={customerId}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        formId={FORM_ID}
      />
    </SlideOver>
  );
};

export default VehicleModal;
