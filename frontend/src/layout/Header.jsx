import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSidebarStore } from "@stores/useSidebarStore";
import { useAuthStore } from "@stores/useAuthStore";
import { showAuthSuccess } from "@services/notificationService";
import {
  LogOut,
  User,
  Bell,
  Settings,
  Menu,
  X,
  CircleHelp,
  Sun,
  Moon,
} from "lucide-react";
import { useTour } from "@hooks/useTour";
import { useThemeStore } from "@stores/useThemeStore";

const Header = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebarStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { startTour } = useTour();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";

  const handleLogout = () => {
    logout();
    showAuthSuccess("LOGOUT_SUCCESS");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest(".user-menu")) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  return (
    <header className="fixed top-0 w-full z-50 flex items-center justify-between px-4 lg:px-6 h-16 bg-surface border-b border-outline-variant">
      {/* Left: toggle del drawer en mobile (en desktop se colapsa desde el sidebar) */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={isMobileOpen}
          aria-controls="tour-sidebar"
          className="lg:hidden p-2 text-secondary hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
        >
          {isMobileOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Right: actions + user */}
      <div className="flex items-center gap-1">
        <button
          id="tour-btn-tour"
          onClick={startTour}
          className="p-2 text-secondary hover:text-primary hover:bg-surface-container-high rounded-full transition-colors"
          aria-label="Tour de la aplicación"
          title="Iniciar tour de la aplicación"
        >
          <CircleHelp className="w-5 h-5" />
        </button>

        <button
          className="p-2 text-secondary hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors"
          aria-label="Notificaciones"
        >
          <Bell className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate("/settings")}
          className="p-2 text-secondary hover:text-on-surface hover:bg-surface-container-high rounded-full transition-colors"
          aria-label="Configuración"
          title="Configuración"
        >
          <Settings className="w-5 h-5" />
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          aria-label="Modo oscuro"
          title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          onClick={toggleTheme}
          className="relative mx-1 inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border border-outline-variant bg-surface-container-high transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span
            className={`inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-theme-xs transition-transform duration-200 ${
              isDark ? "translate-x-6" : "translate-x-1"
            }`}
          >
            {isDark ? <Moon className="h-2.5 w-2.5" /> : <Sun className="h-2.5 w-2.5" />}
          </span>
        </button>

        <div className="h-6 w-px bg-outline-variant mx-1" />

        {/* User menu */}
        <div className="relative user-menu">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-primary-container flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-on-primary" />
            </div>
            <div className="hidden sm:block text-left max-w-[120px]">
              <p className="text-xs font-semibold text-on-surface leading-tight truncate">
                {user?.email?.split("@")[0] || "Usuario"}
              </p>
              <p className="text-[10px] text-secondary leading-tight">
                Administrador
              </p>
            </div>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-52 bg-surface-container-highest border border-outline-variant rounded-lg shadow-theme-lg overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-outline-variant">
                <p className="text-sm font-medium text-on-surface truncate">
                  {user?.email || "Usuario"}
                </p>
                <p className="text-xs text-secondary">Administrador</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-secondary hover:text-error hover:bg-error-container/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
