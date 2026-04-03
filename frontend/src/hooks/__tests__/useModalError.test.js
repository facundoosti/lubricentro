import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('sileo', () => ({
  sileo: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('@services/notificationService', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    showError: vi.fn(),
    parseApiError: actual.parseApiError,
  }
})

import { showError } from '@services/notificationService'
import { useModalError } from '@hooks/useModalError'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useModalError', () => {
  it('llama showError con el título cuando no hay detalle', () => {
    const { result } = renderHook(() => useModalError())
    result.current.handleError(
      { response: { data: { message: 'Ocurrió un error inesperado' } } },
      'Ocurrió un error inesperado'
    )
    expect(showError).toHaveBeenCalledWith('Ocurrió un error inesperado', undefined)
  })

  it('llama showError con título y descripción cuando el detalle es diferente al título', () => {
    const { result } = renderHook(() => useModalError())
    result.current.handleError(
      { response: { data: { message: 'El teléfono es requerido' } } },
      'Error al crear el cliente'
    )
    expect(showError).toHaveBeenCalledWith('Error al crear el cliente', 'El teléfono es requerido')
  })

  it('no incluye descripción cuando el detalle coincide con el título', () => {
    const { result } = renderHook(() => useModalError())
    result.current.handleError(
      { response: { data: { message: 'Error al crear el cliente' } } },
      'Error al crear el cliente'
    )
    expect(showError).toHaveBeenCalledWith('Error al crear el cliente', undefined)
  })

  it('usa el título por defecto "Ocurrió un error inesperado" si no se pasa', () => {
    const { result } = renderHook(() => useModalError())
    result.current.handleError({})
    expect(showError).toHaveBeenCalledWith('Ocurrió un error inesperado', undefined)
  })

  it('llama onCloseModal cuando se provee', () => {
    const onClose = vi.fn()
    const { result } = renderHook(() => useModalError(onClose))
    result.current.handleError({ message: 'error' }, 'Título')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('no falla si onCloseModal no se provee', () => {
    const { result } = renderHook(() => useModalError())
    expect(() => result.current.handleError({ message: 'error' }, 'Título')).not.toThrow()
  })

  it('extrae errores del formato Rails (errors object)', () => {
    const { result } = renderHook(() => useModalError())
    result.current.handleError(
      { response: { data: { errors: { name: ['no puede estar vacío'] } } } },
      'Error al crear'
    )
    expect(showError).toHaveBeenCalledWith('Error al crear', 'no puede estar vacío')
  })
})
