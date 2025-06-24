import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SidebarProvider, useSidebar } from '@contexts/SidebarContext';
import Header from '@layout/Header';
import Sidebar from '@layout/Sidebar';

const LayoutContent = () => {
  const { isExpanded, isHovered } = useSidebar();
  
  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div 
          className={`relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${
            isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
          }`}
        >
          <Header />
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg, #363636)',
            color: 'var(--toast-color, #fff)',
            borderRadius: '8px',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            border: '1px solid var(--toast-border, rgba(255, 255, 255, 0.1))',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
            style: {
              background: '#10B981',
              color: '#fff',
              border: '1px solid #059669',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
            style: {
              background: '#EF4444',
              color: '#fff',
              border: '1px solid #DC2626',
            },
          },
          loading: {
            style: {
              background: '#3B82F6',
              color: '#fff',
              border: '1px solid #2563EB',
            },
          },
        }}
        containerStyle={{
          top: 20,
          right: 20,
        }}
      />
    </div>
  );
};

const Layout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default Layout; 