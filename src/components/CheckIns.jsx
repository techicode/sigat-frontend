import { useState, useEffect, useCallback } from 'react';
import { ClipboardCheck, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Filter, X, RefreshCw, Copy, CheckCircle2, ExternalLink } from 'lucide-react';
import axiosInstance from '../axiosConfig';

const StatusBadge = ({ status }) => {
  const colors = {
    PENDIENTE: 'bg-yellow-500/20 text-yellow-400',
    COMPLETADO: 'bg-green-500/20 text-green-400',
  };

  const labels = {
    PENDIENTE: 'Pendiente',
    COMPLETADO: 'Completado',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {labels[status] || status}
    </span>
  );
};

const getRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Hoy';
  if (diffInDays === 1) return 'Ayer';
  if (diffInDays < 7) return `Hace ${diffInDays} días`;
  if (diffInDays < 30) return `Hace ${Math.floor(diffInDays / 7)} semanas`;
  return `Hace ${Math.floor(diffInDays / 30)} meses`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const Pagination = ({ currentPage, totalPages, totalCount, pageSize, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  const handlePageChange = (newPage) => {
    onPageChange(newPage);
  };

  return (
    <div className="flex items-center justify-between py-4 px-6 bg-gray-800 border-t border-gray-700">
      <div className="text-sm text-gray-400">Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} de {totalCount} check-ins</div>
      <div className="flex items-center gap-2">
        <button onClick={() => handlePageChange(1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsLeft className="w-5 h-5" /></button>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-5 h-5" /></button>
        {getPageNumbers().map((page) => (
          <button key={page} onClick={() => handlePageChange(page)} className={`px-4 py-2 rounded-lg font-medium ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{page}</button>
        ))}
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-5 h-5" /></button>
        <button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronsRight className="w-5 h-5" /></button>
      </div>
    </div>
  );
};

const CheckInURLModal = ({ checkin, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!checkin) return null;

  const checkinUrl = `${window.location.origin}/checkin/${checkin.unique_token}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(checkinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-blue-400" />
            URL de Check-in
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Asset</label>
            <p className="text-white">{checkin.asset?.inventory_code} - {checkin.asset?.model || 'N/A'}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Empleado</label>
            <p className="text-white">{checkin.employee?.full_name}</p>
            {checkin.employee?.email && <p className="text-gray-400 text-sm">{checkin.employee.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">URL única de check-in</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={checkinUrl}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white font-mono text-sm"
              />
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado' : 'Copiar'}
              </button>
              <a
                href={checkinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir
              </a>
            </div>
            <p className="text-xs text-gray-500 mt-2">Esta URL permite al empleado completar el check-in sin necesidad de iniciar sesión.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Estado</label>
            <StatusBadge status={checkin.status} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Solicitud enviada</label>
              <p className="text-white text-sm">{formatDate(checkin.requested_at)}</p>
              <p className="text-gray-400 text-xs">{getRelativeTime(checkin.requested_at)}</p>
            </div>
            {checkin.completed_at && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Completado</label>
                <p className="text-white text-sm">{formatDate(checkin.completed_at)}</p>
                <p className="text-gray-400 text-xs">{getRelativeTime(checkin.completed_at)}</p>
              </div>
            )}
          </div>

          {checkin.status === 'COMPLETADO' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Estado Físico</label>
                <p className="text-white">{checkin.physical_state || 'N/A'}</p>
              </div>
              {checkin.performance_satisfaction && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Satisfacción de Rendimiento</label>
                  <p className="text-white">{checkin.performance_satisfaction}/5</p>
                </div>
              )}
              {checkin.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Notas</label>
                  <p className="text-white bg-gray-700 p-3 rounded-lg">{checkin.notes}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const CheckIns = () => {
  // Set page title
  useEffect(() => {
    document.title = 'Check-ins de Activos - SIGAT';
    return () => {
      document.title = 'SIGAT';
    };
  }, []);

  const [checkins, setCheckins] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedCheckin, setSelectedCheckin] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState(null);
  const pageSize = 20;

  const fetchStats = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/asset-checkins/stats/');
      setStats(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }, []);

  const fetchCheckins = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('page_size', pageSize);
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axiosInstance.get(`/asset-checkins/?${params.toString()}`);

      setCheckins(response.data.results || []);
      setTotalCount(response.data.count || 0);
    } catch (error) {
      console.error('Error al cargar check-ins:', error);
      setError('Error al cargar los check-ins');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter]);

  useEffect(() => {
    fetchCheckins();
    fetchStats();
  }, [fetchCheckins, fetchStats]);

  const handleGenerateCheckins = async () => {
    if (!confirm('¿Estás seguro de que deseas generar check-ins para todos los empleados con assets asignados?')) {
      return;
    }

    setGenerating(true);
    try {
      const response = await axiosInstance.post('/asset-checkins/generate/');
      alert(`${response.data.message}\n\nEn un entorno productivo, se enviarían correos electrónicos automáticamente. Para fines de demostración, puedes acceder a las URLs desde la tabla.`);
      fetchCheckins();
      fetchStats();
    } catch (error) {
      console.error('Error al generar check-ins:', error);
      const errorMsg = error.response?.data?.detail || 'Error al generar check-ins';
      alert(errorMsg);
    } finally {
      setGenerating(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ClipboardCheck className="w-8 h-8 text-blue-400" />
            Check-ins de Assets
          </h1>
          <p className="text-gray-400 mt-2">Gestiona y monitorea las verificaciones periódicas de assets por parte de los empleados</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Check-ins</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
              </div>
              <ClipboardCheck className="w-12 h-12 text-blue-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.pending}</p>
              </div>
              <Loader2 className="w-12 h-12 text-yellow-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium">Completados</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.completed}</p>
              </div>
              <CheckCircle2 className="w-12 h-12 text-green-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 flex-1 w-full">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por asset o empleado..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3">
                  <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      value={statusFilter}
                      onChange={handleStatusFilterChange}
                      className="pl-10 pr-8 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                      <option value="">Todos los estados</option>
                      <option value="PENDIENTE">Pendiente</option>
                      <option value="COMPLETADO">Completado</option>
                    </select>
                  </div>

                  {(searchTerm || statusFilter) && (
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Limpiar
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={fetchCheckins}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Actualizar
                </button>
                <button
                  onClick={handleGenerateCheckins}
                  disabled={generating}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <ClipboardCheck className="w-4 h-4" />}
                  {generating ? 'Generando...' : 'Generar Check-ins'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 text-red-400">
              <X className="w-12 h-12 mb-4" />
              <p>{error}</p>
            </div>
          ) : checkins.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <ClipboardCheck className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No hay check-ins generados</p>
              <p className="text-sm mt-2">Haz clic en "Generar Check-ins" para crear solicitudes de verificación</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Asset</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Empleado</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Solicitado</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Completado</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {checkins.map((checkin) => (
                      <tr key={checkin.id} className="hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-white font-medium">{checkin.asset?.inventory_code}</div>
                          <div className="text-gray-400 text-sm">{checkin.asset?.model || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-white">{checkin.employee?.full_name}</div>
                          {checkin.employee?.email && (
                            <div className="text-gray-400 text-sm">{checkin.employee.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={checkin.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-white text-sm">{formatDate(checkin.requested_at)}</div>
                          <div className="text-gray-400 text-xs">{getRelativeTime(checkin.requested_at)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {checkin.completed_at ? (
                            <>
                              <div className="text-white text-sm">{formatDate(checkin.completed_at)}</div>
                              <div className="text-gray-400 text-xs">{getRelativeTime(checkin.completed_at)}</div>
                            </>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedCheckin(checkin)}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm flex items-center gap-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Ver URL
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>

      {/* URL Modal */}
      {selectedCheckin && (
        <CheckInURLModal
          checkin={selectedCheckin}
          onClose={() => setSelectedCheckin(null)}
        />
      )}
    </div>
  );
};

export default CheckIns;
