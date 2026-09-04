import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';

export const AppLayout: React.FC = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();

  const isFullScreenCanvas = location.pathname === '/app/workflows/new';

  return (
    <div className="min-h-screen bg-[#F6F6F3] text-[#111318] flex antialiased selection:bg-[#6D4AFF]/20">
      {/* Sidebar */}
      <AppSidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        <AppHeader
          onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
        />
        <main className={`flex-1 ${isFullScreenCanvas ? 'p-0 flex flex-col' : 'p-4 sm:p-8 max-w-7xl w-full mx-auto'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
