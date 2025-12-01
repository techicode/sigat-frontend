import { useState, useEffect, useCallback } from 'react';
import {
  Monitor,
  Laptop,
  Printer,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
  X,
  Filter,
  Plus,
  ExternalLink,
  Edit2,
  Trash2,
  Save,
  AlertTriangle,
  Cpu,
  HardDrive,
  Gpu,
  MemoryStick,
  ChevronDown,
  Package,
} from 'lucide-react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

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
  EN_BODEGA: 'bg-gray-500 text-white',
  ASIGNADO: 'bg-green-500 text-white',
  EN_REPARACION: 'bg-yellow-500 text-black',
  DE_BAJA: 'bg-red-500 text-white',
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const colorClass = STATUS_COLORS[status] || 'bg-gray-600 text-white';
  const displayStatus = {
    EN_BODEGA: 'En Bodega',
    ASIGNADO: 'Asignado',
    EN_REPARACION: 'En Reparación',
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
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={localSearch}
        onChange={(e) => setLocalSearch(e.target.value)}
        placeholder="Buscar por código, serial, marca, modelo, departamento..."
        className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
};

// Filter Dropdown Component
const FilterDropdown = ({ label, value, options, onChange }) => {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
      >
        <option value="">{label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
        {/* First Page Button */}
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Primera página"
        >
          <ChevronsLeft className="w-5 h-5" />
        </button>

        {/* Previous Page Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Página anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page Numbers */}
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

        {/* Next Page Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Página siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Last Page Button */}
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

// Asset Detail Modal
// Create Asset Modal
const CreateAssetModal = ({ onClose, onSuccess, departments, employees }) => {
  const [formData, setFormData] = useState({
    inventory_code: '',
    serial_number: '',
    asset_type: 'MONITOR',
    brand: '',
    model: '',
    status: 'EN_BODEGA',  // Valor correcto del backend
    department_id: '',
    employee_id: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

  // Filter employees based on search term
  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.rut?.toLowerCase().includes(employeeSearch.toLowerCase()) ||
    emp.email?.toLowerCase().includes(employeeSearch.toLowerCase())
  ).slice(0, 50); // Limit to 50 results for performance

  const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employee_id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const dataToSend = {
        inventory_code: formData.inventory_code,
        serial_number: formData.serial_number,
        asset_type: formData.asset_type,
        brand: formData.brand,
        model: formData.model,
        status: formData.status,
      };

      if (formData.department_id) {
        dataToSend.department_id = parseInt(formData.department_id);
      }
      if (formData.employee_id) {
        dataToSend.employee_id = parseInt(formData.employee_id);
      }

      await axiosInstance.post('/assets/', dataToSend);
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating asset:', err);
      console.error('Error response:', err.response?.data);

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

        setError(errorMessage || 'Error al crear el activo');
      } else {
        setError('Error al crear el activo');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Añadir Nuevo Activo</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Código de Inventario *
                </label>
                <input
                  type="text"
                  name="inventory_code"
                  value={formData.inventory_code}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: MON001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Número de Serie *
                </label>
                <input
                  type="text"
                  name="serial_number"
                  value={formData.serial_number}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: SN123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tipo de Activo *
                </label>
                <select
                  name="asset_type"
                  value={formData.asset_type}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="MONITOR">Monitor</option>
                  <option value="PRINTER">Impresora</option>
                  <option value="OTHER">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Estado *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="EN_BODEGA">En Bodega</option>
                  <option value="ASIGNADO">Asignado</option>
                  <option value="EN_REPARACION">En Reparación</option>
                  <option value="DE_BAJA">De Baja</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Marca *
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: Dell, HP, Samsung"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Modelo *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: P2422H, LaserJet Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Departamento
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sin departamento</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Empleado Asignado
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={selectedEmployee ? selectedEmployee.full_name : employeeSearch}
                    onChange={(e) => {
                      setEmployeeSearch(e.target.value);
                      setShowEmployeeDropdown(true);
                      if (!e.target.value) {
                        setFormData(prev => ({ ...prev, employee_id: '' }));
                      }
                    }}
                    onFocus={() => setShowEmployeeDropdown(true)}
                    disabled={formData.status !== 'ASIGNADO'}
                    className="w-full pl-10 pr-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Buscar por nombre, RUT o email..."
                  />
                  {formData.employee_id && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, employee_id: '' }));
                        setEmployeeSearch('');
                      }}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Employee Dropdown */}
                {showEmployeeDropdown && formData.status === 'ASIGNADO' && !formData.employee_id && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowEmployeeDropdown(false)}
                    />
                    <div className="absolute z-20 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredEmployees.length === 0 ? (
                        <div className="px-3 py-2 text-gray-400 text-sm">
                          No se encontraron empleados
                        </div>
                      ) : (
                        filteredEmployees.map(emp => (
                          <button
                            key={emp.id}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, employee_id: emp.id.toString() }));
                              setEmployeeSearch('');
                              setShowEmployeeDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 hover:bg-gray-600 text-white text-sm border-b border-gray-600 last:border-b-0"
                          >
                            <div className="font-medium">{emp.full_name}</div>
                            <div className="text-xs text-gray-400">{emp.rut} • {emp.email}</div>
                          </button>
                        ))
                      )}
                    </div>
                  </>
                )}

                {formData.status !== 'ASIGNADO' && (
                  <p className="text-xs text-gray-500 mt-1">Solo disponible para estado "Asignado"</p>
                )}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                'Crear Activo'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Hardware Info Components
