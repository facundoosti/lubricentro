import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock sileo antes de importar el servicio
vi.mock('sileo', () => ({
  sileo: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}))

import { sileo } from 'sileo'
import {
  parseApiError,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showCustomerSuccess,
  showCustomerError,
  showVehicleSuccess,
  showVehicleError,
  showProductSuccess,
  showProductError,
  showServiceSuccess,
  showServiceError,
  showBudgetSuccess,
  showBudgetError,
  showServiceRecordSuccess,
  showServiceRecordError,
  showAuthSuccess,
  showAuthError,
} from '@services/notificationService'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('parseApiError', () => {
  it('extracts errors object from Rails response', () => {
    const error = { response: { data: { errors: { name: ['no puede estar vacío'], email: ['ya existe'] } } } }
    expect(parseApiError(error)).toBe('no puede estar vacío, ya existe')
  })

  it('extracts message from response data', () => {
    const error = { response: { data: { message: 'Registro no encontrado' } } }
    expect(parseApiError(error)).toBe('Registro no encontrado')
  })

  it('extracts message from error directly', () => {
    const error = { message: 'Network Error' }
    expect(parseApiError(error)).toBe('Network Error')
  })

  it('returns fallback when no recognizable error structure', () => {
    expect(parseApiError({})).toBe('Ocurrió un error inesperado')
  })

  it('returns custom fallback when provided', () => {
    expect(parseApiError({}, 'Error personalizado')).toBe('Error personalizado')
  })

  it('handles null error gracefully', () => {
    expect(parseApiError(null)).toBe('Ocurrió un error inesperado')
  })
})

describe('base notification primitives', () => {
  it('showSuccess calls sileo.success with title', () => {
    showSuccess('Operación exitosa')
    expect(sileo.success).toHaveBeenCalledWith({ title: 'Operación exitosa' })
  })

  it('showSuccess includes description when provided', () => {
    showSuccess('Éxito', 'Detalle adicional')
    expect(sileo.success).toHaveBeenCalledWith({ title: 'Éxito', description: 'Detalle adicional' })
  })

  it('showError calls sileo.error with title', () => {
    showError('Ocurrió un error')
    expect(sileo.error).toHaveBeenCalledWith({ title: 'Ocurrió un error' })
  })

  it('showError includes description when provided', () => {
    showError('Error', 'El campo es requerido')
    expect(sileo.error).toHaveBeenCalledWith({ title: 'Error', description: 'El campo es requerido' })
  })

  it('showWarning calls sileo.warning', () => {
    showWarning('Advertencia')
    expect(sileo.warning).toHaveBeenCalledWith({ title: 'Advertencia' })
  })

  it('showInfo calls sileo.info', () => {
    showInfo('Información')
    expect(sileo.info).toHaveBeenCalledWith({ title: 'Información' })
  })
})

describe('entity helpers — Customers', () => {
  it('showCustomerSuccess CREATED calls sileo.success', () => {
    showCustomerSuccess('CREATED')
    expect(sileo.success).toHaveBeenCalledWith({ title: 'Cliente creado exitosamente' })
  })

  it('showCustomerSuccess UPDATED calls sileo.success', () => {
    showCustomerSuccess('UPDATED')
    expect(sileo.success).toHaveBeenCalledWith({ title: 'Cliente actualizado exitosamente' })
  })

  it('showCustomerSuccess DELETED calls sileo.success', () => {
    showCustomerSuccess('DELETED')
    expect(sileo.success).toHaveBeenCalledWith({ title: 'Cliente eliminado exitosamente' })
  })

  it('showCustomerError ERROR_CREATE calls sileo.error', () => {
    showCustomerError('ERROR_CREATE')
    expect(sileo.error).toHaveBeenCalledWith({ title: 'Error al crear el cliente' })
  })

  it('showCustomerError with detail includes description', () => {
    showCustomerError('ERROR_CREATE', 'El teléfono es requerido')
    expect(sileo.error).toHaveBeenCalledWith({
      title: 'Error al crear el cliente',
      description: 'El teléfono es requerido',
    })
  })
})

describe('entity helpers — Vehicles', () => {
  it('showVehicleSuccess CREATED calls sileo.success', () => {
    showVehicleSuccess('CREATED')
    expect(sileo.success).toHaveBeenCalledWith({ title: 'Vehículo creado exitosamente' })
  })

  it('showVehicleError ERROR_DELETE calls sileo.error', () => {
    showVehicleError('ERROR_DELETE')
    expect(sileo.error).toHaveBeenCalledWith({ title: 'Error al eliminar el vehículo' })
  })
})

describe('entity helpers — Products', () => {
  it('showProductSuccess UPDATED calls sileo.success', () => {
    showProductSuccess('UPDATED')
    expect(sileo.success).toHaveBeenCalledWith({ title: 'Producto actualizado exitosamente' })
  })

  it('showProductError ERROR_UPDATE calls sileo.error', () => {
    showProductError('ERROR_UPDATE')
    expect(sileo.error).toHaveBeenCalledWith({ title: 'Error al actualizar el producto' })
  })
})

describe('entity helpers — Services', () => {
  it('showServiceSuccess CREATED calls sileo.success', () => {
    showServiceSuccess('CREATED')
    expect(sileo.success).toHaveBeenCalledWith({ title: 'Servicio creado exitosamente' })
  })

  it('showServiceError ERROR_CREATE calls sileo.error', () => {
    showServiceError('ERROR_CREATE')
    expect(sileo.error).toHaveBeenCalledWith({ title: 'Error al crear el servicio' })
  })
})

describe('entity helpers — Budgets', () => {
  it('showBudgetSuccess CREATED calls sileo.success', () => {
    showBudgetSuccess('CREATED')
    expect(sileo.success).toHaveBeenCalledWith({ title: 'Presupuesto creado exitosamente' })
  })

  it('showBudgetError ERROR_DELETE calls sileo.error', () => {
    showBudgetError('ERROR_DELETE')
    expect(sileo.error).toHaveBeenCalledWith({ title: 'Error al eliminar el budget' })
  })
})

describe('entity helpers — ServiceRecords', () => {
  it('showServiceRecordSuccess CREATED calls sileo.success', () => {
    showServiceRecordSuccess('CREATED')
    expect(sileo.success).toHaveBeenCalledWith({ title: 'Atención registrada exitosamente' })
  })

  it('showServiceRecordError ERROR_CREATE calls sileo.error', () => {
    showServiceRecordError('ERROR_CREATE')
    expect(sileo.error).toHaveBeenCalledWith({ title: 'Error al registrar la atención' })
  })
})

describe('entity helpers — Auth', () => {
  it('showAuthSuccess LOGIN_SUCCESS calls sileo.success', () => {
    showAuthSuccess('LOGIN_SUCCESS')
    expect(sileo.success).toHaveBeenCalledWith({ title: 'Inicio de sesión exitoso' })
  })

  it('showAuthError LOGIN_ERROR calls sileo.error', () => {
    showAuthError('LOGIN_ERROR')
    expect(sileo.error).toHaveBeenCalledWith({ title: 'Error en el inicio de sesión' })
  })

  it('showAuthError TOKEN_EXPIRED calls sileo.error', () => {
    showAuthError('TOKEN_EXPIRED')
    expect(sileo.error).toHaveBeenCalledWith({
      title: 'Sesión expirada, por favor inicia sesión nuevamente',
    })
  })
})
