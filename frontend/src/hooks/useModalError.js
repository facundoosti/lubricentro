import { useCallback } from 'react';
import { useToast } from '@hooks/useToast';

export const useModalError = (onCloseModal) => {
  const toast = useToast();

  const handleError = useCallback((error, customMessage = null) => {
    console.error('Modal error:', error);
    
    // Mostrar toast de error
    const errorMessage = customMessage || 
      error.response?.data?.message || 
      error.message || 
      'Ocurrió un error inesperado';
    
    toast.showError(errorMessage);
    
    // Cerrar el modal automáticamente
    if (onCloseModal) {
      onCloseModal();
    }
  }, [toast, onCloseModal]);

  return { handleError };
}; 