import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden relative">
      {/* Sidebar (Responsive) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Área de Contenido Principal (con scroll) */}
      <div className="flex-1 flex flex-col md:ml-64 overflow-hidden w-full">
        {/* Header Pegajoso */}
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        {/* Contenido Principal */}
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
