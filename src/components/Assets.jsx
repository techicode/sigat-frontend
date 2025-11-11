import { useState, useEffect, useCallback } from 'react';
import { Monitor, Laptop, Printer, Users, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import axiosInstance from '../axiosConfig';

// Asset type icons mapping
const ASSET_TYPE_ICONS = {
  NOTEBOOK: Laptop,
  DESKTOP: Monitor,
  MONITOR: Monitor,
  PRINTER: Printer,
  OTHER: Monitor,
};

// Asset status badge colors
const STATUS_COLORS = {
  BODEGA: 'bg-gray-500 text-white',
  ASIGNADO: 'bg-green-500 text-white',
  REPARACION: 'bg-yellow-500 text-black',
  DE_BAJA: 'bg-red-500 text-white',
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-600 text-white';
  const displayStatus = {
    BODEGA: 'En Bodega',
    ASIGNADO: 'Asignado',
    REPARACION: 'En Reparación',
    DE_BAJA: 'De Baja',
  }[status] || status;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      {displayStatus}
    </span>
  );
};

// Asset Type Badge Component
const TypeBadge = ({ type }) => {
  const Icon = ASSET_TYPE_ICONS[type] || Monitor;
  const displayType = {
    NOTEBOOK: 'Notebook',
    DESKTOP: 'Desktop',
    MONITOR: 'Monitor',
    PRINTER: 'Impresora',
    OTHER: 'Otro',
  }[type] || type;

  return (
    <div className="flex items-center gap-2">
      <Icon className="w-4 h-4 text-blue-400" />
      <span className="text-gray-300">{displayType}</span>
    </div>
  );
};

// Search Bar Component
const SearchBar = ({ searchTerm, onSearchChange }) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Buscar por código, serial, marca, modelo..."
        className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, totalCount, pageSize, onPageChange }) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between py-4 px-6 bg-gray-800 border-t border-gray-700">
      <div className="text-sm text-gray-400">
        Mostrando {startItem} - {endItem} de {totalCount} activos
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              page === currentPage
                ? 'bg-blue-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Main Assets Component
const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  const pageSize = 20;

  // Fetch assets from API
  const fetchAssets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query params
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });

      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await axiosInstance.get(`/assets/?${params.toString()}`);

      setAssets(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError('Error al cargar los activos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  // Fetch assets on mount and when dependencies change
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Reset to page 1 when search changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const totalPages = Math.ceil(pagination.count / pageSize);

  // Loading state
  if (loading && assets.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Cargando activos...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error) {
    return (
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center max-w-md mx-auto mt-8">
          <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={fetchAssets}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gray-900 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Gestión de Activos</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      </div>

      {/* Assets Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {assets.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center p-12">
            <Monitor className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No se encontraron activos</h3>
            <p className="text-gray-400 text-center">
              {searchTerm
                ? `No hay activos que coincidan con "${searchTerm}"`
                : 'No hay activos registrados en el sistema'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left text-gray-300">
                <thead className="border-b border-gray-700 bg-gray-750">
                  <tr className="text-gray-400 uppercase text-sm">
                    <th className="py-4 px-6">Código Inventario</th>
                    <th className="py-4 px-6">Tipo</th>
                    <th className="py-4 px-6">Marca / Modelo</th>
                    <th className="py-4 px-6">Estado</th>
                    <th className="py-4 px-6">Departamento</th>
                    <th className="py-4 px-6">Empleado Asignado</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr
                      key={asset.inventory_code}
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6 font-medium text-white">
                        {asset.inventory_code}
                      </td>
                      <td className="py-4 px-6">
                        <TypeBadge type={asset.asset_type} />
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-white font-medium">{asset.brand}</span>
                          <span className="text-gray-400 text-sm">{asset.model}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <StatusBadge status={asset.status} />
                      </td>
                      <td className="py-4 px-6">
                        {asset.department ? asset.department.name : (
                          <span className="text-gray-500 italic">Sin departamento</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {asset.employee ? asset.employee.full_name : (
                          <span className="text-gray-500 italic">No asignado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={pagination.count}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Loading overlay for subsequent loads */}
      {loading && assets.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-white">Cargando...</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default Assets;
