import React from "react";
import Modal from "@/components/ui/Modal";
import CustomerForm from "./CustomerForm";

const CustomerModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false
}) => {
  const isEditing = !!initialData;
  const title = isEditing ? "Editar Cliente" : "Nuevo Cliente";

  const handleSubmit = (data) => {
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
      <CustomerForm
        onSubmit={handleSubmit}
        initialData={initialData}
        isLoading={isLoading}
        onCancel={handleCancel}
      />
    </Modal>
  );
};

export default CustomerModal; 