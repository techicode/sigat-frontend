import { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Filter, X, Save, Edit2, ExternalLink } from 'lucide-react';
import axiosInstance from '../axiosConfig';

const StatusBadge = ({ status }) => {
  const colors = {
    NUEVA: 'bg-orange-500/20 text-orange-400',
    EN_REVISION: 'bg-blue-500/20 text-blue-400',
    RESUELTA: 'bg-green-500/20 text-green-400',
    FALSO_POSITIVO: 'bg-gray-500/20 text-gray-400',
  };

  const labels = {
    NUEVA: 'Nueva',
    EN_REVISION: 'En Revisión',
    RESUELTA: 'Resuelta',
    FALSO_POSITIVO: 'Falso Positivo',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {labels[status] || status}
    </span>
  );
};

const getRelativeTime = (dateString) => {
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
      <div className="text-sm text-gray-400">Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} de {totalCount} advertencias</div>
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

// Warning Detail Modal with Edit functionality
const WarningDetailModal = ({ warning, onClose, onUpdate, onWarningUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    status: warning?.status || 'NUEVA',
    resolution_notes: warning?.resolution_notes || '',
  });

  if (!warning) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updateData = {
        status: formData.status,
        resolution_notes: formData.resolution_notes,
      };

      await axiosInstance.patch(`/compliance-warnings/${warning.id}/`, updateData);

      // Refresh the list
      onUpdate();

      // Re-fetch the full warning details to update the modal
      const response = await axiosInstance.get(`/compliance-warnings/${warning.id}/`);

      // Update the selectedWarning through a callback
      if (onWarningUpdated) {
        onWarningUpdated(response.data);
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Error updating warning:', err);
      setError(err.response?.data?.detail || 'Error al actualizar la advertencia');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Detalle de Advertencia #{warning.id}
            </h2>
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
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Información del Activo */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Activo Asociado</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Código de Inventario</label>
                {warning.asset?.inventory_code ? (
                  <a
                    href={`/assets?highlight=${warning.asset.inventory_code}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors group"
                  >
                    {warning.asset.inventory_code}
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <p className="text-white font-medium">N/A</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400">Marca y Modelo</label>
                <p className="text-white font-medium">
                  {warning.asset?.brand && warning.asset?.model
                    ? `${warning.asset.brand} ${warning.asset.model}`
                    : warning.asset?.brand || warning.asset?.model || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Información de la Advertencia */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Detalles de la Advertencia</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Categoría</label>
                <p className="text-white font-medium">{warning.category}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Fecha de Detección</label>
                <p className="text-white font-medium">{formatDate(warning.detection_date)}</p>
              </div>
              {warning.evidence && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-400">Evidencia</label>
                  <pre className="text-white font-mono text-sm bg-gray-700/50 p-3 rounded-lg mt-1 overflow-x-auto">
                    {JSON.stringify(warning.evidence, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Estado y Resolución */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Estado y Resolución</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Estado</label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NUEVA">Nueva</option>
                    <option value="EN_REVISION">En Revisión</option>
                    <option value="RESUELTA">Resuelta</option>
                    <option value="FALSO_POSITIVO">Falso Positivo</option>
                  </select>
                ) : (
                  <StatusBadge status={warning.status} />
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400">Atendido Por</label>
                <p className="text-white font-medium">
                  {warning.resolved_by?.full_name || <span className="text-gray-500 italic">Pendiente</span>}
                </p>
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400 block mb-2">Notas de Resolución</label>
                {isEditing ? (
                  <textarea
                    value={formData.resolution_notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, resolution_notes: e.target.value }))}
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Agregar notas sobre la resolución de esta advertencia..."
                  />
                ) : (
                  <p className="text-white font-medium bg-gray-700/50 p-3 rounded-lg">
                    {warning.resolution_notes || <span className="text-gray-500 italic">Sin notas</span>}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cerrar
          </button>
          {isEditing ? (
            <>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    status: warning.status,
                    resolution_notes: warning.resolution_notes || '',
                  });
                  setError(null);
                }}
                disabled={saving}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Cambios
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Warnings = () => {
  // Set page title
  useEffect(() => {
    document.title = 'Advertencias de Cumplimiento - SIGAT';
    return () => {
      document.title = 'SIGAT';
    };
  }, []);

  // Read 'active' parameter from URL BEFORE initializing state
  const getInitialFilters = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const activeParam = urlParams.get('active');
    const statusParam = urlParams.get('status');

    // If specific status is provided in URL
    if (statusParam) {
      return { isActive: false, filterStatus: statusParam };
    }

    // If active=true is provided, or by DEFAULT show active warnings
    if (activeParam === 'true' || !statusParam) {
      // Clean URL without reloading
      window.history.replaceState({}, '', '/warnings');
      return { isActive: true, filterStatus: '' };
    }

    return { isActive: false, filterStatus: '' };
  };

  const initialFilters = getInitialFilters();

  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState(initialFilters.filterStatus);
  const [isActiveFilter, setIsActiveFilter] = useState(initialFilters.isActive);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ count: 0 });
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    active: 0,
    nueva: 0,
    en_revision: 0,
    resuelta: 0,
    falso_positivo: 0,
    total: 0
  });
  const pageSize = 10;

  // Fetch status counts for tabs
  const fetchStatusCounts = useCallback(async () => {
    try {
      const [activeRes, nuevaRes, revisionRes, resueltaRes, falsoRes, totalRes] = await Promise.all([
        axiosInstance.get('/compliance-warnings/?active=true&page_size=1'),
        axiosInstance.get('/compliance-warnings/?status=NUEVA&page_size=1'),
        axiosInstance.get('/compliance-warnings/?status=EN_REVISION&page_size=1'),
        axiosInstance.get('/compliance-warnings/?status=RESUELTA&page_size=1'),
        axiosInstance.get('/compliance-warnings/?status=FALSO_POSITIVO&page_size=1'),
        axiosInstance.get('/compliance-warnings/?page_size=1'),
      ]);

      setStatusCounts({
        active: activeRes.data.count || 0,
        nueva: nuevaRes.data.count || 0,
        en_revision: revisionRes.data.count || 0,
        resuelta: resueltaRes.data.count || 0,
        falso_positivo: falsoRes.data.count || 0,
        total: totalRes.data.count || 0,
      });
    } catch (err) {
      console.error('Error fetching status counts:', err);
    }
  }, []);

  const fetchWarnings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });
      if (searchTerm) params.append('search', searchTerm);

      // Use 'active' filter or individual status filter
      if (isActiveFilter) {
        params.append('active', 'true');
      } else if (filterStatus) {
        params.append('status', filterStatus);
      }

      const response = await axiosInstance.get(`/compliance-warnings/?${params.toString()}`);
      setWarnings(response.data.results);
      setPagination({ count: response.data.count });
      setError(null);
    } catch (err) {
      console.error('Error fetching warnings:', err);
      setError('Error al cargar las advertencias');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus, isActiveFilter, pageSize]);

  useEffect(() => {
    fetchWarnings();
  }, [fetchWarnings]);

  useEffect(() => {
    fetchStatusCounts();
  }, [fetchStatusCounts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const handleRowClick = async (warningId) => {
    try {
      // Fetch full warning details
      const response = await axiosInstance.get(`/compliance-warnings/${warningId}/`);
      setSelectedWarning(response.data);
    } catch (err) {
      console.error('Error fetching warning details:', err);
    }
  };

  const handleCloseModal = () => {
    setSelectedWarning(null);
  };

  const handleUpdate = () => {
    fetchWarnings();
    fetchStatusCounts(); // Update counts after warning status change
    setSelectedWarning(null);
  };

  if (loading && warnings.length === 0) {
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
      <h1 className="text-3xl font-bold text-white mb-6">Advertencias de Cumplimiento</h1>

      {/* Status Filter Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setIsActiveFilter(true);
            setFilterStatus('');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            isActiveFilter
              ? 'bg-orange-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Activas
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            isActiveFilter ? 'bg-white/20' : 'bg-gray-600'
          }`}>
            {statusCounts.active}
          </span>
        </button>

        <button
          onClick={() => {
            setIsActiveFilter(false);
            setFilterStatus('');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            !isActiveFilter && !filterStatus
              ? 'bg-blue-500 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Todas
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            !isActiveFilter && !filterStatus ? 'bg-white/20' : 'bg-gray-600'
          }`}>
            {statusCounts.total}
          </span>
        </button>

        <div className="w-px bg-gray-600"></div>

        <button
          onClick={() => {
            setIsActiveFilter(false);
            setFilterStatus('NUEVA');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            filterStatus === 'NUEVA'
              ? 'bg-orange-500/20 text-orange-400 border border-orange-500'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Nueva
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            filterStatus === 'NUEVA' ? 'bg-orange-500/30' : 'bg-gray-600'
          }`}>
            {statusCounts.nueva}
          </span>
        </button>

        <button
          onClick={() => {
            setIsActiveFilter(false);
            setFilterStatus('EN_REVISION');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            filterStatus === 'EN_REVISION'
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          En Revisión
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            filterStatus === 'EN_REVISION' ? 'bg-blue-500/30' : 'bg-gray-600'
          }`}>
            {statusCounts.en_revision}
          </span>
        </button>

        <button
          onClick={() => {
            setIsActiveFilter(false);
            setFilterStatus('RESUELTA');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            filterStatus === 'RESUELTA'
              ? 'bg-green-500/20 text-green-400 border border-green-500'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Resuelta
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            filterStatus === 'RESUELTA' ? 'bg-green-500/30' : 'bg-gray-600'
          }`}>
            {statusCounts.resuelta}
          </span>
        </button>

        <button
          onClick={() => {
            setIsActiveFilter(false);
            setFilterStatus('FALSO_POSITIVO');
          }}
          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            filterStatus === 'FALSO_POSITIVO'
              ? 'bg-gray-500/20 text-gray-400 border border-gray-500'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Falso Positivo
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            filterStatus === 'FALSO_POSITIVO' ? 'bg-gray-500/30' : 'bg-gray-600'
          }`}>
            {statusCounts.falso_positivo}
          </span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por activo..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {warnings.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <AlertTriangle className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No se encontraron advertencias</h3>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-300">
                <thead className="border-b border-gray-700 bg-gray-750">
                  <tr className="text-gray-400 uppercase text-sm">
                    <th className="py-4 px-6">Activo</th>
                    <th className="py-4 px-6">Categoría</th>
                    <th className="py-4 px-6">Estado</th>
                    <th className="py-4 px-6">Fecha Detección</th>
                    <th className="py-4 px-6">Atendido Por</th>
                  </tr>
                </thead>
                <tbody>
                  {warnings.map((warning) => (
                    <tr
                      key={warning.id}
                      onClick={() => handleRowClick(warning.id)}
                      className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-white">{warning.asset?.inventory_code || 'N/A'}</td>
                      <td className="py-4 px-6">{warning.category}</td>
                      <td className="py-4 px-6"><StatusBadge status={warning.status} /></td>
                      <td className="py-4 px-6 text-gray-400">{getRelativeTime(warning.detection_date)}</td>
                      <td className="py-4 px-6">{warning.resolved_by?.full_name || <span className="text-gray-500 italic">Pendiente</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination currentPage={currentPage} totalPages={Math.ceil(pagination.count / pageSize)} totalCount={pagination.count} pageSize={pageSize} onPageChange={setCurrentPage} />
          </>
        )}
      </div>

      {/* Warning Detail Modal */}
      {selectedWarning && (
        <WarningDetailModal
          warning={selectedWarning}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
          onWarningUpdated={setSelectedWarning}
        />
      )}
    </main>
  );
};

export default Warnings;
export { WarningDetailModal };
