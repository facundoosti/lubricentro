import { toast } from 'react-hot-toast';

export const useToast = () => {
  const showSuccess = (message, options = {}) => {
    return toast.success(message, {
      duration: 3000,
      ...options,
    });
  };

  const showError = (message, options = {}) => {
    return toast.error(message, {
      duration: 5000,
      ...options,
    });
  };

  const showInfo = (message, options = {}) => {
    return toast(message, {
      duration: 4000,
      icon: 'ℹ️',
      ...options,
    });
  };

  const showWarning = (message, options = {}) => {
    return toast(message, {
      duration: 4000,
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
      },
      ...options,
    });
  };

  const showLoading = (message, options = {}) => {
    return toast.loading(message, {
      duration: Infinity,
      ...options,
    });
  };

  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  const dismissAll = () => {
    toast.dismiss();
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    dismiss,
    dismissAll,
  };
}; 