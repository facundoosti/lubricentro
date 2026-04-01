import { create } from 'zustand';

export const useSidebarStore = create((set, get) => ({
  isExpanded: true,
  isMobileOpen: false,
  isMobile: false,
  isHovered: false,
  activeItem: null,
  openSubmenu: null,

  // Computed: on mobile the sidebar is never "expanded" in desktop sense
  getIsExpanded: () => {
    const { isMobile, isExpanded } = get();
    return isMobile ? false : isExpanded;
  },

  toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded })),
  toggleMobileSidebar: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
  setIsHovered: (val) => set({ isHovered: val }),
  setActiveItem: (item) => set({ activeItem: item }),
  toggleSubmenu: (item) =>
    set((state) => ({ openSubmenu: state.openSubmenu === item ? null : item })),
  setIsMobile: (val) => set({ isMobile: val, isMobileOpen: val ? false : get().isMobileOpen }),
}));
