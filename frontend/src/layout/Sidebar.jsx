import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Calendar,
  ClipboardList,
  Users,
  Car,
  Wrench,
  Package,
  Settings,
  ChevronDown,
  MoreHorizontal,
} from "lucide-react";
import { useSidebar } from "../contexts/SidebarContext";

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

  if (subItems) {
    return (
      <li>
        <button
          onClick={handleSubmenuToggle}
          className={`menu-item group ${
            isSubmenuOpen || hasActiveSubItem
              ? "menu-item-active"
              : "menu-item-inactive"
          } cursor-pointer ${
            !isExpanded && !isHovered
              ? "lg:justify-center"
              : "lg:justify-start"
          }`}
        >
          <span
            className={`menu-item-icon-size ${
              isSubmenuOpen || hasActiveSubItem
                ? "menu-item-icon-active"
                : "menu-item-icon-inactive"
            }`}
          >
            {icon}
          </span>
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="menu-item-text">{name}</span>
          )}
          {(isExpanded || isHovered || isMobileOpen) && (
            <ChevronDown
              className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                isSubmenuOpen ? "rotate-180 text-brand-500" : ""
              }`}
            />
          )}
        </button>
        {(isExpanded || isHovered || isMobileOpen) && (
          <div
            ref={subMenuRef}
            className="overflow-hidden transition-all duration-300"
            style={{
              height: isSubmenuOpen ? `${subMenuHeight}px` : "0px",
            }}
          >
            <ul className="mt-2 space-y-1 ml-9">
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
          }`}
        >
          <span
            className={`menu-item-icon-size ${
              isActive(path)
                ? "menu-item-icon-active"
                : "menu-item-icon-inactive"
            }`}
          >
            {icon}
          </span>
          {(isExpanded || isHovered || isMobileOpen) && (
            <span className="menu-item-text">{name}</span>
          )}
        </Link>
      )}
    </li>
  );
};

const Sidebar = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();

  const mainNavItems = [
    {
      name: "Dashboard",
      icon: <LayoutGrid className="w-6 h-6" />,
      path: "/",
    },
    {
      name: "Operaciones",
      icon: <Calendar className="w-6 h-6" />,
      subItems: [
        { name: "Turnos", path: "/appointments" },
        { name: "Atenciones", path: "/service-records" },
      ],
    },
    {
      name: "Clientes",
      icon: <Users className="w-6 h-6" />,
      subItems: [
        { name: "Clientes", path: "/customers" },
        { name: "Vehículos", path: "/vehicles" },
      ],
    },
  ];

  const otherNavItems = [
    {
      name: "Catálogo",
      icon: <Wrench className="w-6 h-6" />,
      subItems: [
        { name: "Servicios", path: "/services" },
        { name: "Productos", path: "/products" },
      ],
    },
    {
      name: "Administración",
      icon: <Settings className="w-6 h-6" />,
      path: "/settings",
    },
  ];

  const renderMenuItems = (items, menuType) => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <NavItem
          key={nav.name}
          {...nav}
          menuType={menuType}
          index={index}
        />
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <img
              src="/taller.svg"
              alt="Logo Lubricentro"
              className="h-12 w-auto"
            />
          ) : (
            <img
              src="/taller.svg"
              alt="Logo Lubricentro"
              className="h-8 w-8"
            />
          )}
        </Link>
      </div>
      
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <MoreHorizontal className="size-6" />
                )}
              </h2>
              {renderMenuItems(mainNavItems, "main")}
            </div>
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Otros"
                ) : (
                  <MoreHorizontal className="size-6" />
                )}
              </h2>
              {renderMenuItems(otherNavItems, "others")}
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar; 