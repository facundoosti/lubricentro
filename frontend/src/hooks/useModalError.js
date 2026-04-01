import { useCallback } from 'react';
import { showError, parseApiError } from '@services/notificationService';

export const useModalError = (onCloseModal) => {
  const handleError = useCallback((error, title = 'Ocurrió un error inesperado') => {
    const detail = parseApiError(error);
    const isSameAsTitle = detail === title;
    showError(title, isSameAsTitle ? undefined : detail);

    if (onCloseModal) {
      onCloseModal();
    }
  }, [onCloseModal]);

  return { handleError };
};
