import { useState, useEffect, useCallback } from 'react';
import {
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  X,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Shield,
  ShieldAlert,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

// Severity badge colors
const SEVERITY_COLORS = {
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
  LOW: 'bg-blue-500/20 text-blue-400 border-blue-500',
};

// Search Bar Component
const SearchBar = ({ searchTerm, onSearchChange }) => {
  const [localSearch, setLocalSearch] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Buscar por nombre o desarrollador..."
        className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, totalCount, pageSize, onPageChange }) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

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
        Mostrando {startItem} - {endItem} de {totalCount} aplicaciones
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Primera página"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Página anterior"
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
          title="Página siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Última página"
        >
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// Software Detail Modal with Vulnerabilities
const SoftwareDetailModal = ({ software, onClose, onUpdate, isAdmin }) => {
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVulnForm, setShowVulnForm] = useState(false);
  const [editingVuln, setEditingVuln] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    cve_id: '',
    title: '',
    description: '',
    severity: 'MEDIUM',
    affected_versions: '',
    safe_version_from: '',
    link_to_details: '',
  });

  useEffect(() => {
    fetchSoftwareDetail();
  }, [software.id]);

  const fetchSoftwareDetail = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/software-catalog/${software.id}/`);
      setVulnerabilities(response.data.software_vulnerabilities || []);
    } catch (err) {
      console.error('Error fetching software detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVulnerability = () => {
    setEditingVuln(null);
    setFormData({
      cve_id: '',
      title: '',
      description: '',
      severity: 'MEDIUM',
      affected_versions: '',
      safe_version_from: '',
      link_to_details: '',
    });
    setShowVulnForm(true);
  };

  const handleEditVulnerability = (vuln) => {
    setEditingVuln(vuln);
    setFormData({
      cve_id: vuln.cve_id || '',
      title: vuln.title,
      description: vuln.description || '',
      severity: vuln.severity,
      affected_versions: vuln.affected_versions || '',
      safe_version_from: vuln.safe_version_from,
      link_to_details: vuln.link_to_details || '',
    });
    setShowVulnForm(true);
  };

  const handleSaveVulnerability = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        software: software.id,
      };

      if (editingVuln) {
        await axiosInstance.put(`/vulnerabilities/${editingVuln.id}/`, payload);
      } else {
        await axiosInstance.post('/vulnerabilities/', payload);
      }

      await fetchSoftwareDetail();
      setShowVulnForm(false);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error saving vulnerability:', err);
      alert('Error al guardar la vulnerabilidad');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVulnerability = async (vulnId) => {
    if (!confirm('¿Estás seguro de eliminar esta vulnerabilidad?')) return;

    try {
      await axiosInstance.delete(`/vulnerabilities/${vulnId}/`);
      await fetchSoftwareDetail();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Error deleting vulnerability:', err);
      alert('Error al eliminar la vulnerabilidad');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Package className="w-6 h-6" />
              {software.name}
            </h2>
            <p className="text-gray-400 text-sm mt-1">{software.developer}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Instalaciones</p>
              <p className="text-2xl font-bold text-white">{software.installed_count || 0}</p>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <p className="text-gray-400 text-sm">Licencias</p>
              <p className="text-2xl font-bold text-white">{software.license_count || 0}</p>
            </div>
          </div>

          {/* Vulnerabilities Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                Vulnerabilidades Conocidas
              </h3>
              {isAdmin && (
                <button
                  onClick={handleAddVulnerability}
                  className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Vulnerabilidad
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
              </div>
            ) : vulnerabilities.length === 0 ? (
              <div className="bg-gray-700/30 rounded-lg p-8 text-center">
                <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-white font-medium">No hay vulnerabilidades conocidas</p>
                <p className="text-gray-400 text-sm mt-1">
                  Este software no tiene vulnerabilidades registradas
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {vulnerabilities.map((vuln) => (
                  <div
                    key={vuln.id}
                    className="bg-gray-700/30 rounded-lg p-4 border-l-4 border-orange-500"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold border ${
                              SEVERITY_COLORS[vuln.severity] || SEVERITY_COLORS.MEDIUM
                            }`}
                          >
                            {vuln.severity}
                          </span>
                          {vuln.cve_id && (
                            <span className="text-gray-400 text-sm font-mono">{vuln.cve_id}</span>
                          )}
                        </div>
                        <h4 className="text-white font-semibold">{vuln.title}</h4>
                        {vuln.description && (
                          <p className="text-gray-400 text-sm mt-1">{vuln.description}</p>
                        )}
                        <div className="mt-2 text-sm">
                          <p className="text-gray-400">
                            <span className="text-gray-500">Versión segura desde:</span>{' '}
                            <span className="text-green-400 font-mono font-semibold">
                              {vuln.safe_version_from}
                            </span>
                          </p>
                          {vuln.affected_versions && (
                            <p className="text-gray-400">
                              <span className="text-gray-500">Versiones afectadas:</span>{' '}
                              <span className="text-orange-400">{vuln.affected_versions}</span>
                            </p>
                          )}
                        </div>
                        {vuln.link_to_details && (
                          <a
                            href={vuln.link_to_details}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-flex items-center gap-1"
                          >
                            Ver detalles <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditVulnerability(vuln)}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteVulnerability(vuln.id)}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vulnerability Form */}
          {showVulnForm && isAdmin && (
            <div className="mt-6 bg-gray-700/50 rounded-lg p-6 border border-gray-600">
              <h4 className="text-lg font-semibold text-white mb-4">
                {editingVuln ? 'Editar Vulnerabilidad' : 'Nueva Vulnerabilidad'}
              </h4>
              <form onSubmit={handleSaveVulnerability} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      CVE ID (Opcional)
                    </label>
                    <input
                      type="text"
                      name="cve_id"
                      value={formData.cve_id}
                      onChange={handleInputChange}
                      placeholder="CVE-2024-1234"
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Severidad <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="severity"
                      value={formData.severity}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="CRITICAL">Crítica</option>
                      <option value="HIGH">Alta</option>
                      <option value="MEDIUM">Media</option>
                      <option value="LOW">Baja</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Título <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Ej: Ejecución remota de código"
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe la vulnerabilidad..."
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Versión Segura Desde <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="safe_version_from"
                      value={formData.safe_version_from}
                      onChange={handleInputChange}
                      required
                      placeholder="Ej: 2.5.0"
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Primera versión sin esta vulnerabilidad
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Versiones Afectadas
                    </label>
                    <input
                      type="text"
                      name="affected_versions"
                      value={formData.affected_versions}
                      onChange={handleInputChange}
                      placeholder="Ej: < 2.5.0"
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Link a Detalles
                  </label>
                  <input
                    type="url"
                    name="link_to_details"
                    value={formData.link_to_details}
                    onChange={handleInputChange}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowVulnForm(false)}
                    disabled={saving}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? 'Guardando...' : editingVuln ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Software Component
const Software = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Set page title
  useEffect(() => {
    document.title = 'Software - SIGAT';
    return () => {
      document.title = 'SIGAT';
    };
  }, []);

  const [software, setSoftware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });
  const [selectedSoftware, setSelectedSoftware] = useState(null);
  const [scanning, setScanning] = useState(false);

  const pageSize = 20;

  const fetchSoftware = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);

      const response = await axiosInstance.get(`/software-catalog/?${params.toString()}`);

      setSoftware(response.data.results);
      setPagination({
        count: response.data.count,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (err) {
      console.error('Error fetching software:', err);
      setError('Error al cargar el catálogo de software. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    fetchSoftware();
  }, [fetchSoftware]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const handleScanVulnerabilities = async () => {
    if (!confirm('¿Escanear todas las instalaciones y generar advertencias para software vulnerable?')) {
      return;
    }

    setScanning(true);
    try {
      const response = await axiosInstance.post('/vulnerabilities/scan/');
      alert(response.data.message);
      await fetchSoftware();
    } catch (err) {
      console.error('Error scanning vulnerabilities:', err);
      alert('Error al escanear vulnerabilidades');
    } finally {
      setScanning(false);
    }
  };

  const totalPages = Math.ceil(pagination.count / pageSize);

  if (loading && software.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Cargando catálogo...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center max-w-md mx-auto mt-8">
          <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={fetchSoftware}
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Catálogo de Software</h1>
        {isAdmin && (
          <button
            onClick={handleScanVulnerabilities}
            disabled={scanning}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {scanning ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Escaneando...
              </>
            ) : (
              <>
                <RefreshCw className="w-5 h-5" />
                Escanear Vulnerabilidades
              </>
            )}
          </button>
        )}
      </div>

      <div className="mb-6">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {software.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Package className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No se encontró software</h3>
            <p className="text-gray-400 text-center">
              {searchTerm
                ? `No hay software que coincida con "${searchTerm}"`
                : 'No hay software registrado en el catálogo'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left text-gray-300">
                <thead className="border-b border-gray-700 bg-gray-750">
                  <tr className="text-gray-400 uppercase text-sm">
                    <th className="py-4 px-6">Nombre</th>
                    <th className="py-4 px-6">Desarrollador</th>
                    <th className="py-4 px-6"># Instalaciones</th>
                    <th className="py-4 px-6"># Licencias</th>
                  </tr>
                </thead>
                <tbody>
                  {software.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => setSelectedSoftware(item)}
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6 font-medium text-white">{item.name}</td>
                      <td className="py-4 px-6 text-gray-300">{item.developer}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                          {item.installed_count || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                          {item.license_count || 0}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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

      {loading && software.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
            <p className="text-white">Cargando...</p>
          </div>
        </div>
      )}

      {selectedSoftware && (
        <SoftwareDetailModal
          software={selectedSoftware}
          onClose={() => setSelectedSoftware(null)}
          onUpdate={fetchSoftware}
          isAdmin={isAdmin}
        />
      )}
    </main>
  );
};

export default Software;
