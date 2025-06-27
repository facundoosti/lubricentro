import { Outlet } from 'react-router-dom';
import { SidebarProvider, useSidebar } from '@contexts/SidebarContext';
import Header from '@layout/Header';
import Sidebar from '@layout/Sidebar';
import TokenExpiredHandler from '@common/TokenExpiredHandler';

const LayoutContent = () => {
  const { isExpanded, isHovered } = useSidebar();
  
  return (
    <div className="dark:bg-boxdark-2 dark:text-bodydark">
      <TokenExpiredHandler />
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