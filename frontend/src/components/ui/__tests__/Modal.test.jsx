import { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import Modal from '@ui/Modal'
import FormDialog from '@ui/FormDialog'

afterEach(() => {
  document.body.style.overflow = ''
})

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
      render(<Modal isOpen onClose={handleClose}>Contenido</Modal>)
      fireEvent.click(screen.getByTestId('modal-backdrop'))
      expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('con closeOnBackdrop=false el click en el backdrop no cierra', () => {
      const handleClose = vi.fn()
      render(<Modal isOpen onClose={handleClose} closeOnBackdrop={false}>Contenido</Modal>)
      fireEvent.click(screen.getByTestId('modal-backdrop'))
      expect(handleClose).not.toHaveBeenCalled()
      expect(screen.getByRole('dialog')).toBeInTheDocument()
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

    it('restaura el overflow previo del body al desmontarse', () => {
      document.body.style.overflow = 'scroll'
      const { unmount } = render(<Modal isOpen onClose={onClose}>Contenido</Modal>)
      expect(document.body.style.overflow).toBe('hidden')
      unmount()
      expect(document.body.style.overflow).toBe('scroll')
    })

    it('se renderiza en un portal a document.body', () => {
      const { container } = render(<Modal isOpen onClose={onClose} title="T">Contenido</Modal>)
      expect(container).not.toContainElement(screen.getByRole('dialog'))
      expect(screen.getByTestId('modal-backdrop').parentElement.parentElement).toBe(document.body)
    })
  })
})

describe('Modal — accesibilidad', () => {
  it('se expone como diálogo modal con el título como nombre', () => {
    render(<Modal isOpen onClose={vi.fn()} title="Editar cliente">Contenido</Modal>);
    const dialog = screen.getByRole('dialog', { name: 'Editar cliente' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('la X de cerrar tiene nombre accesible', () => {
    const close = vi.fn();
    render(<Modal isOpen onClose={close} title="Editar cliente">Contenido</Modal>);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(close).toHaveBeenCalled();
  });
});

describe('Modal — pila de diálogos', () => {
  it('abierto sobre un FormDialog queda encima y Escape cierra solo el Modal', () => {
    const closeForm = vi.fn()
    const closeModal = vi.fn()
    render(
      <>
        <FormDialog isOpen onClose={closeForm} title="Formulario">contenido</FormDialog>
        <Modal isOpen onClose={closeModal} title="Confirmar">¿Seguro?</Modal>
      </>,
    )
    const formLayer = screen.getByTestId('form-dialog-backdrop')
    const modalLayer = screen.getByTestId('modal-backdrop').parentElement
    expect(Number(modalLayer.style.zIndex)).toBeGreaterThan(Number(formLayer.style.zIndex))
    expect(formLayer).toHaveAttribute('inert')

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(closeModal).toHaveBeenCalledTimes(1)
    expect(closeForm).not.toHaveBeenCalled()
  })

  it('enfoca el diálogo al abrir y devuelve el foco al botón que lo abrió', () => {
    const Harness = () => {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button type="button" onClick={() => setOpen(true)}>Eliminar</button>
          <Modal isOpen={open} onClose={() => setOpen(false)} title="Confirmar">¿Seguro?</Modal>
        </>
      )
    }
    render(<Harness />)
    const trigger = screen.getByRole('button', { name: 'Eliminar' })
    trigger.focus()
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog', { name: 'Confirmar' })).toHaveFocus()

    fireEvent.click(screen.getByTestId('modal-backdrop'))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })
})
