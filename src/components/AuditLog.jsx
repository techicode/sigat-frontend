import { useState, useEffect } from 'react';
import { FileText, Loader2, X, ChevronLeft, ChevronRight, Filter, Eye } from 'lucide-react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

// Detail Modal to view full JSON details
const AuditLogDetailModal = ({ log, onClose }) => {
  if (!log) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Detalle de Auditoría</h2>
            <p className="text-sm text-gray-400 mt-1">
              {formatDate(log.timestamp)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Información Básica</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Usuario</label>
                <p className="text-white font-medium">
                  {log.system_user?.full_name || log.system_user?.username || 'N/A'}
                </p>
                <p className="text-sm text-gray-400">
                  @{log.system_user?.username || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Acción</label>
                <ActionBadge action={log.action} />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Tabla</label>
                <p className="text-white font-medium font-mono text-sm">{log.target_table}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">ID del Registro</label>
                <p className="text-white font-medium font-mono">{log.target_id}</p>
              </div>
            </div>
          </div>

          {/* Detalles JSON */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Detalles (JSON)</h3>
            {log.details ? (
              <pre className="bg-gray-900 border border-gray-700 rounded-lg p-4 text-sm text-gray-300 overflow-x-auto">
                {JSON.stringify(log.details, null, 2)}
              </pre>
            ) : (
              <div className="bg-gray-700/30 rounded-lg p-6 text-center">
                <p className="text-gray-400">No hay detalles adicionales</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Action Badge Component
const ActionBadge = ({ action }) => {
  const colors = {
    CREATE: 'bg-green-500/20 text-green-400',
    UPDATE: 'bg-blue-500/20 text-blue-400',
    DELETE: 'bg-red-500/20 text-red-400',
    READ: 'bg-gray-500/20 text-gray-400',
  };

  const labels = {
    CREATE: 'Crear',
    UPDATE: 'Actualizar',
    DELETE: 'Eliminar',
    READ: 'Leer',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors[action] || 'bg-purple-500/20 text-purple-400'}`}>
      {labels[action] || action}
    </span>
  );
};

const AuditLog = () => {
  const { user } = useAuth();

  // Set page title
  useEffect(() => {
    document.title = 'Registro de Auditoría - SIGAT';
    return () => {
      document.title = 'SIGAT';
    };
  }, []);

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    action: '',
    target_table: '',
    system_user: '',
    date_from: '',
    date_to: '',
    search: '',
  });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) {
      return;
    }
    fetchAuditLogs();
  }, [currentPage, isAdmin]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);

      // Build query params
      const params = new URLSearchParams();
      params.append('page', currentPage);

      if (filters.action) params.append('action', filters.action);
      if (filters.target_table) params.append('target_table', filters.target_table);
      if (filters.system_user) params.append('system_user', filters.system_user);
      if (filters.date_from) params.append('date_from', new Date(filters.date_from).toISOString());
      if (filters.date_to) params.append('date_to', new Date(filters.date_to).toISOString());
      if (filters.search) params.append('search', filters.search);

      const response = await axiosInstance.get(`/audit-logs/?${params.toString()}`);

      setLogs(response.data.results || []);
      setTotalCount(response.data.count || 0);
      setTotalPages(Math.ceil((response.data.count || 0) / 10));
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchAuditLogs();
  };

  const handleClearFilters = () => {
    setFilters({
      action: '',
      target_table: '',
      system_user: '',
      date_from: '',
      date_to: '',
      search: '',
    });
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-400 mb-2">Acceso Denegado</h2>
          <p className="text-gray-300">Solo los administradores pueden acceder al registro de auditoría.</p>
        </div>
      </main>
    );
  }

  if (loading && logs.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gray-900 p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Registro de Auditoría</h1>
          <p className="text-gray-400 mt-1">Historial completo de cambios en el sistema</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            showFilters
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <Filter className="w-5 h-5" />
          Filtros
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-6 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Filtrar Registros</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Acción</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas</option>
                <option value="CREATE">Crear</option>
                <option value="UPDATE">Actualizar</option>
                <option value="DELETE">Eliminar</option>
                <option value="READ">Leer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tabla</label>
              <input
                type="text"
                value={filters.target_table}
                onChange={(e) => setFilters(prev => ({ ...prev, target_table: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ej: assets_asset"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Búsqueda</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar en detalles..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Desde</label>
              <input
                type="datetime-local"
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Hasta</label>
              <input
                type="datetime-local"
                value={filters.date_to}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={handleApplyFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Aplicar Filtros
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
        <p className="text-gray-400">
          Mostrando <span className="font-semibold text-white">{logs.length}</span> de <span className="font-semibold text-white">{totalCount}</span> registros totales
        </p>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <FileText className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No hay registros</h3>
            <p className="text-gray-400">No se encontraron registros de auditoría con los filtros aplicados</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-300">
                <thead className="border-b border-gray-700 bg-gray-750">
                  <tr className="text-gray-400 uppercase text-sm">
                    <th className="py-4 px-6">Fecha/Hora</th>
                    <th className="py-4 px-6">Usuario</th>
                    <th className="py-4 px-6">Acción</th>
                    <th className="py-4 px-6">Tabla</th>
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-4 px-6 text-sm">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-white">
                            {log.system_user?.full_name || log.system_user?.username || 'N/A'}
                          </p>
                          <p className="text-xs text-gray-400">@{log.system_user?.username || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <ActionBadge action={log.action} />
                      </td>
                      <td className="py-4 px-6 font-mono text-sm">
                        {log.target_table}
                      </td>
                      <td className="py-4 px-6 font-mono text-sm text-blue-400">
                        {log.target_id}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                          title="Ver detalles completos"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-700">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>

                <span className="text-gray-400">
                  Página <span className="font-semibold text-white">{currentPage}</span> de <span className="font-semibold text-white">{totalPages}</span>
                </span>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages || loading}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <AuditLogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </main>
  );
};

export default AuditLog;
