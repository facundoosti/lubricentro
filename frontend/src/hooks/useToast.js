import { useToast as useToastContext } from '@contexts/ToastContext';

export const useToast = () => {
  return useToastContext();
}; 