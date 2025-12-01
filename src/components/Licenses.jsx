import { useState, useEffect, useCallback } from 'react';
import {
  Key,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  Plus,
  X,
  Edit2,
  Trash2,
  Save,
  Calendar,
  Eye,
  EyeOff,
  Monitor,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

// Expiration Status Badge
const ExpirationBadge = ({ expirationDate }) => {
  if (!expirationDate) {
    return <span className="text-gray-500 italic">Sin expiración</span>;
  }

  const now = new Date();
  const expDate = new Date(expirationDate);
  const daysUntilExpiration = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));

  let color = 'bg-green-500/20 text-green-400 border-green-500';
  let label = 'Válida';

  if (daysUntilExpiration < 0) {
    color = 'bg-red-500/20 text-red-400 border-red-500';
    label = 'Expirada';
  } else if (daysUntilExpiration <= 30) {
    color = 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
    label = 'Por vencer';
  } else if (daysUntilExpiration <= 90) {
    color = 'bg-blue-500/20 text-blue-400 border-blue-500';
    label = 'Válida';
  }

  return (
    <div className="flex flex-col gap-1">
      <span className={`px-2 py-1 rounded text-xs font-semibold border ${color} w-fit`}>
        {label}
      </span>
      <span className="text-xs text-gray-400">
        {expDate.toLocaleDateString('es-CL')}
      </span>
    </div>
  );
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
        placeholder="Buscar licencias por software..."
        autoComplete="off"
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
        Mostrando {startItem} - {endItem} de {totalCount} licencias
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>
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
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// License Detail Modal (View/Edit/Delete)
const LicenseDetailModal = ({ license, onClose, onUpdate, onLicenseUpdated, onDelete, softwareList, isAdmin }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [showFullKey, setShowFullKey] = useState(false);
  const [eligibleAssets, setEligibleAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [assignError, setAssignError] = useState(null);
  const [formData, setFormData] = useState({
    software_id: license?.software?.id || '',
    license_key: '',
    purchase_date: license?.purchase_date || '',
    expiration_date: license?.expiration_date || '',
    quantity: license?.quantity || 1,
  });

  // Load full license data when editing
  useEffect(() => {
    if (license && isEditing) {
      const fetchFullLicense = async () => {
        try {
          const response = await axiosInstance.get(`/licenses/${license.id}/`);
          setFormData(prev => ({
            ...prev,
            license_key: response.data.license_key || '',
          }));
        } catch (err) {
          console.error('Error fetching license key:', err);
        }
      };
      fetchFullLicense();
    }
  }, [license, isEditing]);

  // Load eligible assets when modal opens
  useEffect(() => {
    if (license) {
      fetchEligibleAssets();
    }
  }, [license?.id]);

  const fetchEligibleAssets = async () => {
    setLoadingAssets(true);
    try {
      const response = await axiosInstance.get(`/licenses/${license.id}/eligible_assets/`);
      setEligibleAssets(response.data || []);
    } catch (err) {
      console.error('Error fetching eligible assets:', err);
      setAssignError('Error al cargar los assets');
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleAssignLicense = async (installedSoftwareId) => {
    setAssignError(null);
    try {
      const response = await axiosInstance.post(`/licenses/${license.id}/assign/`, {
        installed_software_id: installedSoftwareId
      });

      // Refresh assets and update license data
      await fetchEligibleAssets();
      onUpdate();
    } catch (err) {
      console.error('Error assigning license:', err);
      setAssignError(err.response?.data?.error || 'Error al asignar la licencia');
    }
  };

  const handleUnassignLicense = async (installedSoftwareId) => {
    setAssignError(null);
    try {
      const response = await axiosInstance.post(`/licenses/${license.id}/unassign/`, {
        installed_software_id: installedSoftwareId
      });

      // Refresh assets and update license data
      await fetchEligibleAssets();
      onUpdate();
    } catch (err) {
      console.error('Error unassigning license:', err);
      setAssignError(err.response?.data?.error || 'Error al desasignar la licencia');
    }
  };

  const handleSave = async () => {
    if (!formData.software_id) {
      setError('Debes seleccionar un software');
      return;
    }

    if (formData.quantity < 1) {
      setError('La cantidad debe ser al menos 1');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        software_id: parseInt(formData.software_id),
        license_key: formData.license_key || '',
        purchase_date: formData.purchase_date || null,
        expiration_date: formData.expiration_date || null,
        quantity: parseInt(formData.quantity),
      };

      await axiosInstance.patch(`/licenses/${license.id}/`, payload);

      // Refresh the list
      onUpdate();

      // Re-fetch the full license details to update the modal
      const response = await axiosInstance.get(`/licenses/${license.id}/`);

      // Update the selectedLicense through a callback
      if (onLicenseUpdated) {
        onLicenseUpdated(response.data);
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Error saving license:', err);
      setError(err.response?.data?.detail || 'Error al guardar la licencia');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await axiosInstance.delete(`/licenses/${license.id}/`);
      onDelete();
      onClose();
    } catch (err) {
      console.error('Error deleting license:', err);
      setError('Error al eliminar la licencia');
    } finally {
      setDeleting(false);
    }
  };

  if (!license) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Detalle de Licencia #{license.id}
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {license.software?.name}
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
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Software Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Software</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400">Nombre</label>
                <p className="text-white font-medium">{license.software?.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400">Desarrollador</label>
                <p className="text-white font-medium">{license.software?.developer || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* License Details */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Información de la Licencia</h3>
            {isEditing ? (
              <form autoComplete="off" className="space-y-4">
                {/* License Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Clave de Licencia
                  </label>
                  <div className="relative">
                    <input
                      type={showFullKey ? "text" : "password"}
                      name="license_key_edit"
                      value={formData.license_key}
                      onChange={(e) => setFormData({ ...formData, license_key: e.target.value })}
                      placeholder="Sin clave"
                      autoComplete="new-password"
                      data-form-type="other"
                      className="w-full px-3 py-2 pr-10 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                    {formData.license_key && (
                      <button
                        type="button"
                        onClick={() => setShowFullKey(!showFullKey)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                        title={showFullKey ? "Ocultar clave" : "Mostrar clave"}
                      >
                        {showFullKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Fecha de Compra
                    </label>
                    <input
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                      autoComplete="off"
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Fecha de Expiración
                    </label>
                    <input
                      type="date"
                      value={formData.expiration_date}
                      onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                      autoComplete="off"
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Cantidad de Licencias <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    autoComplete="off"
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Clave de Licencia</label>
                  <p className="text-white font-mono text-sm">
                    {license.license_key_display || 'Sin clave'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Cantidad Total</label>
                  <p className="text-white font-medium">{license.quantity}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">En Uso</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    license.in_use_count > license.quantity
                      ? 'bg-red-500/20 text-red-400'
                      : license.in_use_count === license.quantity
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}>
                    {license.in_use_count || 0}
                  </span>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Disponibles</label>
                  <p className="text-white font-medium">{license.quantity - (license.in_use_count || 0)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Fecha de Compra</label>
                  <p className="text-white font-medium">
                    {license.purchase_date ? (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(license.purchase_date).toLocaleDateString('es-CL')}
                      </div>
                    ) : (
                      <span className="text-gray-500 italic">No registrada</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Expiración</label>
                  <div className="mt-1">
                    <ExpirationBadge expirationDate={license.expiration_date} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Assets with this software section */}
          {!isEditing && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Monitor className="w-5 h-5" />
                Assets con este software
              </h3>

              {assignError && (
                <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm mb-4">
                  {assignError}
                </div>
              )}

              {loadingAssets ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-400">Cargando assets...</span>
                </div>
              ) : eligibleAssets.length === 0 ? (
                <div className="bg-gray-700/50 rounded-lg p-6 text-center">
                  <Monitor className="w-12 h-12 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400">No hay assets asignados a empleados con este software instalado</p>
                  <p className="text-xs text-gray-500 mt-2">Solo se muestran assets con dueño asignado</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-gray-400 mb-2">
                    {eligibleAssets.filter(a => a.has_license).length} de {eligibleAssets.length} assets tienen licencia asignada
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {eligibleAssets.map((asset) => (
                      <div
                        key={asset.installed_software_id}
                        className="bg-gray-700/50 rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-sm text-blue-400 font-semibold">
                              {asset.inventory_code}
                            </span>
                            <span className="text-white">
                              {asset.brand} {asset.model}
                            </span>
                            {asset.version && (
                              <span className="text-sm text-gray-400">
                                v{asset.version}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-400">Asignado a:</span>
                            <span className="text-white font-medium">{asset.employee_name}</span>
                            <span className="text-gray-500">({asset.employee_rut})</span>
                          </div>
                          {asset.has_license && (
                            <div className="flex items-center gap-2 mt-2">
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-xs text-gray-400">
                                Licencia: {asset.license_assigned}
                              </span>
                            </div>
                          )}
                        </div>

                        {isAdmin && (
                          <div className="ml-4">
                            {asset.has_license ? (
                              <button
                                onClick={() => handleUnassignLicense(asset.installed_software_id)}
                                className="px-3 py-1 bg-red-500/20 text-red-400 border border-red-500 rounded-lg hover:bg-red-500/30 transition-colors text-sm flex items-center gap-1"
                                title="Desasignar licencia"
                              >
                                <XCircle className="w-4 h-4" />
                                Desasignar
                              </button>
                            ) : (
                              <button
                                onClick={() => handleAssignLicense(asset.installed_software_id)}
                                className="px-3 py-1 bg-green-500/20 text-green-400 border border-green-500 rounded-lg hover:bg-green-500/30 transition-colors text-sm flex items-center gap-1"
                                title="Asignar esta licencia"
                                disabled={license.in_use_count >= license.quantity}
                              >
                                <CheckCircle className="w-4 h-4" />
                                Asignar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div>
            {isAdmin && !isEditing && !showDeleteConfirm && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Licencia
              </button>
            )}
            {showDeleteConfirm && (
              <div className="flex items-center gap-3">
                <span className="text-red-400 text-sm">¿Estás seguro?</span>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 text-sm"
                >
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setError(null);
                    setShowFullKey(false);
                  }}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Guardar
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cerrar
                </button>
                {isAdmin && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// License Form Modal (Create only)
const LicenseFormModal = ({ onClose, onSave, softwareList }) => {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showFullKey, setShowFullKey] = useState(false);
  const [formData, setFormData] = useState({
    software_id: '',
    license_key: '',
    purchase_date: '',
    expiration_date: '',
    quantity: 1,
  });

  const handleSave = async () => {
    if (!formData.software_id) {
      setError('Debes seleccionar un software');
      return;
    }

    if (formData.quantity < 1) {
      setError('La cantidad debe ser al menos 1');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        software_id: parseInt(formData.software_id),
        license_key: formData.license_key || '',
        purchase_date: formData.purchase_date || null,
        expiration_date: formData.expiration_date || null,
        quantity: parseInt(formData.quantity),
      };

      await axiosInstance.post('/licenses/', payload);
      onSave();
    } catch (err) {
      console.error('Error saving license:', err);
      setError(err.response?.data?.detail || 'Error al guardar la licencia');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Nueva Licencia</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Modal Content */}
        <form autoComplete="off" onSubmit={(e) => e.preventDefault()} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Software Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Software <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.software_id}
              onChange={(e) => setFormData({ ...formData, software_id: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              autoComplete="off"
            >
              <option value="">Seleccionar software...</option>
              {softwareList.map((sw) => (
                <option key={sw.id} value={sw.id}>
                  {sw.name} - {sw.developer}
                </option>
              ))}
            </select>
          </div>

          {/* License Key */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Clave de Licencia
            </label>
            <div className="relative">
              <input
                type={showFullKey ? "text" : "password"}
                name="license_key_create"
                value={formData.license_key}
                onChange={(e) => setFormData({ ...formData, license_key: e.target.value })}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                autoComplete="new-password"
                data-form-type="other"
                className="w-full px-3 py-2 pr-10 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono"
              />
              {formData.license_key && (
                <button
                  type="button"
                  onClick={() => setShowFullKey(!showFullKey)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white transition-colors"
                  title={showFullKey ? "Ocultar clave" : "Mostrar clave"}
                >
                  {showFullKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Opcional. La clave siempre se mostrará censurada en la lista por seguridad.
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Fecha de Compra
              </label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                autoComplete="off"
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Fecha de Expiración
              </label>
              <input
                type="date"
                value={formData.expiration_date}
                onChange={(e) => setFormData({ ...formData, expiration_date: e.target.value })}
                autoComplete="off"
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Cantidad de Licencias <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              autoComplete="off"
              className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Licenses Component
const Licenses = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Set page title
  useEffect(() => {
    document.title = 'Licencias - SIGAT';
    return () => {
      document.title = 'SIGAT';
    };
  }, []);

  const [licenses, setLicenses] = useState([]);
  const [softwareList, setSoftwareList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLicense, setSelectedLicense] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  const pageSize = 20;

  // Fetch software list for the form
  useEffect(() => {
    const fetchSoftware = async () => {
      try {
        const response = await axiosInstance.get('/software-catalog/?limit=1000');
        setSoftwareList(response.data.results || []);
      } catch (err) {
        console.error('Error fetching software:', err);
      }
    };
    fetchSoftware();
  }, []);

  const fetchLicenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (showAvailableOnly) params.append('available', 'true');

      const response = await axiosInstance.get(`/licenses/?${params.toString()}`);

      setLicenses(response.data.results || []);
      setPagination({
        count: response.data.count || 0,
        next: response.data.next,
        previous: response.data.previous,
      });
    } catch (err) {
      console.error('Error fetching licenses:', err);
      setError('Error al cargar las licencias. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, showAvailableOnly]);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  const totalPages = Math.ceil(pagination.count / pageSize);

  const handleAddLicense = () => {
    setShowCreateModal(true);
  };

  const handleFormSave = () => {
    setShowCreateModal(false);
    fetchLicenses();
  };

  const handleLicenseClick = async (license) => {
    try {
      const response = await axiosInstance.get(`/licenses/${license.id}/`);
      setSelectedLicense(response.data);
    } catch (err) {
      console.error('Error fetching license details:', err);
    }
  };

  if (loading && licenses.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Cargando licencias...</p>
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
            onClick={fetchLicenses}
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
        <div>
          <h1 className="text-3xl font-bold text-white">Gestión de Licencias</h1>
          <p className="text-gray-400 mt-1">
            Administra las licencias de software de la organización
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={handleAddLicense}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Agregar Licencia
          </button>
        )}
      </div>

      <div className="mb-6 flex gap-4 items-center">
        <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        <label className="flex items-center gap-2 px-4 py-2 bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-600 transition-colors whitespace-nowrap">
          <input
            type="checkbox"
            checked={showAvailableOnly}
            onChange={(e) => setShowAvailableOnly(e.target.checked)}
            className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-white text-sm font-medium">Solo Disponibles</span>
        </label>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {licenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Key className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No se encontraron licencias</h3>
            <p className="text-gray-400 text-center mb-4">
              {searchTerm
                ? 'No hay licencias que coincidan con tu búsqueda'
                : 'No hay licencias registradas en el sistema'}
            </p>
            {isAdmin && !searchTerm && (
              <button
                onClick={handleAddLicense}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Agregar Primera Licencia
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-300">
                <thead className="border-b border-gray-700 bg-gray-750">
                  <tr className="text-gray-400 uppercase text-sm">
                    <th className="py-4 px-6">Software</th>
                    <th className="py-4 px-6">Clave</th>
                    <th className="py-4 px-6 text-center">Cantidad</th>
                    <th className="py-4 px-6 text-center">En Uso</th>
                    <th className="py-4 px-6">Fecha de Compra</th>
                    <th className="py-4 px-6">Expiración</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map((license) => (
                    <tr
                      key={license.id}
                      onClick={() => handleLicenseClick(license)}
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-medium text-white">{license.software?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-400">{license.software?.developer || ''}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-sm text-gray-400">
                          {license.license_key_display || 'Sin clave'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                          {license.quantity}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          license.in_use_count > license.quantity
                            ? 'bg-red-500/20 text-red-400'
                            : license.in_use_count === license.quantity
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-green-500/20 text-green-400'
                        }`}>
                          {license.in_use_count || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm">
                        {license.purchase_date ? (
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar className="w-4 h-4" />
                            {new Date(license.purchase_date).toLocaleDateString('es-CL')}
                          </div>
                        ) : (
                          <span className="text-gray-500 italic">No registrada</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <ExpirationBadge expirationDate={license.expiration_date} />
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

      {/* Detail Modal */}
      {selectedLicense && (
        <LicenseDetailModal
          license={selectedLicense}
          onClose={() => setSelectedLicense(null)}
          onUpdate={fetchLicenses}
          onLicenseUpdated={setSelectedLicense}
          onDelete={fetchLicenses}
          softwareList={softwareList}
          isAdmin={isAdmin}
        />
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <LicenseFormModal
          onClose={() => setShowCreateModal(false)}
          onSave={handleFormSave}
          softwareList={softwareList}
        />
      )}

      {/* Loading Overlay */}
      {loading && licenses.length > 0 && (
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

export default Licenses;
