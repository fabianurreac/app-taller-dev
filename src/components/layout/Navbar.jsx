import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo y botón para móvil */}
            <div className="flex-shrink-0 flex items-center">
              <button
                type="button"
                className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-red-500"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <span className="sr-only">Abrir menú</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <span className="md:hidden ml-2 text-xl font-bold text-gray-900">Taller Automotriz</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden md:flex md:items-center md:ml-6">
              {/* Perfil del usuario */}
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-100">
                    <span className="text-sm font-medium leading-none text-red-700">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </span>
                  </span>
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {user?.name || user?.email || 'Usuario'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="ml-4 px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;