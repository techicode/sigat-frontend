import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/dashboard': 'Panel Principal',
      '/assets': 'Gestión de Activos',
      '/software': 'Catálogo de Software',
      '/licenses': 'Gestión de Licencias',
      '/warnings': 'Advertencias',
      '/users': 'Gestión de Empleados',
      '/staff': 'Personal del Área IT',
      '/departments': 'Gestión de Departamentos',
    };
    return titles[path] || 'SIGAT';
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
  };

  // Get first name from user data
  const getFirstName = () => {
    // Prefer first_name from user profile if available
    if (user?.first_name) {
      return user.first_name;
    }

    // Fallback: extract from username (e.g., "luis.guillermo" -> "Luis")
    if (user?.username) {
      const namePart = user.username.split('.')[0];
      return namePart.charAt(0).toUpperCase() + namePart.slice(1);
    }

    return 'Usuario';
  };

  return (
    <header className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 md:p-6 z-10">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-md hover:bg-gray-800 text-gray-300 hover:text-white md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          {/* Título de la Sección */}
          <h2 className="text-xl md:text-2xl font-semibold text-white truncate max-w-[200px] md:max-w-none">
            {getPageTitle()}
          </h2>
        </div>

        {/* Menú de Usuario */}
        <div className="relative">
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-3 text-gray-300 hover:text-white transition-colors"
          >
            <div className="p-2 bg-gray-800 rounded-full md:bg-transparent md:p-0">
              <User className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span className="hidden md:inline">
              Bienvenido, {getFirstName()}
            </span>
            <ChevronDown className="w-4 h-4 hidden md:block" />
          </button>

          {/* Menú Desplegable */}
          {dropdownOpen && (
            <>
              {/* Backdrop para cerrar al hacer clic fuera */}
              <div
                className="fixed inset-0 z-20"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl py-2 z-30 border border-gray-700">
                <div className="px-4 py-2 md:hidden border-b border-gray-700 mb-2">
                  <p className="text-sm text-white font-medium">{getFirstName()}</p>
                  <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                </div>
                <a
                  href="#"
                  className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  Mi Perfil
                </a>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
