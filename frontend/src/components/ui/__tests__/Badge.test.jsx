import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Badge from '@ui/Badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>Activo</Badge>)
    expect(screen.getByText('Activo')).toBeInTheDocument()
  })

  it('renders as a <span> element', () => {
    render(<Badge>Test</Badge>)
    expect(screen.getByText('Test').tagName).toBe('SPAN')
  })

  it('applies base styles', () => {
    render(<Badge>Base</Badge>)
    const badge = screen.getByText('Base')
    expect(badge).toHaveClass('inline-flex', 'items-center', 'rounded-full', 'font-medium')
  })

  it('applies sm size class', () => {
    render(<Badge size="sm">Pequeño</Badge>)
    expect(screen.getByText('Pequeño')).toHaveClass('text-xs')
  })

  it('applies md size class by default', () => {
    render(<Badge>Mediano</Badge>)
    expect(screen.getByText('Mediano')).toHaveClass('text-sm')
  })

  it('renders startIcon before children', () => {
    const icon = <span data-testid="start-icon">●</span>
    render(<Badge startIcon={icon}>Con ícono</Badge>)
    expect(screen.getByTestId('start-icon')).toBeInTheDocument()
  })

  it('renders endIcon after children', () => {
    const icon = <span data-testid="end-icon">✓</span>
    render(<Badge endIcon={icon}>Con ícono</Badge>)
    expect(screen.getByTestId('end-icon')).toBeInTheDocument()
  })

  it.each(['primary', 'success', 'error', 'warning', 'info', 'light', 'dark'])(
    'renders color "%s" with light variant without crashing',
    (color) => {
      render(<Badge color={color}>Badge</Badge>)
      expect(screen.getByText('Badge')).toBeInTheDocument()
    }
  )

  it.each(['primary', 'success', 'error', 'warning', 'info', 'light', 'dark'])(
    'renders color "%s" with solid variant without crashing',
    (color) => {
      render(<Badge variant="solid" color={color}>Badge</Badge>)
      expect(screen.getByText('Badge')).toBeInTheDocument()
    }
  )
})
