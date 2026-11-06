import { Minus, Plus } from "lucide-react";
import { useSidebarStore } from "@stores/useSidebarStore";

// Pestaña redonda montada sobre el borde derecho del sidebar, en la esquina
// inferior del bloque del logo (desktop). Va fuera del <aside> para que pasar
// el mouse por encima no dispare la expansión por hover.
// En mobile el sidebar es un drawer y se controla desde el header.
const SidebarCollapseToggle = () => {
  const { isExpanded, isHovered, toggleSidebar } = useSidebarStore();
  const label = isExpanded ? "Colapsar menú" : "Expandir menú";
  const Icon = isExpanded ? Minus : Plus;
  // Mientras el sidebar colapsado se expande por hover, la pestaña se oculta:
  // quedaría tapada por el panel y "persiguiendo" al cursor.
  const hiddenWhileHovered = !isExpanded && isHovered;

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      aria-label={label}
      aria-expanded={isExpanded}
      aria-controls="tour-sidebar"
      title={label}
      className={`fixed top-16 z-[51] hidden lg:flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-outline-variant bg-surface text-secondary shadow-theme-xs transition-[left,opacity,color,border-color] duration-300 hover:text-on-surface hover:border-outline focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
        isExpanded ? "left-[290px]" : "left-[90px]"
      } ${hiddenWhileHovered ? "opacity-0 pointer-events-none" : "opacity-100"}`}
    >
      <Icon className="size-3.5" strokeWidth={2.5} />
    </button>
  );
};

export default SidebarCollapseToggle;
