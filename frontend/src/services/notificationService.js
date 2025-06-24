import { useToast } from '@hooks/useToast';

// Mensajes predefinidos para diferentes acciones
export const NOTIFICATION_MESSAGES = {
  // Clientes
  CUSTOMER: {
    CREATED: 'Cliente creado exitosamente',
    UPDATED: 'Cliente actualizado exitosamente',
    DELETED: 'Cliente eliminado exitosamente',
    ERROR_CREATE: 'Error al crear el cliente',
    ERROR_UPDATE: 'Error al actualizar el cliente',
    ERROR_DELETE: 'Error al eliminar el cliente',
    ERROR_LOAD: 'Error al cargar los clientes',
  },
  
  // Vehículos
  VEHICLE: {
    CREATED: 'Vehículo creado exitosamente',
    UPDATED: 'Vehículo actualizado exitosamente',
    DELETED: 'Vehículo eliminado exitosamente',
    ERROR_CREATE: 'Error al crear el vehículo',
    ERROR_UPDATE: 'Error al actualizar el vehículo',
    ERROR_DELETE: 'Error al eliminar el vehículo',
    ERROR_LOAD: 'Error al cargar los vehículos',
  },
  
  // Productos
  PRODUCT: {
    CREATED: 'Producto creado exitosamente',
    UPDATED: 'Producto actualizado exitosamente',
    DELETED: 'Producto eliminado exitosamente',
    ERROR_CREATE: 'Error al crear el producto',
    ERROR_UPDATE: 'Error al actualizar el producto',
    ERROR_DELETE: 'Error al eliminar el producto',
    ERROR_LOAD: 'Error al cargar los productos',
  },
  
  // Servicios
  SERVICE: {
    CREATED: 'Servicio creado exitosamente',
    UPDATED: 'Servicio actualizado exitosamente',
    DELETED: 'Servicio eliminado exitosamente',
    ERROR_CREATE: 'Error al crear el servicio',
    ERROR_UPDATE: 'Error al actualizar el servicio',
    ERROR_DELETE: 'Error al eliminar el servicio',
    ERROR_LOAD: 'Error al cargar los servicios',
  },
  
  // Turnos
  APPOINTMENT: {
    CREATED: 'Turno creado exitosamente',
    UPDATED: 'Turno actualizado exitosamente',
    DELETED: 'Turno eliminado exitosamente',
    CONFIRMED: 'Turno confirmado exitosamente',
    COMPLETED: 'Turno completado exitosamente',
    CANCELLED: 'Turno cancelado exitosamente',
    ERROR_CREATE: 'Error al crear el turno',
    ERROR_UPDATE: 'Error al actualizar el turno',
    ERROR_DELETE: 'Error al eliminar el turno',
    ERROR_LOAD: 'Error al cargar los turnos',
  },
  
  // Atenciones
  SERVICE_RECORD: {
    CREATED: 'Atención creada exitosamente',
    UPDATED: 'Atención actualizada exitosamente',
    DELETED: 'Atención eliminada exitosamente',
    ERROR_CREATE: 'Error al crear la atención',
    ERROR_UPDATE: 'Error al actualizar la atención',
    ERROR_DELETE: 'Error al eliminar la atención',
    ERROR_LOAD: 'Error al cargar las atenciones',
  },
  
  // Generales
  GENERAL: {
    LOADING: 'Cargando...',
    SAVING: 'Guardando...',
    DELETING: 'Eliminando...',
    ERROR_NETWORK: 'Error de conexión. Verifica tu internet.',
    ERROR_UNKNOWN: 'Ocurrió un error inesperado',
    SUCCESS_OPERATION: 'Operación completada exitosamente',
    WARNING_OPERATION: 'Operación completada con advertencias',
  },
};

