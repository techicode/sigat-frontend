import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import styles from './LoginPage.module.css';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/token/', {
        username,
        password,
      });

      // Extract token and user info from response
      const { access, refresh, username: user, role } = response.data;

      // Call login function from AuthContext
      login(access, refresh, user, role);
    } catch (err) {
      // Error handling
      if (err.response?.status === 401) {
        setError('Credenciales inválidas. Intenta de nuevo.');
      } else if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (err.message === 'Network Error') {
        setError('Error de conexión. Verifica que el servidor esté disponible.');
      } else {
        setError('Ocurrió un error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (error) setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (error) setError('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <h1 className={styles.title}>Iniciar Sesión</h1>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.label}>
              Usuario
            </label>
            <input
              id="username"
              type="text"
              className={styles.input}
              value={username}
              onChange={handleUsernameChange}
              placeholder="Ingresa tu usuario"
              disabled={loading}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              className={styles.input}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Ingresa tu contraseña"
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            className={styles.button}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner}></span>
                Iniciando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            ¿No tienes cuenta? <a href="#" className={styles.link}>Registrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;