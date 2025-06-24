import React from "react";
import Modal from "@ui/Modal";
import VehicleForm from "@components/features/vehicles/VehicleForm";

const VehicleModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
  customerId = null
}) => {
  const isEditing = !!initialData;
  const title = isEditing ? "Editar Vehículo" : "Nuevo Vehículo";

  const handleSubmit = (data) => {
    // Si estamos creando un vehículo y tenemos customerId, lo agregamos
    if (!isEditing && customerId) {
      data.customer_id = customerId;
    }
    onSubmit(data);
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="max-w-4xl"
    >
      <VehicleForm
        onSubmit={handleSubmit}
        initialData={initialData}
        isLoading={isLoading}
        onCancel={handleCancel}
        customerId={customerId}
      />
    </Modal>
  );
};

export default VehicleModal; 