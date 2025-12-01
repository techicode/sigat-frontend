import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Monitor,
  Package,
  Key,
  AlertTriangle,
  HardDrive,
  BarChart3,
  ClipboardCheck,
  Users,
  Building2,
  UserCog,
  FileText,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
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
      path: '/hardware-obsolescence',
      label: 'Hardware Obsoleto',
      icon: HardDrive,
    },
    {
      path: '/reports',
      label: 'Reportes',
      icon: BarChart3,
    },
    {
      path: '/checkins',
      label: 'Check-ins',
      icon: ClipboardCheck,
    },
    {
      path: '/users',
      label: 'Empleados',
      icon: Users,
    },
    {
      path: '/staff',
      label: 'Personal IT',
      icon: UserCog,
    },
    {
      path: '/departments',
      label: 'Departamentos',
      icon: Building2,
    },
    {
      path: '/audit-logs',
      label: 'Auditoría',
      icon: FileText,
    },
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-gray-300 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Logo/Título */}
      <div className="flex items-center justify-between h-20 border-b border-gray-700 px-6">
        <h1 className="text-2xl font-bold text-white">SIGAT</h1>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white md:hidden"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                // Close sidebar on mobile when a link is clicked
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-700 text-white font-semibold shadow-lg'
                    : 'hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 min-w-[1.25rem]" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
