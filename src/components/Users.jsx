import { useState, useEffect } from 'react';
import { Users as UsersIcon, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Filter, Plus, X, Save, Edit2, Package, ExternalLink } from 'lucide-react';
import axiosInstance from '../axiosConfig';

// Asset Type and Status Badges
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
      <div className="text-sm text-gray-400">Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} de {totalCount} empleados</div>
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

// Employee Detail Modal with Edit functionality
const EmployeeDetailModal = ({ employee, onClose, onUpdate, onEmployeeUpdated, departments }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [employeeAssets, setEmployeeAssets] = useState([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [formData, setFormData] = useState({
    rut: employee?.rut || '',
    first_name: employee?.first_name || '',
    last_name: employee?.last_name || '',
    email: employee?.email || '',
    position: employee?.position || '',
    department_id: employee?.department?.id || '',
  });

  if (!employee) return null;

  // Fetch employee assets
  useEffect(() => {
    const fetchEmployeeAssets = async () => {
      try {
        setLoadingAssets(true);
        const response = await axiosInstance.get(`/assets/?employee=${employee.id}`);
        setEmployeeAssets(response.data.results || []);
      } catch (err) {
        console.error('Error fetching employee assets:', err);
        setEmployeeAssets([]);
      } finally {
        setLoadingAssets(false);
      }
    };

    fetchEmployeeAssets();
  }, [employee.id]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updateData = {
        rut: formData.rut,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        position: formData.position,
      };

      if (formData.department_id) {
        updateData.department_id = parseInt(formData.department_id);
      }

      await axiosInstance.patch(`/employees/${employee.id}/`, updateData);

      // Refresh the list
      onUpdate();

      // Re-fetch the full employee details to update the modal
      const response = await axiosInstance.get(`/employees/${employee.id}/`);

      // Update the selectedEmployee through a callback
      if (onEmployeeUpdated) {
        onEmployeeUpdated(response.data);
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Error updating employee:', err);
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Error al actualizar el empleado');
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
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Detalle de Empleado
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {employee.full_name}
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

          {/* Información Personal */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Información Personal</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">RUT</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.rut}
                    onChange={(e) => setFormData(prev => ({ ...prev, rut: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="12.345.678-9"
                  />
                ) : (
                  <p className="text-white font-medium font-mono">{employee.rut}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="nombre@universidad.cl"
                  />
                ) : (
                  <p className="text-white font-medium">{employee.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Nombre(s)</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Juan Carlos"
                  />
                ) : (
                  <p className="text-white font-medium">{employee.first_name}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Apellido(s)</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="González Pérez"
                  />
                ) : (
                  <p className="text-white font-medium">{employee.last_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Información Laboral */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Información Laboral</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Cargo</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Analista, Profesor, etc."
                  />
                ) : (
                  <p className="text-white font-medium">
                    {employee.position || <span className="text-gray-500 italic">Sin especificar</span>}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Departamento</label>
                {isEditing ? (
                  <select
                    value={formData.department_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, department_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sin departamento</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-white font-medium">
                    {employee.department ? (
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-semibold">
                        {employee.department.name}
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">Sin departamento</span>
                    )}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400">Fecha de Registro</label>
                <p className="text-white font-medium">{formatDate(employee.created_at)}</p>
              </div>
            </div>
          </div>

          {/* Assets Asignados */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">
                Assets Asignados ({employeeAssets.length})
              </h3>
            </div>

            {loadingAssets ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : employeeAssets.length === 0 ? (
              <div className="bg-gray-700/30 rounded-lg p-6 text-center">
                <Package className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">Este empleado no tiene assets asignados actualmente</p>
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
                    {employeeAssets.map((asset) => (
                      <tr
                        key={asset.id}
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
                    rut: employee.rut,
                    first_name: employee.first_name,
                    last_name: employee.last_name,
                    email: employee.email,
                    position: employee.position || '',
                    department_id: employee.department?.id || '',
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

// Create Employee Modal
const CreateEmployeeModal = ({ onClose, onSuccess, departments }) => {
  const [formData, setFormData] = useState({
    rut: '',
    first_name: '',
    last_name: '',
    email: '',
    position: '',
    department_id: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const dataToSend = {
        rut: formData.rut,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        position: formData.position,
      };

      if (formData.department_id) {
        dataToSend.department_id = parseInt(formData.department_id);
      }

      await axiosInstance.post('/employees/', dataToSend);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating employee:', err);
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Error al crear el empleado');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Añadir Nuevo Empleado</h2>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">RUT *</label>
                <input
                  type="text"
                  value={formData.rut}
                  onChange={(e) => setFormData(prev => ({ ...prev, rut: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="12.345.678-9"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="nombre@universidad.cl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre(s) *</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Juan Carlos"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Apellido(s) *</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="González Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cargo</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Analista, Profesor, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Departamento</label>
                <select
                  value={formData.department_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, department_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin departamento</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
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
                'Crear Empleado'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Users = () => {
  // Set page title
  useEffect(() => {
    document.title = 'Empleados - SIGAT';
    return () => {
      document.title = 'SIGAT';
    };
  }, []);

  // Read highlight parameter from URL BEFORE initializing state
  const getInitialSearchTerm = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const highlightParam = urlParams.get('highlight');
    if (highlightParam) {
      // Clean URL without reloading
      window.history.replaceState({}, '', '/users');
      return highlightParam;
    }
    return '';
  };

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(getInitialSearchTerm());
  const [filterDepartment, setFilterDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ count: 0 });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isFromHighlight, setIsFromHighlight] = useState(!!getInitialSearchTerm());
  const pageSize = 10;

  // Fetch departments for filter
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axiosInstance.get('/departments/?limit=100');
        const deptData = response.data.results || response.data;
        setDepartments(Array.isArray(deptData) ? deptData : []);
      } catch (err) {
        console.error('Error fetching departments:', err);
        setDepartments([]);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: pageSize.toString()
        });
        if (searchTerm) params.append('search', searchTerm);
        if (filterDepartment) params.append('department', filterDepartment);

        const response = await axiosInstance.get(`/employees/?${params.toString()}`);
        setEmployees(response.data.results);
        setPagination({ count: response.data.count });
        setError(null);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Error al cargar los empleados');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [currentPage, searchTerm, filterDepartment, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterDepartment]);

  // Auto-open modal if highlight search returns exactly 1 result
  useEffect(() => {
    if (isFromHighlight && employees.length === 1 && !loading) {
      // Fetch full details and open modal
      const fetchAndOpenEmployee = async () => {
        try {
          const response = await axiosInstance.get(`/employees/${employees[0].id}/`);
          setSelectedEmployee(response.data);
          setIsFromHighlight(false); // Reset flag
        } catch (err) {
          console.error('Error fetching employee details:', err);
          setIsFromHighlight(false);
        }
      };
      fetchAndOpenEmployee();
    } else if (isFromHighlight && employees.length !== 1 && !loading) {
      // If not exactly 1 result, just reset the flag
      setIsFromHighlight(false);
    }
  }, [employees, isFromHighlight, loading]);

  const handleRowClick = async (employeeId) => {
    try {
      // Fetch full employee details
      const response = await axiosInstance.get(`/employees/${employeeId}/`);
      setSelectedEmployee(response.data);
    } catch (err) {
      console.error('Error fetching employee details:', err);
    }
  };

  const handleCloseModal = () => {
    setSelectedEmployee(null);
  };

  const handleUpdate = async () => {
    // Refresh the list
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString()
      });
      if (searchTerm) params.append('search', searchTerm);
      if (filterDepartment) params.append('department', filterDepartment);

      const response = await axiosInstance.get(`/employees/?${params.toString()}`);
      setEmployees(response.data.results);
      setPagination({ count: response.data.count });
      setError(null);
      setSelectedEmployee(null);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError('Error al cargar los empleados');
    } finally {
      setLoading(false);
    }
  };

  if (loading && employees.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
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
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-gray-900 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-white">Gestión de Empleados</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Añadir Empleado
        </button>
      </div>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, RUT o email..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="appearance-none bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Departamento</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {(searchTerm || filterDepartment) && (
          <button
            onClick={() => { setSearchTerm(''); setFilterDepartment(''); }}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {employees.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <UsersIcon className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No se encontraron empleados</h3>
            <p className="text-gray-400">
              {searchTerm || filterDepartment
                ? 'No hay empleados que coincidan con los filtros seleccionados'
                : 'No hay empleados registrados en el sistema'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-300">
                <thead className="border-b border-gray-700 bg-gray-750">
                  <tr className="text-gray-400 uppercase text-sm">
                    <th className="py-4 px-6">RUT</th>
                    <th className="py-4 px-6">Nombre Completo</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Departamento</th>
                    <th className="py-4 px-6">Cargo</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr
                      key={employee.id}
                      onClick={() => handleRowClick(employee.id)}
                      className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 font-mono text-sm text-blue-400">{employee.rut}</td>
                      <td className="py-4 px-6 font-medium text-white">{employee.full_name}</td>
                      <td className="py-4 px-6 text-gray-300">{employee.email}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs font-semibold">
                          {employee.department?.name || 'Sin departamento'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-300">{employee.position || <span className="text-gray-500 italic">-</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(pagination.count / pageSize)}
              totalCount={pagination.count}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Create Employee Modal */}
      {showCreateModal && (
        <CreateEmployeeModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            window.location.reload();
          }}
          departments={departments}
        />
      )}

      {/* Employee Detail Modal */}
      {selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
          onEmployeeUpdated={setSelectedEmployee}
          departments={departments}
        />
      )}
    </main>
  );
};

export default Users;
