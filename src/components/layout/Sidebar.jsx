import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import tallerLogo from '../../assets/logo.png'; // Asegúrate de que esta ruta sea correcta

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();

  // Lista de enlaces de navegación
  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Inventario', href: '/inventory', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
    { name: 'Reservas', href: '/reservations', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { name: 'Alertas', href: '/alerts', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
    { name: 'Calificaciones', href: '/ratings', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
    { 
      name: 'Reportes', 
      href: '/reports', 
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      submenu: [
        { name: 'Reportes Básicos', href: '/reports?tab=basic' },
        { name: 'Reportes Avanzados', href: '/reports?tab=advanced' }
      ]
    },
  ];

  // Función para verificar si un enlace está activo
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  // Función para verificar si un subenlace está activo
  const isSubActive = (path) => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    
    if (path.includes('?tab=')) {
      const tabParam = path.split('?tab=')[1];
      return location.pathname.startsWith('/reports') && (!tab || tab === tabParam);
    }
    
    return false;
  };

  return (
    <>
      {/* Sidebar móvil */}
      <div
        className={`md:hidden fixed inset-0 flex z-40 transition-opacity ease-linear duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Fondo oscuro */}
        <div 
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        ></div>

        {/* Sidebar */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-gray-100">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Cerrar menú</span>
              <svg
                className="h-6 w-6 text-white"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center justify-center px-4 mb-4">
            <img
              src={tallerLogo}
              alt="Taller Automotriz Logo"
              className="h-12 w-auto"
            />
          </div>
          
          <div className="mt-2 flex-1 h-0 overflow-y-auto">
            <nav className="px-2 space-y-1">
              {navigation.map((item) => (
                <div key={item.name}>
                  <Link
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-red-100 text-red-800'
                        : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <svg
                      className={`mr-4 h-6 w-6 ${
                        isActive(item.href) ? 'text-red-600' : 'text-gray-500 group-hover:text-red-500'
                      }`}
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
                        d={item.icon}
                      />
                    </svg>
                    {item.name}
                  </Link>
                  
                  {/* Submenú para elementos con sub-navegación */}
                  {item.submenu && isActive(item.href) && (
                    <div className="mt-1 pl-8 space-y-1">
                      {item.submenu.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                            isSubActive(subItem.href)
                              ? 'bg-red-50 text-red-700'
                              : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar para escritorio */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-gray-100">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-gray-100 border-b border-gray-200">
              <img
                src={tallerLogo}
                alt="Taller Automotriz Logo"
                className="h-10 w-auto"
              />
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 bg-gray-100 space-y-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    <Link
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive(item.href)
                          ? 'bg-red-100 text-red-800'
                          : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
                      }`}
                    >
                      <svg
                        className={`mr-3 h-6 w-6 ${
                          isActive(item.href) ? 'text-red-600' : 'text-gray-500 group-hover:text-red-500'
                        }`}
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
                          d={item.icon}
                        />
                      </svg>
                      {item.name}
                    </Link>
                    
                    {/* Submenú para elementos con sub-navegación */}
                    {item.submenu && isActive(item.href) && (
                      <div className="mt-1 pl-10 space-y-1">
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                              isSubActive(subItem.href)
                                ? 'bg-red-50 text-red-700'
                                : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;