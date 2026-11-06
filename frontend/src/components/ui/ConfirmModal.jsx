import React from "react";
import Modal from '@ui/Modal';
import Button from '@ui/Button';
import { AlertTriangle } from "lucide-react";

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  message = "¿Está seguro de que desea realizar esta acción?",
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          icon: "text-error",
          button: "error"
        };
      case "warning":
        return {
          icon: "text-yellow-500",
          button: "warning"
        };
      default:
        return {
          icon: "text-on-surface-variant",
          button: "primary"
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      className="max-w-md"
    >
      <div className="text-center">
        <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high mb-4`}>
          <AlertTriangle className={`h-6 w-6 ${styles.icon}`} />
        </div>
        
        <h3 className="text-lg font-medium text-on-surface mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-on-surface-variant mb-6">
          {message}
        </p>
        
        <div className="flex justify-center space-x-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={styles.button}
            onClick={handleConfirm}
            loading={isLoading}
            disabled={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal; 