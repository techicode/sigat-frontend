import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Monitor,
  Package,
  Key,
  AlertTriangle,
  Users,
  Building2,
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    {
      path: '/dashboard',
      label: 'Panel Principal',
      icon: LayoutDashboard,
    },
    {
      path: '/assets',
      label: 'Activos',
      icon: Monitor,
    },
    {
      path: '/software',
      label: 'Software',
      icon: Package,
    },
    {
      path: '/licenses',
      label: 'Licencias',
      icon: Key,
    },
    {
      path: '/warnings',
      label: 'Advertencias',
      icon: AlertTriangle,
    },
    {
      path: '/users',
      label: 'Usuarios',
      icon: Users,
    },
    {
      path: '/departments',
      label: 'Departamentos',
      icon: Building2,
    },
  ];

  return (
    <div className="fixed top-0 left-0 h-full w-64 bg-gray-800 text-gray-300 flex flex-col z-20">
      {/* Logo/Título */}
      <div className="flex items-center justify-center h-20 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-white">SIGAT</h1>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-700 text-white font-semibold shadow-lg'
                    : 'hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
