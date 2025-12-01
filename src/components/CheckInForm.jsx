import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipboardCheck, Loader2, CheckCircle2, AlertCircle, Star } from 'lucide-react';
import axios from 'axios';

// Backend API URL desde variables de entorno
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const CheckInForm = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  // Set page title
  useEffect(() => {
    document.title = 'Check-in de Activo - SIGAT';
    return () => {
      document.title = 'SIGAT';
    };
  }, []);

  const [checkin, setCheckin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    physical_state: '',
    performance_satisfaction: 0,
    notes: ''
  });

  useEffect(() => {
    fetchCheckin();
  }, [token]);

  const fetchCheckin = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`${API_BASE_URL}/checkin/${token}/`);
      setCheckin(response.data);

      // If already completed, show success message
      if (response.data.status === 'COMPLETADO') {
        setSuccess(true);
      }
    } catch (error) {
      console.error('Error al cargar check-in:', error);
      if (error.response?.status === 404) {
        setError('Check-in no encontrado. El enlace puede ser inválido o haber expirado.');
      } else {
        setError('Error al cargar el check-in. Por favor, intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.physical_state) {
      alert('Por favor selecciona el estado físico del equipo');
      return;
    }

    if (!formData.performance_satisfaction || formData.performance_satisfaction < 1 || formData.performance_satisfaction > 5) {
      alert('Por favor califica el rendimiento del equipo (1-5)');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await axios.post(`${API_BASE_URL}/checkin/${token}/submit/`, formData);

      setSuccess(true);
    } catch (error) {
      console.error('Error al enviar check-in:', error);
      const errorMsg = error.response?.data?.detail || 'Error al enviar el check-in. Por favor, intenta nuevamente.';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStarClick = (rating) => {
    setFormData({ ...formData, performance_satisfaction: rating });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Cargando check-in...</p>
        </div>
      </div>
    );
  }

  if (error && !checkin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-red-500/20">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    );
  }

  if (success || (checkin && checkin.status === 'COMPLETADO')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full text-center border border-green-500/20">
          <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">¡Check-in Completado!</h2>
          <p className="text-gray-300 mb-6">
            Gracias por completar la verificación de tu equipo. La información ha sido registrada exitosamente.
          </p>
          {checkin && (
            <div className="bg-gray-700/50 rounded-lg p-4 text-left">
              <p className="text-sm text-gray-400 mb-2">Equipo verificado:</p>
              <p className="text-white font-medium">{checkin.asset?.inventory_code}</p>
              <p className="text-gray-300 text-sm">{checkin.asset?.model || 'N/A'}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-xl">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardCheck className="w-8 h-8 text-white" />
            <h1 className="text-2xl font-bold text-white">Verificación de Equipo</h1>
          </div>
          <p className="text-blue-100">Por favor completa la siguiente información sobre tu equipo asignado</p>
        </div>

        <div className="p-6">
          {/* Asset Information */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-400" />
              Información del Equipo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Código de Inventario</label>
                <p className="text-white font-medium">{checkin?.asset?.inventory_code}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Modelo</label>
                <p className="text-white">{checkin?.asset?.model || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Empleado</label>
                <p className="text-white">{checkin?.employee?.full_name}</p>
              </div>
              {checkin?.employee?.email && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Email</label>
                  <p className="text-white">{checkin.employee.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Physical State */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Estado Físico del Equipo <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.physical_state}
                onChange={(e) => setFormData({ ...formData, physical_state: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Excelente">Excelente - Sin daños ni desgaste visible</option>
                <option value="Bueno">Bueno - Desgaste mínimo normal</option>
                <option value="Regular">Regular - Algunos daños o desgaste notable</option>
                <option value="Malo">Malo - Daños significativos o mal funcionamiento</option>
              </select>
            </div>

            {/* Performance Satisfaction */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                ¿Cómo calificarías el rendimiento del equipo? <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleStarClick(rating)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-10 h-10 ${
                        rating <= formData.performance_satisfaction
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 px-1">
                <span>Muy Insatisfecho</span>
                <span>Muy Satisfecho</span>
              </div>
              {formData.performance_satisfaction > 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  Seleccionado: {formData.performance_satisfaction}/5
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Comentarios o Problemas (Opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                placeholder="Describe cualquier problema, solicitud de mantenimiento, o comentario sobre el equipo..."
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Completar Check-in
                </>
              )}
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-400 text-center">
              Esta verificación ayuda a mantener un registro actualizado del estado de los equipos.
              Si tienes problemas técnicos urgentes, por favor contacta al departamento de TI directamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInForm;
