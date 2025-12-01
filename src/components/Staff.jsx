import { useState, useEffect, useCallback } from 'react';
import { UserCog, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, Filter, X, Save, Edit2 } from 'lucide-react';
import axiosInstance from '../axiosConfig';

const RoleBadge = ({ role }) => {
  const colors = {
    ADMIN: 'bg-red-500/20 text-red-400',
    TECHNICIAN: 'bg-blue-500/20 text-blue-400',
  };

  const labels = {
    ADMIN: 'Administrador',
    TECHNICIAN: 'Técnico',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[role] || 'bg-gray-500/20 text-gray-400'}`}>
      {labels[role] || role}
    </span>
  );
};

// Staff User Detail Modal with Edit functionality
const StaffDetailModal = ({ user, onClose, onUpdate, onUserUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    role: user?.role || 'TECHNICIAN',
    is_active: user?.is_active ?? true,
  });

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const updateData = {
        username: formData.username,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        role: formData.role,
        is_active: formData.is_active,
      };

      await axiosInstance.patch(`/users/${user.id}/`, updateData);

      // Refresh the list
      onUpdate();

      // Re-fetch the full user details to update the modal
      const response = await axiosInstance.get(`/users/${user.id}/`);

      // Update the selectedUser through a callback
      if (onUserUpdated) {
        onUserUpdated(response.data);
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Error updating user:', err);
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Error al actualizar el usuario');
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
              Detalle de Usuario IT
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {user.username}
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

          {/* Información de Cuenta */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Información de Cuenta</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Username</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="username"
                  />
                ) : (
                  <p className="text-white font-medium font-mono">{user.username}</p>
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
                    placeholder="email@universidad.cl"
                  />
                ) : (
                  <p className="text-white font-medium">{user.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Nombre</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Juan"
                  />
                ) : (
                  <p className="text-white font-medium">{user.first_name || <span className="text-gray-500 italic">Sin especificar</span>}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Apellido</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="González"
                  />
                ) : (
                  <p className="text-white font-medium">{user.last_name || <span className="text-gray-500 italic">Sin especificar</span>}</p>
                )}
              </div>
            </div>
          </div>

          {/* Permisos y Estado */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Permisos y Estado</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Rol</label>
                {isEditing ? (
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="TECHNICIAN">Técnico</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                ) : (
                  <div className="mt-1">
                    <RoleBadge role={user.role} />
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Estado de la Cuenta</label>
                {isEditing ? (
                  <select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                  </select>
                ) : (
                  <div className="mt-1">
                    {user.is_active ? (
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                        Activo
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold">
                        Inactivo
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="col-span-2">
                <label className="text-sm text-gray-400">Fecha de Registro</label>
                <p className="text-white font-medium">{user.date_joined ? formatDate(user.date_joined) : 'N/A'}</p>
              </div>
              {user.last_login && (
                <div className="col-span-2">
                  <label className="text-sm text-gray-400">Último Acceso</label>
                  <p className="text-white font-medium">{formatDate(user.last_login)}</p>
                </div>
              )}
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
                    username: user.username,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role,
                    is_active: user.is_active,
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

  return (
    <div className="flex items-center justify-between py-4 px-6 bg-gray-800 border-t border-gray-700">
      <div className="text-sm text-gray-400">
        Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} de {totalCount} usuarios
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronsLeft className="w-5 h-5" />
        </button>
        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronLeft className="w-5 h-5" />
        </button>
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-4 py-2 rounded-lg font-medium ${page === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            {page}
          </button>
        ))}
        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronRight className="w-5 h-5" />
        </button>
        <button onClick={() => onPageChange(totalPages)} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
          <ChevronsRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const Staff = () => {
  // Set page title
  useEffect(() => {
    document.title = 'Personal IT - SIGAT';
    return () => {
      document.title = 'SIGAT';
    };
  }, []);

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ count: 0 });
  const [selectedUser, setSelectedUser] = useState(null);
  const pageSize = 10;

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString()
      });
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole) params.append('role', filterRole);

      const response = await axiosInstance.get(`/users/?${params.toString()}`);
      setStaff(response.data.results);
      setPagination({ count: response.data.count });
      setError(null);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError('Error al cargar el personal IT');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, filterRole]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  useEffect(() => {
    if (currentPage !== 1) setCurrentPage(1);
  }, [searchTerm, filterRole]);

  const handleRowClick = async (userId) => {
    try {
      // Fetch full user details
      const response = await axiosInstance.get(`/users/${userId}/`);
      setSelectedUser(response.data);
    } catch (err) {
      console.error('Error fetching user details:', err);
    }
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
  };

  const handleUpdate = () => {
    fetchStaff();
    setSelectedUser(null);
  };

  if (loading && staff.length === 0) {
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
      <h1 className="text-3xl font-bold text-white mb-6">Personal del Área IT</h1>

      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por username o email..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="relative">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="appearance-none bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Rol</option>
            <option value="ADMIN">Administrador</option>
            <option value="TECHNICIAN">Técnico</option>
          </select>
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {(searchTerm || filterRole) && (
          <button
            onClick={() => { setSearchTerm(''); setFilterRole(''); }}
            className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {staff.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12">
            <UserCog className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No se encontró personal</h3>
            <p className="text-gray-400">
              {searchTerm || filterRole
                ? 'No hay personal que coincida con los filtros seleccionados'
                : 'No hay personal IT registrado en el sistema'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-gray-300">
                <thead className="border-b border-gray-700 bg-gray-750">
                  <tr className="text-gray-400 uppercase text-sm">
                    <th className="py-4 px-6">Username</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Rol</th>
                    <th className="py-4 px-6">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => handleRowClick(user.id)}
                      className="border-b border-gray-700 hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-6 font-medium text-white">{user.username}</td>
                      <td className="py-4 px-6 text-gray-300">{user.email}</td>
                      <td className="py-4 px-6"><RoleBadge role={user.role} /></td>
                      <td className="py-4 px-6">
                        {user.is_active ? (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
                            Activo
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold">
                            Inactivo
                          </span>
                        )}
                      </td>
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

      {/* Staff Detail Modal */}
      {selectedUser && (
        <StaffDetailModal
          user={selectedUser}
          onClose={handleCloseModal}
          onUpdate={handleUpdate}
          onUserUpdated={setSelectedUser}
        />
      )}
    </main>
  );
};

export default Staff;
