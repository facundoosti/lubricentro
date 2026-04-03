import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import ConfirmModal from '@ui/ConfirmModal'

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
}

describe('ConfirmModal', () => {
  describe('cuando isOpen=false', () => {
    it('no renderiza nada', () => {
      const { container } = render(
        <ConfirmModal {...defaultProps} isOpen={false} />
      )
      expect(container.firstChild).toBeNull()
    })
  })

  describe('contenido por defecto', () => {
    it('muestra el título por defecto', () => {
      render(<ConfirmModal {...defaultProps} />)
      expect(screen.getByText('Confirmar acción')).toBeInTheDocument()
    })

    it('muestra el mensaje por defecto', () => {
      render(<ConfirmModal {...defaultProps} />)
      expect(screen.getByText('¿Está seguro de que desea realizar esta acción?')).toBeInTheDocument()
    })

    it('muestra los textos de botones por defecto', () => {
      render(<ConfirmModal {...defaultProps} />)
      expect(screen.getByRole('button', { name: 'Confirmar' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument()
    })
  })

  describe('props personalizadas', () => {
    it('muestra título personalizado', () => {
      render(<ConfirmModal {...defaultProps} title="¿Eliminar cliente?" />)
      expect(screen.getByText('¿Eliminar cliente?')).toBeInTheDocument()
    })

    it('muestra mensaje personalizado', () => {
      render(<ConfirmModal {...defaultProps} message="Esta acción no se puede deshacer." />)
      expect(screen.getByText('Esta acción no se puede deshacer.')).toBeInTheDocument()
    })

    it('muestra textos de botones personalizados', () => {
      render(<ConfirmModal {...defaultProps} confirmText="Sí, eliminar" cancelText="No, volver" />)
      expect(screen.getByRole('button', { name: 'Sí, eliminar' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'No, volver' })).toBeInTheDocument()
    })
  })

  describe('callbacks', () => {
    it('llama onConfirm al hacer click en el botón de confirmar', () => {
      const onConfirm = vi.fn()
      render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} />)
      fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
      expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    it('llama onClose al hacer click en el botón de cancelar', () => {
      const onClose = vi.fn()
      render(<ConfirmModal {...defaultProps} onClose={onClose} />)
      fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
      expect(onClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('estado isLoading', () => {
    it('deshabilita el botón cancelar cuando isLoading=true', () => {
      render(<ConfirmModal {...defaultProps} isLoading />)
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled()
    })

    it('muestra spinner en botón confirmar cuando isLoading=true', () => {
      render(<ConfirmModal {...defaultProps} isLoading confirmText="Eliminar" />)
      // El botón confirmar tiene loading=true, lo que renderiza un svg spinner
      const confirmBtn = screen.getByRole('button', { name: /eliminar/i })
      expect(confirmBtn.querySelector('svg')).toBeInTheDocument()
    })

    it('no llama onConfirm cuando está cargando (botón deshabilitado)', () => {
      const onConfirm = vi.fn()
      render(<ConfirmModal {...defaultProps} onConfirm={onConfirm} isLoading />)
      fireEvent.click(screen.getByRole('button', { name: /confirmar/i }))
      expect(onConfirm).not.toHaveBeenCalled()
    })
  })

  describe('variantes', () => {
    it('renderiza variante danger sin crashes', () => {
      render(<ConfirmModal {...defaultProps} variant="danger" />)
      expect(screen.getByText('Confirmar acción')).toBeInTheDocument()
    })

    it('renderiza variante warning sin crashes', () => {
      render(<ConfirmModal {...defaultProps} variant="warning" />)
      expect(screen.getByText('Confirmar acción')).toBeInTheDocument()
    })

    it('renderiza variante default sin crashes', () => {
      render(<ConfirmModal {...defaultProps} variant="default" />)
      expect(screen.getByText('Confirmar acción')).toBeInTheDocument()
    })
  })
})
