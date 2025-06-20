import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu, X, Users, Car, Calendar, Wrench, Package, BarChart3, Settings } from 'lucide-react';
import Navigation from './Navigation';
import UserProfile from './UserProfile';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Ejemplo de cómo podrían venir los datos. El `count` es para los badges.
  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3, count: null },
    { name: 'Turnos', href: '/appointments', icon: Calendar, count: '12' },
    { name: 'Clientes', href: '/customers', icon: Users, count: null },
    { name: 'Vehículos', href: '/vehicles', icon: Car, count: null },
  ];

  const secondaryNavigation = [
    { name: 'Servicios', href: '/services', icon: Wrench },
    { name: 'Productos', href: '/products', icon: Package },
    { name: 'Configuración', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar para mobile */}
      <div className={`fixed inset-0 z-50 flex lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-900/80" onClick={() => setSidebarOpen(false)} />
        <div className="relative mr-16 flex w-full max-w-xs flex-1">
          <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
            <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
              <X className="h-6 w-6 text-white" />
            </button>
          </div>
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-secondary-900 px-6 pb-4">
            <Link to="/" className="flex h-16 shrink-0 items-center">
              {/* Reemplazar con tu logo */}
              <Wrench className="h-8 w-auto text-white" />
              <span className="ml-3 text-lg font-semibold text-white">Lubricentro</span>
            </Link>
            <Navigation navigation={navigation} secondaryNavigation={secondaryNavigation} />
            <UserProfile />
          </div>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-secondary-900 px-6 pb-4">
          <Link to="/" className="flex h-16 shrink-0 items-center">
            {/* Reemplazar con tu logo */}
            <Wrench className="h-8 w-auto text-white" />
            <span className="ml-3 text-lg font-semibold text-white">Lubricentro</span>
          </Link>
          <Navigation navigation={navigation} secondaryNavigation={secondaryNavigation} />
          <UserProfile />
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          {/* Separador */}
          <div className="h-6 w-px bg-gray-900/10 lg:hidden" aria-hidden="true" />
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            {/* Aquí podría ir un buscador o el título de la página */}
            <div className="flex-1" />
          </div>
        </div>

        <main className="py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
} 