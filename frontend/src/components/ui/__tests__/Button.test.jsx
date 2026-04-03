import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import Button from '@ui/Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Guardar</Button>)
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument()
  })

  it('has type="button" by default', () => {
    render(<Button>Click</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })

  it('renders with type="submit" when specified', () => {
    render(<Button type="submit">Enviar</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit')
  })

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Deshabilitado</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('shows loader icon and is disabled when loading', () => {
    render(<Button loading>Cargando</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    // El spinner de Lucide se renderiza como svg dentro del botón
    expect(button.querySelector('svg')).toBeInTheDocument()
  })

  it('does not show startIcon when loading', () => {
    const icon = <span data-testid="start-icon">★</span>
    render(<Button loading startIcon={icon}>Guardar</Button>)
    expect(screen.queryByTestId('start-icon')).not.toBeInTheDocument()
  })

  it('shows startIcon when not loading', () => {
    const icon = <span data-testid="start-icon">★</span>
    render(<Button startIcon={icon}>Guardar</Button>)
    expect(screen.getByTestId('start-icon')).toBeInTheDocument()
  })

  it('shows endIcon when not loading', () => {
    const icon = <span data-testid="end-icon">→</span>
    render(<Button endIcon={icon}>Siguiente</Button>)
    expect(screen.getByTestId('end-icon')).toBeInTheDocument()
  })

  it('does not show endIcon when loading', () => {
    const icon = <span data-testid="end-icon">→</span>
    render(<Button loading endIcon={icon}>Siguiente</Button>)
    expect(screen.queryByTestId('end-icon')).not.toBeInTheDocument()
  })

  it('applies additional className', () => {
    render(<Button className="w-full">Ancho completo</Button>)
    expect(screen.getByRole('button')).toHaveClass('w-full')
  })

  it.each(['primary', 'secondary', 'outline', 'ghost', 'danger', 'success', 'error', 'warning'])(
    'renders variant "%s" without crashing',
    (variant) => {
      render(<Button variant={variant}>Botón</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    }
  )

  it.each(['sm', 'md', 'lg', 'xl'])('renders size "%s" without crashing', (size) => {
    render(<Button size={size}>Botón</Button>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
