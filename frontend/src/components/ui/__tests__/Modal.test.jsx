import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Modal from '@ui/Modal'

const onClose = vi.fn()

describe('Modal', () => {
  describe('cuando isOpen=false', () => {
    it('no renderiza nada', () => {
      const { container } = render(
        <Modal isOpen={false} onClose={onClose}>Contenido</Modal>
      )
      expect(container.firstChild).toBeNull()
    })
  })

  describe('cuando isOpen=true', () => {
    it('renderiza los children', () => {
      render(<Modal isOpen onClose={onClose}>Contenido del modal</Modal>)
      expect(screen.getByText('Contenido del modal')).toBeInTheDocument()
    })

    it('muestra el título cuando se provee', () => {
      render(<Modal isOpen onClose={onClose} title="Mi título">Contenido</Modal>)
      expect(screen.getByText('Mi título')).toBeInTheDocument()
    })

    it('no renderiza título si no se provee', () => {
      render(<Modal isOpen onClose={onClose}>Contenido</Modal>)
      expect(screen.queryByRole('heading')).toBeNull()
    })

    it('muestra el botón de cerrar por defecto', () => {
      render(<Modal isOpen onClose={onClose}>Contenido</Modal>)
      // El botón X está en el DOM
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('oculta el botón de cerrar cuando showCloseButton=false', () => {
      render(<Modal isOpen onClose={onClose} showCloseButton={false}>Contenido</Modal>)
      expect(screen.queryByRole('button')).toBeNull()
    })

    it('llama onClose al hacer click en el botón X', () => {
      const handleClose = vi.fn()
      render(<Modal isOpen onClose={handleClose}>Contenido</Modal>)
      fireEvent.click(screen.getByRole('button'))
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('llama onClose al hacer click en el backdrop', () => {
      const handleClose = vi.fn()
      const { container } = render(<Modal isOpen onClose={handleClose}>Contenido</Modal>)
      // El backdrop es el div con clase backdrop-blur
      const backdrop = container.querySelector('.backdrop-blur-\\[32px\\]')
      fireEvent.click(backdrop)
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('no llama onClose al hacer click dentro del contenido', () => {
      const handleClose = vi.fn()
      render(<Modal isOpen onClose={handleClose}>
        <span data-testid="inner">Contenido</span>
      </Modal>)
      fireEvent.click(screen.getByTestId('inner'))
      expect(handleClose).not.toHaveBeenCalled()
    })

    it('llama onClose al presionar Escape', () => {
      const handleClose = vi.fn()
      render(<Modal isOpen onClose={handleClose}>Contenido</Modal>)
      fireEvent.keyDown(document, { key: 'Escape' })
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('no llama onClose al presionar otra tecla', () => {
      const handleClose = vi.fn()
      render(<Modal isOpen onClose={handleClose}>Contenido</Modal>)
      fireEvent.keyDown(document, { key: 'Enter' })
      expect(handleClose).not.toHaveBeenCalled()
    })

    it('bloquea el scroll del body', () => {
      render(<Modal isOpen onClose={onClose}>Contenido</Modal>)
      expect(document.body.style.overflow).toBe('hidden')
    })

    it('restaura el scroll del body al desmontarse', () => {
      const { unmount } = render(<Modal isOpen onClose={onClose}>Contenido</Modal>)
      unmount()
      expect(document.body.style.overflow).toBe('unset')
    })
  })
})
