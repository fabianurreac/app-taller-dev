import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import tallerLogo from '../../assets/logo.png'; // Asegúrate de que esta ruta sea correcta

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirigir al dashboard si ya está autenticado
  useEffect(() => {
    // Prevenir redirecciones en el primer renderizado o cuando carga
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Cargar email guardado si existe
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMessage('Por favor ingresa email y contraseña');
      return;
    }
    
    setLoading(true);
    setErrorMessage('');
    
    try {
      const { error } = await login(email, password);
      
      if (error) {
        setErrorMessage(error.message || 'Error al iniciar sesión');
        setLoading(false);
      } else {
        // Guardar email si "recordarme" está activado
        if (rememberMe) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }
        
        // No necesitamos redireccionar aquí, el useEffect lo hará
      }
    } catch (error) {
      setErrorMessage('Ocurrió un error al iniciar sesión');
      console.error('Error de inicio de sesión:', error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo */}
        <div className="flex justify-center">
          <img
            src={tallerLogo}
            alt="Taller Automotriz Logo"
            className="h-20 w-auto"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iODAiIGZpbGw9IiNjNjI4MjgiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIj5UQUxMRVIgQVVUTzwvdGV4dD48L3N2Zz4=';
            }}
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Taller Automotriz
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Inicia sesión para gestionar el inventario de herramientas
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="usuario@ejemplo.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Recordarme
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-red-600 hover:text-red-500">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Cargando...' : 'Iniciar sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;