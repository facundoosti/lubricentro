import { sileo } from "sileo";

// Mensajes predefinidos por entidad
const MESSAGES = {
  CUSTOMER: {
    CREATED: "Cliente creado exitosamente",
    UPDATED: "Cliente actualizado exitosamente",
    DELETED: "Cliente eliminado exitosamente",
    ERROR_CREATE: "Error al crear el cliente",
    ERROR_UPDATE: "Error al actualizar el cliente",
    ERROR_DELETE: "Error al eliminar el cliente",
  },
  VEHICLE: {
    CREATED: "Vehículo creado exitosamente",
    UPDATED: "Vehículo actualizado exitosamente",
    DELETED: "Vehículo eliminado exitosamente",
    ERROR_CREATE: "Error al crear el vehículo",
    ERROR_UPDATE: "Error al actualizar el vehículo",
    ERROR_DELETE: "Error al eliminar el vehículo",
  },
  PRODUCT: {
    CREATED: "Producto creado exitosamente",
    UPDATED: "Producto actualizado exitosamente",
    DELETED: "Producto eliminado exitosamente",
    ERROR_CREATE: "Error al crear el producto",
    ERROR_UPDATE: "Error al actualizar el producto",
    ERROR_DELETE: "Error al eliminar el producto",
  },
  SERVICE: {
    CREATED: "Servicio creado exitosamente",
    UPDATED: "Servicio actualizado exitosamente",
    DELETED: "Servicio eliminado exitosamente",
    ERROR_CREATE: "Error al crear el servicio",
    ERROR_UPDATE: "Error al actualizar el servicio",
    ERROR_DELETE: "Error al eliminar el servicio",
  },
  APPOINTMENT: {
    CREATED: "Turno creado exitosamente",
    UPDATED: "Turno actualizado exitosamente",
    DELETED: "Turno eliminado exitosamente",
    ERROR_CREATE: "Error al crear el turno",
    ERROR_UPDATE: "Error al actualizar el turno",
    ERROR_DELETE: "Error al eliminar el turno",
  },
  SERVICE_RECORD: {
    CREATED: "Atención registrada exitosamente",
    UPDATED: "Atención actualizada exitosamente",
    DELETED: "Atención eliminada exitosamente",
    ERROR_CREATE: "Error al registrar la atención",
    ERROR_UPDATE: "Error al actualizar la atención",
    ERROR_DELETE: "Error al eliminar la atención",
  },
  PRESUPUESTO: {
    CREATED: "Presupuesto creado exitosamente",
    UPDATED: "Presupuesto actualizado exitosamente",
    DELETED: "Presupuesto eliminado exitosamente",
    ERROR_CREATE: "Error al crear el budget",
    ERROR_UPDATE: "Error al actualizar el budget",
    ERROR_DELETE: "Error al eliminar el budget",
  },
  AUTH: {
    LOGIN_SUCCESS: "Inicio de sesión exitoso",
    LOGOUT_SUCCESS: "Sesión cerrada exitosamente",
    LOGIN_ERROR: "Error en el inicio de sesión",
    TOKEN_EXPIRED: "Sesión expirada, por favor inicia sesión nuevamente",
  },
};

// Extrae el mensaje de error de una respuesta de API de Rails
export const parseApiError = (error, fallback = 'Ocurrió un error inesperado') => {
  const data = error?.response?.data;
  if (data?.errors) {
    return Object.values(data.errors).flat().join(', ');
  }
  return data?.message || error?.message || fallback;
};

// Primitivas base
export const showSuccess = (title, description) =>
  sileo.success({ title, ...(description && { description }) });

export const showError = (title, description) =>
  sileo.error({ title, ...(description && { description }) });

export const showWarning = (title, description) =>
  sileo.warning({ title, ...(description && { description }) });

export const showInfo = (title) => sileo.info({ title });

// Helpers por entidad
export const showCustomerSuccess = (action) =>
  showSuccess(MESSAGES.CUSTOMER[action]);
export const showCustomerError = (action, detail) =>
  showError(MESSAGES.CUSTOMER[action], detail);

export const showVehicleSuccess = (action) =>
  showSuccess(MESSAGES.VEHICLE[action]);
export const showVehicleError = (action, detail) =>
  showError(MESSAGES.VEHICLE[action], detail);

export const showProductSuccess = (action) =>
  showSuccess(MESSAGES.PRODUCT[action]);
export const showProductError = (action, detail) =>
  showError(MESSAGES.PRODUCT[action], detail);

export const showServiceSuccess = (action) =>
  showSuccess(MESSAGES.SERVICE[action]);
export const showServiceError = (action, detail) =>
  showError(MESSAGES.SERVICE[action], detail);

export const showAppointmentSuccess = (action) =>
  showSuccess(MESSAGES.APPOINTMENT[action]);
export const showAppointmentError = (action, detail) =>
  showError(MESSAGES.APPOINTMENT[action], detail);

export const showServiceRecordSuccess = (action) =>
  showSuccess(MESSAGES.SERVICE_RECORD[action]);
export const showServiceRecordError = (action, detail) =>
  showError(MESSAGES.SERVICE_RECORD[action], detail);

export const showBudgetSuccess = (action) =>
  showSuccess(MESSAGES.PRESUPUESTO[action]);
export const showBudgetError = (action, detail) =>
  showError(MESSAGES.PRESUPUESTO[action], detail);

export const showAuthSuccess = (action) => showSuccess(MESSAGES.AUTH[action]);
export const showAuthError = (action, detail) =>
  showError(MESSAGES.AUTH[action], detail);
