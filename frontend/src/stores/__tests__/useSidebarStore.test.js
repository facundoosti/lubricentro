import { describe, it, expect, beforeEach } from 'vitest'
import { useSidebarStore } from '@stores/useSidebarStore'

// Reset Zustand store state before each test
beforeEach(() => {
  useSidebarStore.setState({
    isExpanded: true,
    isMobileOpen: false,
    isMobile: false,
    isHovered: false,
    activeItem: null,
    openSubmenu: null,
  })
})

describe('useSidebarStore', () => {
  describe('initial state', () => {
    it('isExpanded is true', () => {
      expect(useSidebarStore.getState().isExpanded).toBe(true)
    })

    it('isMobileOpen is false', () => {
      expect(useSidebarStore.getState().isMobileOpen).toBe(false)
    })

    it('isMobile is false', () => {
      expect(useSidebarStore.getState().isMobile).toBe(false)
    })

    it('isHovered is false', () => {
      expect(useSidebarStore.getState().isHovered).toBe(false)
    })

    it('activeItem is null', () => {
      expect(useSidebarStore.getState().activeItem).toBeNull()
    })

    it('openSubmenu is null', () => {
      expect(useSidebarStore.getState().openSubmenu).toBeNull()
    })
  })

  describe('toggleSidebar', () => {
    it('toggles isExpanded from true to false', () => {
      useSidebarStore.getState().toggleSidebar()
      expect(useSidebarStore.getState().isExpanded).toBe(false)
    })

    it('toggles isExpanded from false to true', () => {
      useSidebarStore.setState({ isExpanded: false })
      useSidebarStore.getState().toggleSidebar()
      expect(useSidebarStore.getState().isExpanded).toBe(true)
    })
  })

  describe('toggleMobileSidebar', () => {
    it('toggles isMobileOpen from false to true', () => {
      useSidebarStore.getState().toggleMobileSidebar()
      expect(useSidebarStore.getState().isMobileOpen).toBe(true)
    })

    it('toggles isMobileOpen from true to false', () => {
      useSidebarStore.setState({ isMobileOpen: true })
      useSidebarStore.getState().toggleMobileSidebar()
      expect(useSidebarStore.getState().isMobileOpen).toBe(false)
    })
  })

  describe('setIsHovered', () => {
    it('sets isHovered to true', () => {
      useSidebarStore.getState().setIsHovered(true)
      expect(useSidebarStore.getState().isHovered).toBe(true)
    })

    it('sets isHovered to false', () => {
      useSidebarStore.setState({ isHovered: true })
      useSidebarStore.getState().setIsHovered(false)
      expect(useSidebarStore.getState().isHovered).toBe(false)
    })
  })

  describe('setActiveItem', () => {
    it('sets activeItem', () => {
      useSidebarStore.getState().setActiveItem('clientes')
      expect(useSidebarStore.getState().activeItem).toBe('clientes')
    })

    it('sets activeItem to null', () => {
      useSidebarStore.setState({ activeItem: 'vehiculos' })
      useSidebarStore.getState().setActiveItem(null)
      expect(useSidebarStore.getState().activeItem).toBeNull()
    })
  })

  describe('toggleSubmenu', () => {
    it('opens a submenu when none is open', () => {
      useSidebarStore.getState().toggleSubmenu('catalogo')
      expect(useSidebarStore.getState().openSubmenu).toBe('catalogo')
    })

    it('closes the submenu when the same item is toggled', () => {
      useSidebarStore.setState({ openSubmenu: 'catalogo' })
      useSidebarStore.getState().toggleSubmenu('catalogo')
      expect(useSidebarStore.getState().openSubmenu).toBeNull()
    })

    it('switches to a different submenu', () => {
      useSidebarStore.setState({ openSubmenu: 'catalogo' })
      useSidebarStore.getState().toggleSubmenu('reportes')
      expect(useSidebarStore.getState().openSubmenu).toBe('reportes')
    })
  })

  describe('setIsMobile', () => {
    it('sets isMobile to true and closes mobile sidebar', () => {
      useSidebarStore.setState({ isMobileOpen: true })
      useSidebarStore.getState().setIsMobile(true)
      expect(useSidebarStore.getState().isMobile).toBe(true)
      expect(useSidebarStore.getState().isMobileOpen).toBe(false)
    })

    it('sets isMobile to false and preserves isMobileOpen', () => {
      useSidebarStore.setState({ isMobile: true, isMobileOpen: false })
      useSidebarStore.getState().setIsMobile(false)
      expect(useSidebarStore.getState().isMobile).toBe(false)
    })
  })

  describe('getIsExpanded', () => {
    it('returns isExpanded value when not on mobile', () => {
      useSidebarStore.setState({ isMobile: false, isExpanded: true })
      expect(useSidebarStore.getState().getIsExpanded()).toBe(true)
    })

    it('returns false when on mobile regardless of isExpanded', () => {
      useSidebarStore.setState({ isMobile: true, isExpanded: true })
      expect(useSidebarStore.getState().getIsExpanded()).toBe(false)
    })
  })
})
