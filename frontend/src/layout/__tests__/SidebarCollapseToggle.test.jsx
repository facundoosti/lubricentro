import { describe, it, expect, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '@/test/utils'
import { useSidebarStore } from '@stores/useSidebarStore'
import SidebarCollapseToggle from '@layout/SidebarCollapseToggle'

describe('SidebarCollapseToggle', () => {
  beforeEach(() => {
    useSidebarStore.setState({ isExpanded: true, isHovered: false })
  })

  it('expandido: solo ícono, con "Colapsar menú" como nombre accesible', () => {
    renderWithProviders(<SidebarCollapseToggle />)

    const button = screen.getByRole('button', { name: 'Colapsar menú' })
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(button).toHaveAttribute('title', 'Colapsar menú')
    expect(button).toHaveTextContent('')
  })

  it('colapsa el sidebar al hacer click', () => {
    renderWithProviders(<SidebarCollapseToggle />)

    fireEvent.click(screen.getByRole('button', { name: 'Colapsar menú' }))

    expect(useSidebarStore.getState().isExpanded).toBe(false)
  })

  it('colapsado: se ubica en el borde del rail y ofrece "Expandir menú"', () => {
    useSidebarStore.setState({ isExpanded: false })
    renderWithProviders(<SidebarCollapseToggle />)

    const button = screen.getByRole('button', { name: 'Expandir menú' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button.className).toContain('left-[90px]')
  })

  it('se oculta mientras el sidebar colapsado se expande por hover', () => {
    useSidebarStore.setState({ isExpanded: false, isHovered: true })
    renderWithProviders(<SidebarCollapseToggle />)

    const button = screen.getByRole('button', { name: 'Expandir menú' })
    expect(button.className).toContain('pointer-events-none')
  })
})
