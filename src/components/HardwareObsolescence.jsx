import { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Settings,
  Save,
  Loader2,
  HardDrive,
  Cpu,
  MemoryStick,
  ChevronRight,
} from 'lucide-react';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const HardwareObsolescence = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Set page title
  useEffect(() => {
    document.title = 'Hardware Obsoleto - SIGAT';
    return () => {
      document.title = 'SIGAT';
    };
  }, []);

  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'settings'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Obsolete assets data
  const [obsoleteAssets, setObsoleteAssets] = useState([]);

  // Rules data
  const [rules, setRules] = useState({
    windows_min_version: '',
    ram_min_gb: 4.0,
    disk_min_free_percent: 10.0,
    enabled: true,
  });

  const [formData, setFormData] = useState({ ...rules });

  // Fetch rules and obsolete assets
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [rulesResponse, assetsResponse] = await Promise.all([
        axiosInstance.get('/hardware-obsolescence/rules/'),
        axiosInstance.get('/hardware-obsolescence/assets/'),
      ]);

      setRules(rulesResponse.data);
      setFormData(rulesResponse.data);
      setObsoleteAssets(assetsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Error al cargar los datos. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRules = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await axiosInstance.put('/hardware-obsolescence/rules/', formData);
      setRules(response.data);
      setSuccessMessage('Reglas actualizadas correctamente');

      // Refresh obsolete assets list
      const assetsResponse = await axiosInstance.get('/hardware-obsolescence/assets/');
      setObsoleteAssets(assetsResponse.data);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error saving rules:', err);
      setError(err.response?.data?.detail || 'Error al guardar las reglas');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Loading state
  if (loading) {
    return (
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Cargando datos de hardware obsoleto...</p>
          </div>
        </div>
      </main>
    );
  }

  // Error state
  if (error && !obsoleteAssets.length) {
    return (
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center max-w-md mx-auto mt-8">
          <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={fetchData}
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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-orange-500" />
          Hardware Obsoleto
        </h1>
        <p className="text-gray-400">
          Configuración de reglas y listado de equipos con hardware obsoleto
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            activeTab === 'list'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4" />
            Equipos Obsoletos ({obsoleteAssets.length})
          </div>
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configuración de Reglas
            </div>
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-900/20 border border-green-500 rounded-lg p-3 text-green-400 mb-4">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 text-red-400 mb-4">
          {error}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'list' && (
        <div className="space-y-4">
          {!rules.enabled && (
            <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-4 text-yellow-400">
              <p className="font-semibold">⚠️ Detección desactivada</p>
              <p className="text-sm mt-1">
                Las reglas de obsolescencia están desactivadas. Actívalas en la configuración.
              </p>
            </div>
          )}

          {obsoleteAssets.length === 0 ? (
            <div className="bg-gray-800 rounded-lg p-12 text-center">
              <HardDrive className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No hay equipos obsoletos
              </h3>
              <p className="text-gray-400">
                Todos los equipos cumplen con los estándares de hardware configurados.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {obsoleteAssets.map((asset) => (
                <div
                  key={asset.inventory_code}
                  className="bg-gray-800 rounded-lg p-6 border-l-4 border-orange-500"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-white font-mono">
                        {asset.inventory_code}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {asset.brand} {asset.model}
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500">
                      {asset.asset_type === 'NOTEBOOK' ? 'Notebook' : 'Desktop'}
                    </span>
                  </div>

                  {/* Assignment Info */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs text-gray-500">Departamento</label>
                      <p className="text-white">
                        {asset.department || (
                          <span className="text-gray-500 italic">Sin departamento</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Empleado Asignado</label>
                      <p className="text-white">
                        {asset.employee || (
                          <span className="text-gray-500 italic">No asignado</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Reasons */}
                  <div>
                    <label className="text-sm font-semibold text-gray-400 mb-2 block">
                      Motivos de Obsolescencia:
                    </label>
                    <ul className="space-y-2">
                      {asset.reasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-300">
                          <ChevronRight className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && isAdmin && (
        <div className="bg-gray-800 rounded-lg p-6">
          <form onSubmit={handleSaveRules}>
            <div className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center gap-3 p-4 bg-gray-700/30 rounded-lg">
                <input
                  type="checkbox"
                  id="enabled"
                  name="enabled"
                  checked={formData.enabled}
                  onChange={handleInputChange}
                  className="w-5 h-5 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="enabled" className="text-white font-medium cursor-pointer">
                  Activar detección de hardware obsoleto
                </label>
              </div>

              {/* Windows Version */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Versión mínima de Windows (Build Number)
                </label>
                <input
                  type="text"
                  name="windows_min_version"
                  value={formData.windows_min_version}
                  onChange={handleInputChange}
                  placeholder="ej: 10.0.19041"
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ejemplo: 10.0.19041 (Windows 10 20H1), 10.0.22000 (Windows 11)
                </p>
              </div>

              {/* RAM Minimum */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <MemoryStick className="w-4 h-4" />
                  RAM mínima (GB)
                </label>
                <input
                  type="number"
                  name="ram_min_gb"
                  value={formData.ram_min_gb}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Equipos con menos RAM se considerarán obsoletos
                </p>
              </div>

              {/* Disk Space Minimum */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Espacio libre mínimo en disco (%)
                </label>
                <input
                  type="number"
                  name="disk_min_free_percent"
                  value={formData.disk_min_free_percent}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Equipos con menos espacio disponible se considerarán en riesgo
                </p>
              </div>

              {/* Last Updated Info */}
              {rules.updated_at && (
                <div className="text-sm text-gray-400 p-4 bg-gray-700/30 rounded-lg">
                  <p>
                    Última actualización:{' '}
                    {new Date(rules.updated_at).toLocaleString('es-CL')}
                    {rules.updated_by && ` por ${rules.updated_by.username}`}
                  </p>
                </div>
              )}

              {/* Save Button */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setFormData(rules)}
                  disabled={saving}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                >
                  Cancelar Cambios
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
                    <>
                      <Save className="w-4 h-4" />
                      Guardar Reglas
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </main>
  );
};

export default HardwareObsolescence;
