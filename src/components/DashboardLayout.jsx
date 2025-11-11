import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar Fija */}
      <Sidebar />

      {/* Área de Contenido Principal (con scroll) */}
      <div className="flex-1 flex flex-col ml-64">
        {/* Header Pegajoso */}
        <Header />

        {/* Contenido Principal */}
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
