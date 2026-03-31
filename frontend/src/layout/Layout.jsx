import { Outlet } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '@contexts/SidebarContext';
import Header from '@layout/Header';
import Sidebar from '@layout/Sidebar';
import TokenExpiredHandler from '@common/TokenExpiredHandler';

const LayoutContent = () => {
  const { isExpanded, isHovered } = useSidebar();
  
  return (
    <div className="bg-background text-on-surface min-h-screen">
      <TokenExpiredHandler />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div
          className={`relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${
            isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
          }`}
        >
          <Header />
          <main className="pt-16 min-h-screen bg-background">
            <div className="p-6 md:p-8 max-w-screen-2xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
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