import { useState, useEffect } from 'react';
import { Monitor, Users, AlertTriangle, Calendar, Loader2 } from 'lucide-react';
import axiosInstance from '../axiosConfig';

// KPI Card Component
const KpiCard = ({ title, value, icon: Icon, valueColor = 'text-white', loading = false }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-gray-400 uppercase">{title}</p>
      {loading ? (
        <div className="h-9 w-20 bg-gray-700 animate-pulse rounded mt-2"></div>
      ) : (
        <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
      )}
    </div>
    <div className="text-gray-500">
      <Icon className="w-8 h-8" />
    </div>
  </div>
);

// Status Badge Component
const StatusBadge = ({ status }) => {
  let colorClass = 'bg-gray-600 text-gray-100'; // Default
  switch (status) {
    case 'NUEVA':
      colorClass = 'bg-orange-500 text-white';
      break;
    case 'EN REVISIÓN':
      colorClass = 'bg-blue-500 text-white';
      break;
    case 'RESUELTA':
      colorClass = 'bg-green-500 text-white';
      break;
    default:
      break;
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
      {status}
    </span>
  );
};

// Helper function to format relative time
const getRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInMs = now - date;
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);

  if (diffInMinutes < 1) return 'Hace unos segundos';
  if (diffInMinutes === 1) return 'Hace 1 minuto';
  if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`;
  if (diffInHours === 1) return 'Hace 1 hora';
  if (diffInHours < 24) return `Hace ${diffInHours} horas`;
  if (diffInDays === 1) return 'Hace 1 día';
  if (diffInDays < 7) return `Hace ${diffInDays} días`;
  if (diffInWeeks === 1) return 'Hace 1 semana';
  if (diffInWeeks < 4) return `Hace ${diffInWeeks} semanas`;
  if (diffInMonths === 1) return 'Hace 1 mes';
  return `Hace ${diffInMonths} meses`;
};

const Dashboard = () => {
  // State management
  const [kpiData, setKpiData] = useState([]);
  const [warningsData, setWarningsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard stats from API
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch stats from backend
        const response = await axiosInstance.get('/dashboard/stats/');
        const stats = response.data;

        // Format numbers with commas
        const formatNumber = (num) => num.toLocaleString('es-CL');

        // Update KPI data with real values from API
        setKpiData([
          {
            title: 'Activos Totales',
            value: formatNumber(stats.total_assets),
            icon: Monitor,
          },
          {
            title: 'Usuarios Asignados',
            value: formatNumber(stats.assigned_employees),
            icon: Users,
          },
          {
            title: 'Advertencias Activas',
            value: formatNumber(stats.active_warnings),
            icon: AlertTriangle,
            color: 'text-orange-400',
          },
          {
            title: 'Licencias por Vencer',
            value: formatNumber(stats.expiring_licenses),
            icon: Calendar,
            color: 'text-red-500',
          },
        ]);

        // Fetch latest compliance warnings from API
        const warningsResponse = await axiosInstance.get('/compliance-warnings/?limit=5');

        // Transform backend data to frontend format
        const transformedWarnings = warningsResponse.data.results.map((warning) => {
          // Map backend status values to frontend display values
          let displayStatus = warning.status;
          if (warning.status === 'EN_REVISION') displayStatus = 'EN REVISIÓN';
          if (warning.status === 'FALSO_POSITIVO') displayStatus = 'FALSO POSITIVO';

          return {
            id: warning.id,
            asset: warning.asset.inventory_code,
            category: warning.category,
            date: getRelativeTime(warning.detection_date),
            status: displayStatus,
          };
        });

        setWarningsData(transformedWarnings);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError('Error al cargar las estadísticas del dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  // Error state
  if (error) {
    return (
      <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Error</h3>
          <p className="text-gray-300">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-8 bg-gray-900">
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          // Loading skeleton
          <>
            {[1, 2, 3, 4].map((i) => (
              <KpiCard
                key={i}
                title="Cargando..."
                value="..."
                icon={Loader2}
                loading={true}
              />
            ))}
          </>
        ) : (
          // Real data
          kpiData.map((item) => (
            <KpiCard
              key={item.title}
              title={item.title}
              value={item.value}
              icon={item.icon}
              valueColor={item.color}
            />
          ))
        )}
      </div>

      {/* Recent Warnings Section */}
      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-semibold text-white mb-6">
          Últimas Advertencias de Cumplimiento
        </h3>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-left text-gray-300">
            <thead className="border-b border-gray-700">
              <tr className="text-gray-400 uppercase text-sm">
                <th className="py-4 px-4">Activo</th>
                <th className="py-4 px-4">Categoría</th>
                <th className="py-4 px-4">Fecha de Detección</th>
                <th className="py-4 px-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {warningsData.map((warning) => (
                <tr
                  key={warning.id}
                  className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                >
                  <td className="py-4 px-4 font-medium text-white">
                    {warning.asset}
                  </td>
                  <td className="py-4 px-4">{warning.category}</td>
                  <td className="py-4 px-4">{warning.date}</td>
                  <td className="py-4 px-4">
                    <StatusBadge status={warning.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
