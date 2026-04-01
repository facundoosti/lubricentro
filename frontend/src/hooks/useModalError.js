import { useCallback } from 'react';
import { showError } from '@services/notificationService';

export const useModalError = (onCloseModal) => {
  const handleError = useCallback((error, customMessage = null) => {
    const message = customMessage ||
      error.response?.data?.message ||
      error.message ||
      'Ocurrió un error inesperado';

    showError(message);

    if (onCloseModal) {
      onCloseModal();
    }
  }, [onCloseModal]);

  return { handleError };
};
