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
    ERROR_CREATE: 'Error al crear el turno',
    ERROR_UPDATE: 'Error al actualizar el turno',
    ERROR_DELETE: 'Error al eliminar el turno',
    ERROR_LOAD: 'Error al cargar los turnos',
  },
  
  // Atenciones
  SERVICE_RECORD: {
    CREATED: 'Atención registrada exitosamente',
    UPDATED: 'Atención actualizada exitosamente',
    DELETED: 'Atención eliminada exitosamente',
    ERROR_CREATE: 'Error al registrar la atención',
    ERROR_UPDATE: 'Error al actualizar la atención',
    ERROR_DELETE: 'Error al eliminar la atención',
    ERROR_LOAD: 'Error al cargar las atenciones',
  },
  
  // Autenticación
  AUTH: {
    LOGIN_SUCCESS: 'Inicio de sesión exitoso',
    LOGOUT_SUCCESS: 'Sesión cerrada exitosamente',
    LOGIN_ERROR: 'Error en el inicio de sesión',
    TOKEN_EXPIRED: 'Sesión expirada, por favor inicia sesión nuevamente',
  },
  
  // General
  GENERAL: {
    NETWORK_ERROR: 'Error de conexión, verifica tu internet',
    UNKNOWN_ERROR: 'Ocurrió un error inesperado',
    SAVE_SUCCESS: 'Guardado exitosamente',
    DELETE_SUCCESS: 'Eliminado exitosamente',
    UPDATE_SUCCESS: 'Actualizado exitosamente',
  }
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

  const showAuthSuccess = (action) => {
    const message = NOTIFICATION_MESSAGES.AUTH[action];
    return showSuccess(message);
  };

  const showAuthError = (action, error = null) => {
    const baseMessage = NOTIFICATION_MESSAGES.AUTH[action];
    const message = error ? `${baseMessage}: ${error}` : baseMessage;
    return showError(message);
  };

  const showGeneralSuccess = (action) => {
    const message = NOTIFICATION_MESSAGES.GENERAL[action];
    return showSuccess(message);
  };

  const showGeneralError = (action, error = null) => {
    const baseMessage = NOTIFICATION_MESSAGES.GENERAL[action];
    const message = error ? `${baseMessage}: ${error}` : baseMessage;
    return showError(message);
  };

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    dismiss,
    dismissAll,
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
    showAuthSuccess,
    showAuthError,
    showGeneralSuccess,
    showGeneralError,
  };
}; 