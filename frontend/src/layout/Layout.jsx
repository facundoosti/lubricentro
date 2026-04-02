import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSidebarStore } from '@stores/useSidebarStore';
import Header from '@layout/Header';
import Sidebar from '@layout/Sidebar';
import TokenExpiredHandler from '@common/TokenExpiredHandler';

const Layout = () => {
  const { isExpanded, isHovered, setIsMobile } = useSidebarStore();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setIsMobile]);

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <TokenExpiredHandler />
      <Header />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div
          className={`relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${
            isExpanded || isHovered ? 'lg:ml-[290px]' : 'lg:ml-[90px]'
          }`}
        >
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

export default Layout;