// Hook personalizado para usar el servicio de notificaciones
export const useNotificationService = () => {
  const toast = useToast();

  const showSuccess = (message, options = {}) => {
    return toast.showSuccess(message, options);
  };

  const showError = (message, options = {}) => {
    return toast.showError(message, options);
  };

  const showInfo = (message, options = {}) => {
    return toast.showInfo(message, options);
  };

  const showWarning = (message, options = {}) => {
    return toast.showWarning(message, options);
  };

  const showLoading = (message, options = {}) => {
    return toast.showLoading(message, options);
  };

  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  const dismissAll = () => {
    toast.dismissAll();
  };

  // Funciones específicas para entidades
  const showCustomerSuccess = (action) => {
    const message = NOTIFICATION_MESSAGES.CUSTOMER[action];
    return showSuccess(message);
  };

  const showCustomerError = (action, error = null) => {
    const baseMessage = NOTIFICATION_MESSAGES.CUSTOMER[action];
    const message = error ? `${baseMessage}: ${error}` : baseMessage;
    return showError(message);
  };

  const showVehicleSuccess = (action) => {
    const message = NOTIFICATION_MESSAGES.VEHICLE[action];
    return showSuccess(message);
  };

  const showVehicleError = (action, error = null) => {
    const baseMessage = NOTIFICATION_MESSAGES.VEHICLE[action];
    const message = error ? `${baseMessage}: ${error}` : baseMessage;
    return showError(message);
  };

  const showProductSuccess = (action) => {
    const message = NOTIFICATION_MESSAGES.PRODUCT[action];
    return showSuccess(message);
  };

  const showProductError = (action, error = null) => {
    const baseMessage = NOTIFICATION_MESSAGES.PRODUCT[action];
    const message = error ? `${baseMessage}: ${error}` : baseMessage;
    return showError(message);
  };

  const showServiceSuccess = (action) => {
    const message = NOTIFICATION_MESSAGES.SERVICE[action];
    return showSuccess(message);
  };

  const showServiceError = (action, error = null) => {
    const baseMessage = NOTIFICATION_MESSAGES.SERVICE[action];
    const message = error ? `${baseMessage}: ${error}` : baseMessage;
    return showError(message);
  };

  const showAppointmentSuccess = (action) => {
    const message = NOTIFICATION_MESSAGES.APPOINTMENT[action];
    return showSuccess(message);
  };

  const showAppointmentError = (action, error = null) => {
    const baseMessage = NOTIFICATION_MESSAGES.APPOINTMENT[action];
    const message = error ? `${baseMessage}: ${error}` : baseMessage;
    return showError(message);
  };

  const showServiceRecordSuccess = (action) => {
    const message = NOTIFICATION_MESSAGES.SERVICE_RECORD[action];
    return showSuccess(message);
  };

  const showServiceRecordError = (action, error = null) => {
    const baseMessage = NOTIFICATION_MESSAGES.SERVICE_RECORD[action];
    const message = error ? `${baseMessage}: ${error}` : baseMessage;
    return showError(message);
  };

  // Función para manejar errores de API de manera consistente
  const handleApiError = (error, defaultMessage = 'Error de operación') => {
    console.error('API Error:', error);
    
    let message = defaultMessage;
    
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.errors) {
      // Si hay múltiples errores, mostrar el primero
      const errors = error.response.data.errors;
      if (Array.isArray(errors)) {
        message = errors[0];
      } else if (typeof errors === 'object') {
        const firstError = Object.values(errors)[0];
        message = Array.isArray(firstError) ? firstError[0] : firstError;
      }
    } else if (error.message) {
      message = error.message;
    }
    
    return showError(message);
  };

  return {
    // Funciones básicas
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    dismiss,
    dismissAll,
    
    // Funciones específicas por entidad
    showCustomerSuccess,
    showCustomerError,
    showVehicleSuccess,
    showVehicleError,
    showProductSuccess,
    showProductError,
    showServiceSuccess,
    showServiceError,
    showAppointmentSuccess,
    showAppointmentError,
    showServiceRecordSuccess,
    showServiceRecordError,
    
    // Función para manejar errores de API
    handleApiError,
    
    // Mensajes predefinidos
    messages: NOTIFICATION_MESSAGES,
  };
}; 