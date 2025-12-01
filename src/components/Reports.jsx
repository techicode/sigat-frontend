import { useState, useEffect } from 'react';
import {
  FileText,
  BarChart3,
  Download,
  Filter,
  Loader2,
  Users,
  Monitor,
  Package,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import * as XLSX from 'xlsx';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

// Color palette
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

// Translation map for column headers
const COLUMN_TRANSLATIONS = {
  // Employee fields
  'employee_id': 'ID Empleado',
  'employee_name': 'Nombre Empleado',
  'employee_rut': 'RUT Empleado',
  'employee_email': 'Email Empleado',
  'department_name': 'Departamento',
  'position': 'Cargo',
  'assets_count': 'Cantidad de Assets',
  'first_name': 'Nombre',
  'last_name': 'Apellido',
  'full_name': 'Nombre Completo',

  // Asset fields
  'asset_id': 'ID Asset',
  'inventory_code': 'Código de Inventario',
  'asset_type': 'Tipo de Asset',
  'brand': 'Marca',
  'model': 'Modelo',
  'serial_number': 'Número de Serie',
  'status': 'Estado',
  'cpu_model': 'Modelo CPU',
  'ram_gb': 'RAM (GB)',
  'os_name': 'Sistema Operativo',
  'os_version': 'Versión SO',
  'os_arch': 'Arquitectura SO',
  'storage_total_gb': 'Almacenamiento Total (GB)',
  'assigned_to': 'Asignado a',
  'department': 'Departamento',
  'motherboard_manufacturer': 'Fabricante Placa Base',
  'motherboard_model': 'Modelo Placa Base',
  'unique_identifier': 'Identificador Único',
  'last_updated_by_agent': 'Última Actualización por Agente',
  'acquisition_date': 'Fecha de Adquisición',

  // Software fields
  'software_id': 'ID Software',
  'software_name': 'Nombre Software',
  'software': 'Software',
  'software_developer': 'Desarrollador de Software',
  'developer': 'Desarrollador',
  'version': 'Versión',
  'install_date': 'Fecha de Instalación',
  'installations_count': 'Cantidad de Instalaciones',
  'installed_on_asset': 'Instalado en Asset',
  'has_license': 'Tiene Licencia',
  'license_key': 'Clave de Licencia',

  // License fields
  'license_id': 'ID Licencia',
  'license_key_display': 'Clave de Licencia',
  'quantity': 'Cantidad',
  'in_use': 'En Uso',
  'available': 'Disponibles',
  'purchase_date': 'Fecha de Compra',
  'expiration_date': 'Fecha de Expiración',
  'utilization_percentage': 'Porcentaje de Utilización',
  'usage_percentage': 'Porcentaje de Uso',

  // Warning fields
  'warning_id': 'ID Advertencia',
  'category': 'Categoría',
  'severity': 'Severidad',
  'message': 'Mensaje',
  'created_at': 'Fecha de Creación',
  'resolved_at': 'Fecha de Resolución',
  'resolution_notes': 'Notas de Resolución',
  'asset_inventory_code': 'Código de Inventario',
  'asset_brand': 'Marca del Asset',
  'asset_model': 'Modelo del Asset',
  'assigned_employee': 'Empleado Asignado',
  'detection_date': 'Fecha de Detección',
  'resolved_by': 'Resuelto por',

  // Other common fields
  'id': 'ID',
  'name': 'Nombre',
  'email': 'Email',
  'rut': 'RUT',
  'count': 'Cantidad',
  'total': 'Total',
  'date': 'Fecha',
  'notes': 'Notas',
  'description': 'Descripción',
  'type': 'Tipo',
  'value': 'Valor',
};

const Reports = () => {
  const { user } = useAuth();

  // Set page title
  useEffect(() => {
    document.title = 'Reportes - SIGAT';
    return () => {
      document.title = 'SIGAT';
    };
  }, []);

  const [activeTab, setActiveTab] = useState('tabular'); // 'tabular' or 'visual'
  const [activeReport, setActiveReport] = useState('employees-assets');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({});
  const [departments, setDepartments] = useState([]);
  const [softwareList, setSoftwareList] = useState([]);

  // Function to translate column headers
  const translateColumnHeader = (key) => {
    // Check if there's a direct translation
    if (COLUMN_TRANSLATIONS[key]) {
      return COLUMN_TRANSLATIONS[key];
    }
    // If not, format it nicely (replace underscores with spaces and capitalize)
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Function to translate cell values
  const translateCellValue = (value) => {
    if (value === null || value === undefined) return 'N/A';

    // Translate boolean values
    if (typeof value === 'boolean') {
      return value ? 'Sí' : 'No';
    }

    // Translate common English values to Spanish
    const valueTranslations = {
      'available': 'Disponible',
      'in_use': 'En Uso',
      'true': 'Sí',
      'false': 'No',
      'yes': 'Sí',
      'no': 'No',
      'active': 'Activo',
      'inactive': 'Inactivo',
      'pending': 'Pendiente',
      'approved': 'Aprobado',
      'rejected': 'Rechazado',
    };

    // Check if the value (as lowercase) has a translation
    const lowerValue = String(value).toLowerCase();
    if (valueTranslations[lowerValue]) {
      return valueTranslations[lowerValue];
    }

    // Return the original value
    return String(value);
  };

  // Analytics data for visualizations
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  // Fetch departments and software for filters
  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const [deptRes, softRes] = await Promise.all([
          axiosInstance.get('/departments/'),
          axiosInstance.get('/software-catalog/?limit=1000'),
        ]);
        setDepartments(deptRes.data.results || deptRes.data);
        setSoftwareList(softRes.data.results || softRes.data);
      } catch (err) {
        console.error('Error fetching filter data:', err);
      }
    };
    fetchFilterData();
  }, []);

  // Fetch analytics data when switching to visual tab
  useEffect(() => {
    if (activeTab === 'visual') {
      fetchAnalyticsData();
    }
  }, [activeTab]);

  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      const [summary, assetsDist, employeesDist, warningsAnalytics, softwareAnalytics] = await Promise.all([
        axiosInstance.get('/reports/analytics/summary/'),
        axiosInstance.get('/reports/analytics/assets-distribution/'),
        axiosInstance.get('/reports/analytics/employees-distribution/'),
        axiosInstance.get('/reports/analytics/warnings/'),
        axiosInstance.get('/reports/analytics/software/'),
      ]);

      setAnalyticsData({
        summary: summary.data,
        assets: assetsDist.data,
        employees: employeesDist.data,
        warnings: warningsAnalytics.data,
        software: softwareAnalytics.data,
      });
    } catch (err) {
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const endpoints = {
        'employees-assets': '/reports/employees-assets/',
        'assets-specs': '/reports/assets-specs/',
        'software-installations': '/reports/software-installations/',
        'licenses-usage': '/reports/licenses-usage/',
        'warnings': '/reports/warnings/',
      };

      const response = await axiosInstance.get(`${endpoints[activeReport]}?${params.toString()}`);
      setReportData(response.data);
    } catch (err) {
      console.error('Error fetching report:', err);
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData || !reportData.results || reportData.results.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    // Flatten nested data for Excel export
    const flattenedData = reportData.results.map((row) => {
      const flattened = {};
      Object.keys(row).forEach((key) => {
        if (Array.isArray(row[key])) {
          // Convert arrays to string (e.g., assets list)
          flattened[key] = row[key].map(item =>
            typeof item === 'object' ? JSON.stringify(item) : item
          ).join('; ');
        } else if (typeof row[key] === 'object' && row[key] !== null) {
          // Flatten nested objects
          Object.keys(row[key]).forEach((nestedKey) => {
            flattened[`${key}_${nestedKey}`] = row[key][nestedKey];
          });
        } else {
          flattened[key] = row[key];
        }
      });
      return flattened;
    });

    const worksheet = XLSX.utils.json_to_sheet(flattenedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reporte');

    const reportNames = {
      'employees-assets': 'Empleados_y_Assets',
      'assets-specs': 'Assets_por_Especificaciones',
      'software-installations': 'Instalaciones_de_Software',
      'licenses-usage': 'Uso_de_Licencias',
      'warnings': 'Advertencias_de_Cumplimiento',
    };

    const filename = `${reportNames[activeReport]}_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  // Report configurations
  const reportConfigs = {
    'employees-assets': {
      title: 'Empleados y Assets Asignados',
      icon: Users,
      description: 'Lista de empleados con sus assets asignados',
      filters: [
        {
          key: 'department',
          label: 'Departamento',
          type: 'select',
          options: departments.map(d => ({ value: d.id, label: d.name })),
        },
        {
          key: 'has_assets',
          label: 'Con Assets',
          type: 'select',
          options: [
            { value: '', label: 'Todos' },
            { value: 'true', label: 'Con assets' },
            { value: 'false', label: 'Sin assets' },
          ],
        },
      ],
    },
    'assets-specs': {
      title: 'Assets por Especificaciones',
      icon: Monitor,
      description: 'Filtrar assets por características de hardware',
      filters: [
        {
          key: 'ram_max',
          label: 'RAM máxima (GB)',
          type: 'number',
          placeholder: 'ej: 8 para listar < 8GB',
        },
        {
          key: 'ram_min',
          label: 'RAM mínima (GB)',
          type: 'number',
          placeholder: 'ej: 16 para listar >= 16GB',
        },
        {
          key: 'asset_type',
          label: 'Tipo de Asset',
          type: 'select',
          options: [
            { value: '', label: 'Todos' },
            { value: 'NOTEBOOK', label: 'Notebook' },
            { value: 'DESKTOP', label: 'Desktop' },
            { value: 'MONITOR', label: 'Monitor' },
            { value: 'PRINTER', label: 'Impresora' },
            { value: 'OTHER', label: 'Otro' },
          ],
        },
        {
          key: 'status',
          label: 'Estado',
          type: 'select',
          options: [
            { value: '', label: 'Todos' },
            { value: 'BODEGA', label: 'En Bodega' },
            { value: 'ASIGNADO', label: 'Asignado' },
            { value: 'REPARACION', label: 'En Reparación' },
            { value: 'DE_BAJA', label: 'De Baja' },
          ],
        },
        {
          key: 'department',
          label: 'Departamento',
          type: 'select',
          options: departments.map(d => ({ value: d.id, label: d.name })),
        },
        {
          key: 'has_employee',
          label: 'Asignación',
          type: 'select',
          options: [
            { value: '', label: 'Todos' },
            { value: 'true', label: 'Asignados' },
            { value: 'false', label: 'Sin asignar' },
          ],
        },
      ],
    },
    'software-installations': {
      title: 'Instalaciones de Software',
      icon: Package,
      description: 'Reporte de software instalado en assets',
      filters: [
        {
          key: 'software_id',
          label: 'Software',
          type: 'select',
          options: softwareList.map(s => ({ value: s.id, label: `${s.name} (${s.developer})` })),
        },
        {
          key: 'has_license',
          label: 'Con Licencia',
          type: 'select',
          options: [
            { value: '', label: 'Todos' },
            { value: 'true', label: 'Con licencia' },
            { value: 'false', label: 'Sin licencia' },
          ],
        },
        {
          key: 'department',
          label: 'Departamento',
          type: 'select',
          options: departments.map(d => ({ value: d.id, label: d.name })),
        },
      ],
    },
    'licenses-usage': {
      title: 'Uso de Licencias',
      icon: FileText,
      description: 'Estado de uso de licencias de software',
      filters: [
        {
          key: 'software_id',
          label: 'Software',
          type: 'select',
          options: softwareList.map(s => ({ value: s.id, label: `${s.name} (${s.developer})` })),
        },
        {
          key: 'status',
          label: 'Estado de Uso',
          type: 'select',
          options: [
            { value: '', label: 'Todos' },
            { value: 'available', label: 'Disponibles' },
            { value: 'full', label: 'Completas' },
            { value: 'exceeded', label: 'Excedidas' },
          ],
        },
      ],
    },
    'warnings': {
      title: 'Advertencias de Cumplimiento',
      icon: AlertTriangle,
      description: 'Reporte de advertencias de cumplimiento',
      filters: [
        {
          key: 'status',
          label: 'Estado',
          type: 'select',
          options: [
            { value: '', label: 'Todos' },
            { value: 'NUEVA', label: 'Nueva' },
            { value: 'EN_REVISION', label: 'En Revisión' },
            { value: 'RESUELTA', label: 'Resuelta' },
            { value: 'FALSO_POSITIVO', label: 'Falso Positivo' },
          ],
        },
        {
          key: 'category',
          label: 'Categoría',
          type: 'text',
          placeholder: 'ej: SOFTWARE_VULNERABLE',
        },
        {
          key: 'date_from',
          label: 'Desde',
          type: 'date',
        },
        {
          key: 'date_to',
          label: 'Hasta',
          type: 'date',
        },
        {
          key: 'department',
          label: 'Departamento',
          type: 'select',
          options: departments.map(d => ({ value: d.id, label: d.name })),
        },
      ],
    },
  };

  const config = reportConfigs[activeReport];

  return (
    <main className="flex-1 overflow-y-auto bg-gray-900 p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Reportes y Analítica</h1>
        <p className="text-gray-400">Genera reportes personalizados y visualiza métricas clave del sistema</p>
      </div>

      {/* Main Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setActiveTab('tabular')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'tabular'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <FileSpreadsheet className="w-5 h-5" />
          Reportes Tabulares
        </button>
        <button
          onClick={() => setActiveTab('visual')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'visual'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          Visualizaciones
        </button>
      </div>

      {/* Tabular Reports Section */}
      {activeTab === 'tabular' && (
        <div className="space-y-6">
          {/* Report Type Selection */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Tipo de Reporte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(reportConfigs).map((key) => {
                const cfg = reportConfigs[key];
                const Icon = cfg.icon;
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setActiveReport(key);
                      setFilters({});
                      setReportData(null);
                    }}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      activeReport === key
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-700/50 hover:border-gray-600'
                    }`}
                  >
                    <Icon className={`w-8 h-8 mb-2 ${activeReport === key ? 'text-blue-400' : 'text-gray-400'}`} />
                    <h4 className="font-semibold text-white mb-1">{cfg.title}</h4>
                    <p className="text-sm text-gray-400">{cfg.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-gray-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filtros
              </h3>
              <button
                onClick={() => setFilters({})}
                className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
              >
                Limpiar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {config.filters.map((filter) => (
                <div key={filter.key}>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {filter.label}
                  </label>
                  {filter.type === 'select' && (
                    <select
                      value={filters[filter.key] || ''}
                      onChange={(e) => setFilters({ ...filters, [filter.key]: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {/* Only add default option if first option doesn't have empty value */}
                      {filter.options[0]?.value !== '' && <option value="">Seleccionar...</option>}
                      {filter.options.map((opt) => (
                        <option key={opt.value || 'empty'} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                  {(filter.type === 'text' || filter.type === 'number' || filter.type === 'date') && (
                    <input
                      type={filter.type}
                      value={filters[filter.key] || ''}
                      onChange={(e) => setFilters({ ...filters, [filter.key]: e.target.value })}
                      placeholder={filter.placeholder}
                      className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={fetchReport}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generando reporte...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Generar Reporte
                </>
              )}
            </button>
          </div>

          {/* Results Section */}
          {reportData && (
            <>
              {/* Header - Outside scrollable area */}
              <div className="bg-gray-800 rounded-t-lg p-6 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">
                    Resultados ({reportData.count} registros)
                  </h3>
                  <button
                    onClick={exportToExcel}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar a Excel
                  </button>
                </div>
              </div>

              {/* Table wrapper - Scrollable area only */}
              <div className="bg-gray-800 rounded-b-lg">
                <div className="overflow-x-auto px-6 pb-6">
                  <table className="text-sm text-left text-gray-300 border-collapse" style={{ minWidth: '100%' }}>
                    <thead className="text-xs uppercase bg-gray-700 text-gray-400">
                      <tr>
                        {reportData.results[0] && Object.keys(reportData.results[0]).filter(key => !Array.isArray(reportData.results[0][key])).map((key) => (
                          <th key={key} className="px-4 py-3 whitespace-nowrap border-b border-gray-600">
                            {translateColumnHeader(key)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.results.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700/50">
                          {Object.keys(row).filter(key => !Array.isArray(row[key])).map((key) => (
                            <td key={key} className="px-4 py-3 whitespace-nowrap">
                              {translateCellValue(row[key])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Visual Analytics Section */}
      {activeTab === 'visual' && (
        <div className="space-y-6">
          {loadingAnalytics ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
          ) : analyticsData ? (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-gray-400 text-sm font-medium">Total Assets</h4>
                    <Monitor className="w-5 h-5 text-blue-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{analyticsData.summary.assets.total}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {analyticsData.summary.assets.assigned} asignados
                  </p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-gray-400 text-sm font-medium">Empleados</h4>
                    <Users className="w-5 h-5 text-green-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{analyticsData.summary.employees.total}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {analyticsData.summary.departments.total} departamentos
                  </p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-gray-400 text-sm font-medium">Advertencias Activas</h4>
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{analyticsData.summary.warnings.active}</p>
                  <p className="text-sm text-gray-500 mt-1">Requieren atención</p>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-gray-400 text-sm font-medium">Software Instalado</h4>
                    <Package className="w-5 h-5 text-purple-400" />
                  </div>
                  <p className="text-3xl font-bold text-white">{analyticsData.summary.software.installations}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {analyticsData.summary.software.total} catálogos
                  </p>
                </div>
              </div>

              {/* Assets Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Assets by Type */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Assets por Tipo</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.assets.by_type}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.assets.by_type.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Assets by Status */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Assets por Estado</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.assets.by_status}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="label" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                      <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* RAM Distribution */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Distribución de RAM</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.assets.ram_distribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="label" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                      <Bar dataKey="count" fill="#10b981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Assets by Department */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Top 10 Departamentos (Assets)</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analyticsData.assets.by_department} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" stroke="#9ca3af" />
                      <YAxis
                        dataKey="label"
                        type="category"
                        stroke="#9ca3af"
                        width={250}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                        cursor={{ fill: '#374151' }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Warnings Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Warnings by Status */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Advertencias por Estado</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={analyticsData.warnings.by_status}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ label, percent }) => `${label} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analyticsData.warnings.by_status.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Warnings Trend */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Tendencia de Advertencias (30 días)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analyticsData.warnings.trend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        tickFormatter={(value) => new Date(value).toLocaleDateString('es-CL', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('es-CL')}
                      />
                      <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Warnings by Category */}
                <div className="bg-gray-800 p-6 rounded-lg lg:col-span-2">
                  <h3 className="text-lg font-semibold text-white mb-4">Advertencias por Categoría</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.warnings.by_category}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="label" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                      <Bar dataKey="count" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Software Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Installed Software */}
                <div className="bg-gray-800 p-6 rounded-lg lg:col-span-2">
                  <h3 className="text-lg font-semibold text-white mb-4">Top 10 Software Más Instalado</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.software.top_installed} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" stroke="#9ca3af" />
                      <YAxis dataKey="label" type="category" stroke="#9ca3af" width={200} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                      <Bar dataKey="count" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* License Usage */}
                <div className="bg-gray-800 p-6 rounded-lg lg:col-span-2">
                  <h3 className="text-lg font-semibold text-white mb-4">Uso de Licencias (Top 3)</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analyticsData.software.license_usage.slice(0, 3)} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" stroke="#9ca3af" />
                      <YAxis
                        dataKey="name"
                        type="category"
                        stroke="#9ca3af"
                        width={200}
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                        cursor={{ fill: '#374151' }}
                      />
                      <Legend />
                      <Bar dataKey="total" name="Total" fill="#6b7280" stackId="a" />
                      <Bar dataKey="in_use" name="En Uso" fill="#3b82f6" stackId="b" />
                      <Bar dataKey="available" name="Disponibles" fill="#10b981" stackId="b" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Employees Analytics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Employees by Department */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Empleados por Departamento (Top 10)</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analyticsData.employees.by_department} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" stroke="#9ca3af" />
                      <YAxis
                        dataKey="label"
                        type="category"
                        stroke="#9ca3af"
                        width={250}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                        cursor={{ fill: '#374151' }}
                      />
                      <Bar dataKey="count" fill="#84cc16" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Assets per Employee */}
                <div className="bg-gray-800 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-4">Distribución: Assets por Empleado</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analyticsData.employees.assets_per_employee}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="label" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                      <Bar dataKey="count" fill="#ec4899" name="Empleados" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-gray-400">
              No se pudieron cargar los datos de analítica
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default Reports;
