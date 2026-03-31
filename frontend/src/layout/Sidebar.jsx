import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutGrid,
  Calendar,
  ClipboardList,
  Users,
  Car,
  FileText,
  Package,
  Wrench,
  Settings,
  ChevronDown,
  MoreHorizontal,
  LogOut,
} from "lucide-react";
import { useSidebar } from "../contexts/SidebarContext";
import { useAuth } from "../contexts/AuthContext";

const NavItem = ({ name, icon, path, subItems, menuType, index }) => {
  const { isExpanded, isMobileOpen, isHovered, openSubmenu, toggleSubmenu } = useSidebar();
  const location = useLocation();
  const [subMenuHeight, setSubMenuHeight] = useState(0);
  const subMenuRef = useRef(null);

  const isActive = useCallback(
    (path) => location.pathname === path,
    [location.pathname]
  );

  const hasActiveSubItem = subItems?.some((subItem) => isActive(subItem.path));

  useEffect(() => {
    if (subMenuRef.current) {
      setSubMenuHeight(subMenuRef.current.scrollHeight);
    }
  }, [subItems]);

  const handleSubmenuToggle = () => {
    toggleSubmenu(`${menuType}-${index}`);
  };

  const isSubmenuOpen = openSubmenu === `${menuType}-${index}`;
  const isVisible = isExpanded || isHovered || isMobileOpen;

  if (subItems) {
    return (
      <li>
        <button
          onClick={handleSubmenuToggle}
          className={`menu-item group w-full ${
            isSubmenuOpen || hasActiveSubItem
              ? "menu-item-active"
              : "menu-item-inactive"
          } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
        >
          <span
            className={`menu-item-icon-size flex-shrink-0 ${
              isSubmenuOpen || hasActiveSubItem
                ? "menu-item-icon-active"
                : "menu-item-icon-inactive"
            }`}
          >
            {icon}
          </span>
          {isVisible && (
            <>
              <span className="flex-1 text-left">{name}</span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isSubmenuOpen ? "menu-item-arrow-active rotate-180" : "menu-item-arrow-inactive"
                }`}
              />
            </>
          )}
        </button>
        {isVisible && (
          <div
            ref={subMenuRef}
            className="overflow-hidden transition-all duration-300"
            style={{ height: isSubmenuOpen ? `${subMenuHeight}px` : "0px" }}
          >
            <ul className="mt-1 space-y-0.5 ml-8 pl-2 border-l border-outline-variant">
              {subItems.map((subItem) => (
                <li key={subItem.name}>
                  <Link
                    to={subItem.path}
                    className={`menu-dropdown-item ${
                      isActive(subItem.path)
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                    }`}
                  >
                    {subItem.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </li>
    );
  }

  return (
    <li>
      {path && (
        <Link
          to={path}
          className={`menu-item group ${
            isActive(path) ? "menu-item-active" : "menu-item-inactive"
          } ${!isExpanded && !isHovered ? "lg:justify-center" : ""}`}
        >
          <span
            className={`menu-item-icon-size flex-shrink-0 ${
              isActive(path) ? "menu-item-icon-active" : "menu-item-icon-inactive"
            }`}
          >
            {icon}
          </span>
          {isVisible && <span className="flex-1">{name}</span>}
        </Link>
      )}
    </li>
  );
};

const Sidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isVisible = isExpanded || isHovered || isMobileOpen;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const mainNavItems = [
    {
      name: "Dashboard",
      icon: <LayoutGrid className="w-5 h-5" />,
      path: "/dashboard",
    },
    {
      name: "Clientes",
      icon: <Users className="w-5 h-5" />,
      subItems: [
        { name: "Clientes", path: "/customers" },
        { name: "Vehículos", path: "/vehicles" },
      ],
    },
    {
      name: "Operaciones",
      icon: <Calendar className="w-5 h-5" />,
      subItems: [
        { name: "Turnos", path: "/appointments" },
        { name: "Atenciones", path: "/service-records" },
      ],
    },
    {
      name: "Presupuestos",
      icon: <FileText className="w-5 h-5" />,
      path: "/presupuestos",
    },
    {
      name: "Catálogo",
      icon: <Package className="w-5 h-5" />,
      subItems: [
        { name: "Servicios", path: "/services" },
        { name: "Productos", path: "/products" },
      ],
    },
  ];

  const otherNavItems = [
    {
      name: "Configuración",
      icon: <Settings className="w-5 h-5" />,
      path: "/settings",
    },
  ];

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-0.5">
      {items.map((nav, index) => (
        <NavItem key={nav.name} {...nav} menuType={menuType} index={index} />
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed flex flex-col top-0 left-0 h-full bg-surface border-r border-outline-variant z-50 transition-all duration-300 ease-in-out
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo / Branding */}
      <div
        className={`flex items-center gap-3 px-5 h-16 border-b border-outline-variant flex-shrink-0 ${
          !isVisible ? "lg:justify-center" : ""
        }`}
      >
        <div className="flex-shrink-0 h-9 w-9 bg-primary-container rounded-lg flex items-center justify-center">
          <Wrench className="w-5 h-5 text-on-primary" />
        </div>
        {isVisible && (
          <div>
            <p className="text-sm font-black text-on-surface leading-tight">Lubricentro</p>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold leading-tight">
              Consola Admin
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col flex-1 overflow-y-auto no-scrollbar px-3 py-4">
        <nav className="flex flex-col gap-6 flex-1">
          <div>
            <h2
              className={`mb-2 flex text-[10px] uppercase font-bold tracking-widest text-secondary px-2 ${
                !isVisible ? "lg:justify-center" : "justify-start"
              }`}
            >
              {isVisible ? "Menú" : <MoreHorizontal className="size-4" />}
            </h2>
            {renderMenuItems(mainNavItems, "main")}
          </div>

          <div>
            <h2
              className={`mb-2 flex text-[10px] uppercase font-bold tracking-widest text-secondary px-2 ${
                !isVisible ? "lg:justify-center" : "justify-start"
              }`}
            >
              {isVisible ? "Sistema" : <MoreHorizontal className="size-4" />}
            </h2>
            {renderMenuItems(otherNavItems, "others")}
          </div>
        </nav>

        {/* Logout */}
        <div className="mt-4 pt-4 border-t border-outline-variant">
          <button
            onClick={handleLogout}
            className={`menu-item group w-full text-secondary hover:text-error hover:bg-error-container/20 ${
              !isVisible ? "lg:justify-center" : ""
            }`}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {isVisible && <span className="flex-1 text-left">Cerrar sesión</span>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
