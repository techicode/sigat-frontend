import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar Fija */}
      <Sidebar />

      {/* Área de Contenido Principal (con scroll) */}
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        {/* Header Pegajoso */}
        <Header />

        {/* Contenido Principal */}
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
