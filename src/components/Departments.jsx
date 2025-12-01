import { useState, useEffect } from 'react';
import { Building2, Loader2, Plus, X, Edit2, Trash2, AlertTriangle, Save, Package, ExternalLink } from 'lucide-react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

// Create Department Modal
const CreateDepartmentModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await axiosInstance.post('/departments/', {
        name: formData.name,
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating department:', err);

      // Format validation errors for display
      if (err.response?.data) {
        const errors = err.response.data;
        let errorMessage = '';

        if (typeof errors === 'object' && !errors.detail) {
          // Field-specific errors
          errorMessage = Object.entries(errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join(' | ');
        } else {
          errorMessage = errors.detail || JSON.stringify(errors);
        }

        setError(errorMessage || 'Error al crear el departamento');
      } else {
        setError('Error al crear el departamento');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Añadir Nuevo Departamento</h2>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-700 rounded-lg">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del Departamento *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Recursos Humanos, Informática, etc."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Crear Departamento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Asset Type and Status Badges (reused from other components)
const AssetTypeBadge = ({ type }) => {
  const colors = {
    NOTEBOOK: 'bg-blue-500/20 text-blue-400',
    DESKTOP: 'bg-green-500/20 text-green-400',
    MONITOR: 'bg-purple-500/20 text-purple-400',
    PRINTER: 'bg-orange-500/20 text-orange-400',
    OTHER: 'bg-gray-500/20 text-gray-400',
  };

  const labels = {
    NOTEBOOK: 'Notebook',
    DESKTOP: 'Desktop',
    MONITOR: 'Monitor',
    PRINTER: 'Impresora',
    OTHER: 'Otro',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[type] || 'bg-gray-500/20 text-gray-400'}`}>
      {labels[type] || type}
    </span>
  );
};

const AssetStatusBadge = ({ status }) => {
  const colors = {
    BODEGA: 'bg-gray-500/20 text-gray-400',
    ASIGNADO: 'bg-green-500/20 text-green-400',
    REPARACION: 'bg-yellow-500/20 text-yellow-400',
    DE_BAJA: 'bg-red-500/20 text-red-400',
  };

  const labels = {
    BODEGA: 'En Bodega',
    ASIGNADO: 'Asignado',
    REPARACION: 'En Reparación',
    DE_BAJA: 'De Baja',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {labels[status] || status}
    </span>
  );
};

// Department Detail Modal with Edit and Delete functionality
const DepartmentDetailModal = ({ department, onClose, onUpdate, onDepartmentUpdated, isAdmin }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [departmentAssets, setDepartmentAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [formData, setFormData] = useState({
    name: department?.name || '',
  });

  if (!department) return null;

  // Fetch department assets
  useEffect(() => {
    const fetchDepartmentAssets = async () => {
      try {
        setLoadingAssets(true);
        const response = await axiosInstance.get(`/assets/?department=${department.id}`);
        setDepartmentAssets(response.data.results || []);
      } catch (err) {
        console.error('Error fetching department assets:', err);
        setDepartmentAssets([]);
      } finally {
        setLoadingAssets(false);
      }
    };

    fetchDepartmentAssets();
  }, [department.id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await axiosInstance.put(`/departments/${department.id}/`, {
        name: formData.name,
      });

      // Refresh the list
      onUpdate();

      // Re-fetch the full department details to update the modal
      const response = await axiosInstance.get(`/departments/${department.id}/`);

      // Update the selectedDepartment through a callback
      if (onDepartmentUpdated) {
        onDepartmentUpdated(response.data);
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Error updating department:', err);
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Error al actualizar el departamento');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await axiosInstance.delete(`/departments/${department.id}/`);
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error deleting department:', err);
      setError(err.response?.data?.detail || 'Error al eliminar el departamento. Puede que tenga empleados o assets asignados.');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
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
              Detalle de Departamento
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {department.name}
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

          {/* Delete Confirmation */}
          {showDeleteConfirm && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-semibold">
                <AlertTriangle className="w-5 h-5" />
                <span>¿Confirmas la eliminación de este departamento?</span>
              </div>
              <p className="text-gray-300 text-sm">
                Se eliminarán las asignaciones de <span className="font-bold text-white">{department.employee_count || 0} empleado(s)</span> y <span className="font-bold text-white">{department.asset_count || 0} asset(s)</span>.
              </p>
              <p className="text-red-400 text-sm font-semibold">
                Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Confirmar Eliminación
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Información del Departamento */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Información del Departamento</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Nombre</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nombre del departamento"
                  />
                ) : (
                  <p className="text-white font-medium text-xl">{department.name}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Fecha de Creación</label>
                <p className="text-white font-medium">{department.created_at ? formatDate(department.created_at) : 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Empleados</label>
                <span className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-semibold inline-block">
                  {department.employee_count || 0} empleado(s)
                </span>
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Assets</label>
                <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm font-semibold inline-block">
                  {department.asset_count || 0} asset(s)
                </span>
              </div>
            </div>
          </div>

          {/* Assets del Departamento */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                Assets del Departamento ({departmentAssets.length})
              </h3>
            </div>

            {loadingAssets ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : departmentAssets.length === 0 ? (
              <div className="bg-gray-700/30 rounded-lg p-6 text-center">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Este departamento no tiene assets asignados actualmente</p>
              </div>
            ) : (
              <div className="bg-gray-700/30 rounded-lg overflow-hidden">
                <table className="w-full text-left text-gray-300">
                  <thead className="border-b border-gray-600 bg-gray-700/50">
                    <tr className="text-gray-400 uppercase text-xs">
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Tipo</th>
                      <th className="py-3 px-4">Marca / Modelo</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {departmentAssets.map((asset) => (
                      <tr
                        key={asset.inventory_code}
                        onClick={() => window.open(`/assets?highlight=${asset.inventory_code}`, '_blank')}
                        className="border-b border-gray-600 hover:bg-gray-700/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-sm text-blue-400 font-medium">
                          {asset.inventory_code}
                        </td>
                        <td className="py-3 px-4">
                          <AssetTypeBadge type={asset.asset_type} />
                        </td>
                        <td className="py-3 px-4 text-white">
                          {asset.brand} {asset.model}
                        </td>
                        <td className="py-3 px-4">
                          <AssetStatusBadge status={asset.status} />
                        </td>
                        <td className="py-3 px-4">
                          <ExternalLink className="w-4 h-4 text-gray-400" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
                Eliminar Departamento
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={saving || deleting}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cerrar
            </button>
            {isAdmin && (
              isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({ name: department.name });
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
                  disabled={showDeleteConfirm}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Edit2 className="w-4 h-4" />
                  Editar
                </button>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Departments = () => {
  const { user } = useAuth();

  // Set page title
  useEffect(() => {
    document.title = 'Departamentos - SIGAT';
    return () => {
      document.title = 'SIGAT';
    };
  }, []);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get('/departments/?limit=100');
        // Handle both paginated and non-paginated responses
        const deptData = response.data.results || response.data;
        setDepartments(Array.isArray(deptData) ? deptData : []);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleRowClick = async (department) => {
    setSelectedDepartment(department);
  };

  const handleUpdate = async () => {
    try {
      const response = await axiosInstance.get('/departments/?limit=100');
      const deptData = response.data.results || response.data;
      setDepartments(Array.isArray(deptData) ? deptData : []);
    } catch (err) {
      console.error('Error refreshing departments:', err);
    }
  };

  if (loading) {
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
        <h1 className="text-3xl font-bold text-white">Gestión de Departamentos</h1>
        {isAdmin && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Añadir Departamento
          </button>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Building2 className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No hay departamentos</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-gray-300">
              <thead className="border-b border-gray-700 bg-gray-750">
                <tr className="text-gray-400 uppercase text-sm">
                  <th className="py-4 px-6">Nombre</th>
                  <th className="py-4 px-6"># Empleados</th>
                  <th className="py-4 px-6"># Assets</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr
                    key={dept.id}
                    onClick={() => handleRowClick(dept)}
                    className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6 font-medium text-white">{dept.name}</td>
                    <td className="py-4 px-6 text-center">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                        {dept.employee_count || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                        {dept.asset_count || 0}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Department Modal */}
      {showCreateModal && (
        <CreateDepartmentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            handleUpdate();
          }}
        />
      )}

      {/* Department Detail Modal */}
      {selectedDepartment && (
        <DepartmentDetailModal
          department={selectedDepartment}
          onClose={() => setSelectedDepartment(null)}
          onUpdate={handleUpdate}
          onDepartmentUpdated={setSelectedDepartment}
          isAdmin={isAdmin}
        />
      )}
    </main>
  );
};

export default Departments;
