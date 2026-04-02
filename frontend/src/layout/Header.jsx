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
} from "lucide-react";
import { useTour } from "@hooks/useTour";

const Header = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } =
    useSidebarStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { startTour } = useTour();

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

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
      {/* Left: toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleToggle}
          aria-label="Toggle Sidebar"
          className="p-2 text-secondary hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors"
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
