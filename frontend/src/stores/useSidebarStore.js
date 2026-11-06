import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSidebarStore = create(
  persist(
    (set, get) => ({
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

      toggleSidebar: () => set((state) => ({ isExpanded: !state.isExpanded, isHovered: false })),
      toggleMobileSidebar: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
      setIsHovered: (val) => set({ isHovered: val }),
      setActiveItem: (item) => set({ activeItem: item }),
      toggleSubmenu: (item) =>
        set((state) => ({ openSubmenu: state.openSubmenu === item ? null : item })),
      setIsMobile: (val) => set({ isMobile: val, isMobileOpen: val ? false : get().isMobileOpen }),
    }),
    {
      name: 'sidebar',
      // Solo se recuerda si el usuario dejó el menú expandido o colapsado (desktop)
      partialize: (state) => ({ isExpanded: state.isExpanded }),
    },
  ),
);