const HardwareInfo = ({ asset }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const isComputer = asset.asset_type === 'NOTEBOOK' || asset.asset_type === 'DESKTOP';

  if (!isComputer) {
    return (
      <div className="bg-gray-700/30 rounded-lg p-4 text-center">
        <p className="text-gray-400 text-sm">
          Este tipo de activo no tiene información de hardware.
        </p>
      </div>
    );
  }

  const computerDetail = asset.computerdetail;
  const storageDevices = asset.storage_devices || [];
  const graphicsCards = asset.graphics_cards || [];

  // If no hardware data at all
  if (!computerDetail && storageDevices.length === 0 && graphicsCards.length === 0) {
    return (
      <div className="bg-gray-700/30 rounded-lg p-6 text-center">
        <HardDrive className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400">No hay información de hardware disponible para este equipo.</p>
        <p className="text-gray-500 text-sm mt-1">
          Los datos se sincronizarán cuando el agente se ejecute en este equipo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Collapsible Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gray-700/30 hover:bg-gray-700/50 rounded-lg p-4 transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <HardDrive className="w-5 h-5 text-blue-400" />
          <div className="text-left">
            <h4 className="text-white font-semibold">Especificaciones de Hardware</h4>
            {computerDetail?.last_updated_by_agent && (
              <p className="text-gray-400 text-sm">
                Actualizado: {new Date(computerDetail.last_updated_by_agent).toLocaleDateString('es-CL')}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Hardware Details - Collapsible */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-4 pt-2">
      {/* Computer Details */}
      {computerDetail && (
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-400" />
            Especificaciones del Equipo
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {/* CPU */}
            {computerDetail.cpu_model && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">Procesador</label>
                <p className="text-white font-medium">{computerDetail.cpu_model}</p>
              </div>
            )}

            {/* RAM */}
            {computerDetail.ram_gb && (
              <div>
                <label className="text-sm text-gray-400 block mb-1 flex items-center gap-1">
                  <MemoryStick className="w-3 h-3" />
                  Memoria RAM
                </label>
                <p className="text-white font-medium">{computerDetail.ram_gb} GB</p>
              </div>
            )}

            {/* OS */}
            {computerDetail.os_name && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">Sistema Operativo</label>
                <p className="text-white font-medium">
                  {computerDetail.os_name}
                  {computerDetail.os_version && ` ${computerDetail.os_version}`}
                  {computerDetail.os_arch && ` (${computerDetail.os_arch})`}
                </p>
              </div>
            )}

            {/* Motherboard */}
            {(computerDetail.motherboard_manufacturer || computerDetail.motherboard_model) && (
              <div>
                <label className="text-sm text-gray-400 block mb-1">Placa Base</label>
                <p className="text-white font-medium">
                  {computerDetail.motherboard_manufacturer} {computerDetail.motherboard_model}
                </p>
              </div>
            )}

            {/* UUID */}
            {computerDetail.unique_identifier && (
              <div className="col-span-2">
                <label className="text-sm text-gray-400 block mb-1">UUID BIOS/UEFI</label>
                <p className="text-gray-300 font-mono text-sm">{computerDetail.unique_identifier}</p>
              </div>
            )}

            {/* Last Updated */}
            {computerDetail.last_updated_by_agent && (
              <div className="col-span-2">
                <label className="text-sm text-gray-400 block mb-1">Última Actualización por Agente</label>
                <p className="text-gray-300 text-sm">
                  {new Date(computerDetail.last_updated_by_agent).toLocaleString('es-CL')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Storage Devices */}
      {storageDevices.length > 0 && (
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-green-400" />
            Almacenamiento ({storageDevices.length})
          </h4>
          <div className="space-y-3">
            {storageDevices.map((disk, index) => (
              <div key={disk.id || index} className="bg-gray-800/50 rounded p-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Modelo</label>
                    <p className="text-white font-medium text-sm">{disk.model || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Número de Serie</label>
                    <p className="text-gray-300 font-mono text-sm">{disk.serial_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Capacidad</label>
                    <p className="text-white font-medium text-sm">
                      {disk.capacity_gb ? `${disk.capacity_gb.toFixed(2)} GB` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Espacio Libre</label>
                    <p className="text-white font-medium text-sm">
                      {disk.free_space_gb ? `${disk.free_space_gb.toFixed(2)} GB` : 'N/A'}
                    </p>
                  </div>
                  {disk.capacity_gb && disk.free_space_gb && (
                    <div className="col-span-2">
                      <label className="text-xs text-gray-400 block mb-1">Uso</label>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${((disk.capacity_gb - disk.free_space_gb) / disk.capacity_gb * 100).toFixed(1)}%`
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {((disk.capacity_gb - disk.free_space_gb) / disk.capacity_gb * 100).toFixed(1)}% utilizado
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Graphics Cards */}
      {graphicsCards.length > 0 && (
        <div className="bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Gpu className="w-5 h-5 text-purple-400" />
            Tarjetas Gráficas ({graphicsCards.length})
          </h4>
          <div className="space-y-2">
            {graphicsCards.map((gpu, index) => (
              <div key={gpu.id || index} className="bg-gray-800/50 rounded p-3">
                <p className="text-white font-medium">{gpu.model_name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
};

// Software Info Component
const SoftwareInfo = ({ asset }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const installedSoftware = asset.installed_software || [];

  if (installedSoftware.length === 0) {
    return (
      <div className="bg-gray-700/30 rounded-lg p-6 text-center">
        <Package className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <p className="text-gray-400">No hay software instalado registrado para este equipo.</p>
        <p className="text-gray-500 text-sm mt-1">
          Los datos se sincronizarán cuando el agente se ejecute en este equipo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Collapsible Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gray-700/30 hover:bg-gray-700/50 rounded-lg p-4 transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-3">
          <Package className="w-5 h-5 text-purple-400" />
          <div className="text-left">
            <h4 className="text-white font-semibold">Software Instalado</h4>
            <p className="text-gray-400 text-sm">
              {installedSoftware.length} aplicacion{installedSoftware.length !== 1 ? 'es' : ''} instalada{installedSoftware.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Software List - Collapsible */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-gray-700/30 rounded-lg p-4 mt-2">
          <div className="space-y-2">
            {installedSoftware.map((sw) => (
              <div
                key={sw.id}
                className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex-1">
                  <h5 className="text-white font-medium">{sw.software_name}</h5>
                  <div className="flex items-center gap-4 mt-1">
                    {sw.software_developer && (
                      <p className="text-gray-400 text-sm">{sw.software_developer}</p>
                    )}
                    {sw.version && (
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded text-xs font-mono">
                        v{sw.version}
                      </span>
                    )}
                    {sw.install_date && (
                      <span className="text-gray-500 text-xs">
                        Instalado: {new Date(sw.install_date).toLocaleDateString('es-CL')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const AssetDetailModal = ({ asset, onClose, onUpdate, onAssetUpdated, isAdmin, departments, employees }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [formData, setFormData] = useState({
    inventory_code: asset?.inventory_code || '',
    serial_number: asset?.serial_number || '',
    asset_type: asset?.asset_type || 'NOTEBOOK',
    status: asset?.status || 'EN_BODEGA',
    brand: asset?.brand || '',
    model: asset?.model || '',
    purchase_date: asset?.purchase_date || '',
    warranty_expiration: asset?.warranty_expiration || '',
    notes: asset?.notes || '',
    department_id: asset?.department?.id || '',
    employee_id: asset?.employee?.id || '',
  });

  if (!asset) return null;

  // Filter employees by department and search term
  const filteredEmployees = employees.filter(emp => {
    // If department is selected, only show employees from that department
    if (formData.department_id) {
      if (emp.department?.id !== parseInt(formData.department_id)) {
        return false;
      }
    }

    // Apply search filter
    if (employeeSearch) {
      const searchLower = employeeSearch.toLowerCase();
      return (
        emp.full_name.toLowerCase().includes(searchLower) ||
        emp.rut?.toLowerCase().includes(searchLower) ||
        emp.email?.toLowerCase().includes(searchLower)
      );
    }

    return true;
  }).slice(0, 50); // Limit to 50 results

  const selectedEmployee = employees.find(emp => emp.id === parseInt(formData.employee_id));

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    // Validation: If status is ASIGNADO, employee is required
    if (formData.status === 'ASIGNADO' && !formData.employee_id) {
      setError('Debes seleccionar un empleado cuando el estado es "Asignado"');
      setSaving(false);
      return;
    }

    try {
      const dataToSend = {
        inventory_code: formData.inventory_code,
        serial_number: formData.serial_number,
        asset_type: formData.asset_type,
        status: formData.status,
        brand: formData.brand,
        model: formData.model,
      };

      // Add department_id if selected
      if (formData.department_id) {
        dataToSend.department_id = parseInt(formData.department_id);
      } else {
        dataToSend.department_id = null;
      }

      // Add employee_id if selected
      if (formData.employee_id) {
        dataToSend.employee_id = parseInt(formData.employee_id);
      } else {
        dataToSend.employee_id = null;
      }

      await axiosInstance.put(`/assets/${asset.inventory_code}/`, dataToSend);

      // Refresh the table
      onUpdate();

      // Re-fetch the full asset details to update the modal
      const response = await axiosInstance.get(`/assets/${asset.inventory_code}/`);

      // Update the selectedAsset through a callback
      if (onAssetUpdated) {
        onAssetUpdated(response.data);
      }

      setIsEditing(false);
    } catch (err) {
      console.error('Error updating asset:', err);
      setError(err.response?.data?.detail || JSON.stringify(err.response?.data) || 'Error al actualizar el activo');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await axiosInstance.delete(`/assets/${asset.inventory_code}/`);
      onUpdate();
      onClose();
    } catch (err) {
      console.error('Error deleting asset:', err);
      setError(err.response?.data?.detail || 'Error al eliminar el activo');
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Detalle de Activo
            </h2>
            <p className="text-sm text-gray-400 mt-1 font-mono">{asset.inventory_code}</p>
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
                <span>¿Confirmas la eliminación de este activo?</span>
              </div>
              <p className="text-gray-300 text-sm">
                Se eliminará el activo <span className="font-bold text-white font-mono">{asset.inventory_code}</span>.
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

          {/* Información General */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Información General</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-2">Código de Inventario</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.inventory_code}
                    onChange={(e) => setFormData(prev => ({ ...prev, inventory_code: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white font-medium font-mono">{asset.inventory_code}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Número de Serie</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.serial_number}
                    onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white font-medium">{asset.serial_number}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Tipo</label>
                {isEditing ? (
                  <select
                    value={formData.asset_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, asset_type: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="NOTEBOOK">Notebook</option>
                    <option value="DESKTOP">Desktop</option>
                    <option value="MONITOR">Monitor</option>
                    <option value="PRINTER">Impresora</option>
                    <option value="OTHER">Otro</option>
                  </select>
                ) : (
                  <TypeBadge type={asset.asset_type} />
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Estado</label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="EN_BODEGA">En Bodega</option>
                    <option value="ASIGNADO">Asignado</option>
                    <option value="EN_REPARACION">En Reparación</option>
                    <option value="DE_BAJA">De Baja</option>
                  </select>
                ) : (
                  <StatusBadge status={asset.status} />
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Marca</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white font-medium">{asset.brand}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Modelo</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-white font-medium">{asset.model}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-2">Departamento</label>
                {isEditing ? (
                  <select
                    value={formData.department_id}
                    onChange={(e) => {
                      const newDeptId = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        department_id: newDeptId,
                        // Clear employee if department changes
                        employee_id: ''
                      }));
                      setEmployeeSearch('');
                    }}
                    className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sin departamento</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-white font-medium">
                    {asset.department ? asset.department.name : 'Sin departamento'}
                  </p>
                )}
              </div>
              <div className="relative">
                <label className="text-sm text-gray-400 block mb-2">
                  Empleado Asignado
                  {isEditing && formData.status === 'ASIGNADO' && (
                    <span className="text-red-400 ml-1">*</span>
                  )}
                </label>
                {isEditing ? (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={selectedEmployee ? selectedEmployee.full_name : employeeSearch}
                        onChange={(e) => {
                          setEmployeeSearch(e.target.value);
                          setShowEmployeeDropdown(true);
                          if (!e.target.value) {
                            setFormData(prev => ({ ...prev, employee_id: '' }));
                          }
                        }}
                        onFocus={() => setShowEmployeeDropdown(true)}
                        disabled={formData.status !== 'ASIGNADO'}
                        className="w-full pl-10 pr-10 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder={
                          formData.status !== 'ASIGNADO'
                            ? 'Solo disponible cuando el estado es "Asignado"'
                            : formData.department_id
                            ? 'Buscar por nombre, RUT o email...'
                            : 'Primero selecciona un departamento'
                        }
                      />
                      {formData.employee_id && (
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, employee_id: '' }));
                            setEmployeeSearch('');
                          }}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Employee Dropdown */}
                    {showEmployeeDropdown && formData.status === 'ASIGNADO' && formData.department_id && !formData.employee_id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setShowEmployeeDropdown(false)}
                        />
                        <div className="absolute z-20 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {filteredEmployees.length === 0 ? (
                            <div className="px-3 py-2 text-gray-400 text-sm">
                              No se encontraron empleados en este departamento
                            </div>
                          ) : (
                            filteredEmployees.map(emp => (
                              <button
                                key={emp.id}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, employee_id: emp.id.toString() }));
                                  setEmployeeSearch('');
                                  setShowEmployeeDropdown(false);
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-600 text-white text-sm border-b border-gray-600 last:border-b-0"
                              >
                                <div className="font-medium">{emp.full_name}</div>
                                <div className="text-xs text-gray-400">{emp.rut} • {emp.email}</div>
                                {emp.department && (
                                  <div className="text-xs text-gray-500">{emp.department.name}</div>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      </>
                    )}

                    {formData.status !== 'ASIGNADO' && (
                      <p className="text-xs text-gray-500 mt-1">
                        Solo disponible cuando el estado es "Asignado"
                      </p>
                    )}
                    {formData.status === 'ASIGNADO' && !formData.department_id && (
                      <p className="text-xs text-orange-400 mt-1">
                        Primero selecciona un departamento
                      </p>
                    )}
                  </>
                ) : (
                  asset.employee ? (
                    <div
                      onClick={() => window.open(`/users?highlight=${asset.employee.rut}`, '_blank')}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 cursor-pointer transition-colors group w-fit"
                    >
                      <span className="font-medium text-white">{asset.employee.full_name}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No asignado</p>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Hardware Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Hardware</h3>
            <HardwareInfo asset={asset} />
          </div>

          {/* Software Information */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Software</h3>
            <SoftwareInfo asset={asset} />
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
                Eliminar Activo
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
                      setFormData({
                        inventory_code: asset.inventory_code,
                        serial_number: asset.serial_number,
                        asset_type: asset.asset_type,
                        status: asset.status,
                        brand: asset.brand,
                        model: asset.model,
                        purchase_date: asset.purchase_date,
                        warranty_expiration: asset.warranty_expiration,
                        notes: asset.notes,
                        department_id: asset.department?.id || '',
                        employee_id: asset.employee?.id || '',
                      });
                      setEmployeeSearch('');
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

// Main Assets Component
const Assets = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Set page title
  useEffect(() => {
    document.title = 'Gestión de Activos - SIGAT';
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
      window.history.replaceState({}, '', '/assets');
      return highlightParam;
    }
    return '';
  };

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState(getInitialSearchTerm());
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    count: 0,
    next: null,
    previous: null,
  });

  // Filters
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Modal state
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isFromHighlight, setIsFromHighlight] = useState(!!getInitialSearchTerm());

  const pageSize = 10;

  // Fetch departments and employees for dropdowns
  useEffect(() => {
    const fetchDepartmentsAndEmployees = async () => {
      try {
        const [deptResponse, empResponse] = await Promise.all([
          axiosInstance.get('/departments/?limit=100'),
          axiosInstance.get('/employees/?limit=500')
        ]);

        // Handle both paginated and non-paginated responses
        const deptData = deptResponse.data.results || deptResponse.data;
        const empData = empResponse.data.results || empResponse.data;

        setDepartments(Array.isArray(deptData) ? deptData : []);
        setEmployees(Array.isArray(empData) ? empData : []);
      } catch (err) {
        console.error('Error fetching departments/employees:', err);
        setDepartments([]);
        setEmployees([]);
      }
    };
    fetchDepartmentsAndEmployees();
  }, []);

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

      if (searchTerm) params.append('search', searchTerm);
      if (filterType) params.append('asset_type', filterType);
      if (filterStatus) params.append('status', filterStatus);
      if (filterDepartment) params.append('department', filterDepartment);

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
  }, [currentPage, searchTerm, filterType, filterStatus, filterDepartment]);

  const handleUpdate = () => {
    fetchAssets();
  };

  // Fetch assets on mount and when dependencies change
  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Auto-open modal if highlight search returns exactly 1 result
  useEffect(() => {
    if (isFromHighlight && assets.length === 1 && !loading) {
      // Fetch full details and open modal
      const fetchAndOpenAsset = async () => {
        try {
          const response = await axiosInstance.get(`/assets/${assets[0].inventory_code}/`);
          setSelectedAsset(response.data);
          setIsFromHighlight(false); // Reset flag
        } catch (err) {
          console.error('Error fetching asset details:', err);
          setIsFromHighlight(false);
        }
      };
      fetchAndOpenAsset();
    } else if (isFromHighlight && assets.length !== 1 && !loading) {
      // If not exactly 1 result, just reset the flag
      setIsFromHighlight(false);
    }
  }, [assets, isFromHighlight, loading]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchTerm, filterType, filterStatus, filterDepartment]);

  const totalPages = Math.ceil(pagination.count / pageSize);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('');
    setFilterStatus('');
    setFilterDepartment('');
  };

  const hasActiveFilters = searchTerm || filterType || filterStatus || filterDepartment;

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
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Añadir Activo
        </button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4 items-center flex-wrap">
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

          <FilterDropdown
            label="Tipo"
            value={filterType}
            onChange={setFilterType}
            options={[
              { value: 'NOTEBOOK', label: 'Notebook' },
              { value: 'DESKTOP', label: 'Desktop' },
              { value: 'MONITOR', label: 'Monitor' },
              { value: 'PRINTER', label: 'Impresora' },
              { value: 'OTHER', label: 'Otro' },
            ]}
          />

          <FilterDropdown
            label="Estado"
            value={filterStatus}
            onChange={setFilterStatus}
            options={[
              { value: 'EN_BODEGA', label: 'En Bodega' },
              { value: 'ASIGNADO', label: 'Asignado' },
              { value: 'EN_REPARACION', label: 'En Reparación' },
              { value: 'DE_BAJA', label: 'De Baja' },
            ]}
          />

          <FilterDropdown
            label="Departamento"
            value={filterDepartment}
            onChange={setFilterDepartment}
            options={departments.map((dept) => ({
              value: dept.id.toString(),
              label: dept.name,
            }))}
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              Limpiar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {assets.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center p-12">
            <Monitor className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No se encontraron activos</h3>
            <p className="text-gray-400 text-center">
              {searchTerm || hasActiveFilters
                ? 'No hay activos que coincidan con los filtros aplicados'
                : 'No hay activos registrados en el sistema'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-max text-left text-gray-300">
                <thead className="border-b border-gray-700 bg-gray-750">
                  <tr className="text-gray-400 uppercase text-sm">
                    <th className="py-4 px-6">Código</th>
                    <th className="py-4 px-6">Serial</th>
                    <th className="py-4 px-6">Tipo</th>
                    <th className="py-4 px-6">Marca</th>
                    <th className="py-4 px-6">Modelo</th>
                    <th className="py-4 px-6">Estado</th>
                    <th className="py-4 px-6">Departamento</th>
                    <th className="py-4 px-6">Empleado</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr
                      key={asset.inventory_code}
                      onClick={async () => {
                        // Fetch full details before opening modal
                        try {
                          const response = await axiosInstance.get(`/assets/${asset.inventory_code}/`);
                          setSelectedAsset(response.data);
                        } catch (err) {
                          console.error('Error fetching asset details:', err);
                        }
                      }}
                      className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6 font-medium text-blue-400">
                        {asset.inventory_code}
                      </td>
                      <td className="py-4 px-6 text-gray-300 font-mono text-sm">
                        {asset.serial_number}
                      </td>
                      <td className="py-4 px-6">
                        <TypeBadge type={asset.asset_type} />
                      </td>
                      <td className="py-4 px-6 text-white font-medium">{asset.brand}</td>
                      <td className="py-4 px-6 text-gray-300">{asset.model}</td>
                      <td className="py-4 px-6">
                        <StatusBadge status={asset.status} />
                      </td>
                      <td className="py-4 px-6">
                        {asset.department ? (
                          asset.department.name
                        ) : (
                          <span className="text-gray-500 italic">Sin departamento</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {asset.employee ? (
                          asset.employee.full_name
                        ) : (
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

      {/* Create Asset Modal */}
      {showCreateModal && (
        <CreateAssetModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchAssets}
          departments={departments}
          employees={employees}
        />
      )}

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onUpdate={handleUpdate}
          onAssetUpdated={setSelectedAsset}
          isAdmin={isAdmin}
          departments={departments}
          employees={employees}
        />
      )}
    </main>
  );
};

export default Assets;
