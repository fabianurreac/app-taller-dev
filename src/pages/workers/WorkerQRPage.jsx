import React, { useState, useEffect } from 'react';
// Utilizamos un enfoque diferente para el código QR
import * as QRCodeReact from 'qrcode.react';
import { supabase } from '../../supabaseClient';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';

const WorkerQRPage = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Verificar si el usuario es administrador
  const isAdmin = user?.role === 'admin';

  // Verificamos qué exporta la biblioteca
  console.log('QRCode exports:', QRCodeReact);
  
  // Determinar qué componente usar
  const QRCodeComponent = QRCodeReact.QRCodeSVG || QRCodeReact.default || QRCodeReact;

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'user')
          .order('name');

        if (error) {
          throw error;
        }

        setWorkers(data || []);
      } catch (err) {
        setError('Error al cargar los trabajadores: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  // Función para imprimir el código QR
  const handlePrintQR = () => {
    const printContent = document.getElementById('qr-print-content');
    const windowUrl = 'about:blank';
    const uniqueName = new Date().getTime();
    const windowName = 'Print' + uniqueName;
    const printWindow = window.open(windowUrl, windowName, 'left=0,top=0,width=800,height=600,toolbar=0,scrollbars=0,status=0');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Código QR - ${selectedWorker.name}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            .qr-container { margin: 20px auto; }
            h1 { font-size: 18px; }
            p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>Código QR para ${selectedWorker.name}</h1>
          <div class="qr-container">
            ${printContent.innerHTML}
          </div>
          <p>ID: ${selectedWorker.id}</p>
          <p>Cédula: ${selectedWorker.identification || 'No registrada'}</p>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Redireccionar si no es admin
  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    No tienes permiso para acceder a esta página.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Generador de Códigos QR</h1>
          <p className="mt-1 text-sm text-gray-500">
            Genera códigos QR para los trabajadores del sistema.
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Cargando trabajadores...</span>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Seleccionar Trabajador</h3>
                      {workers.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay trabajadores registrados.</p>
                      ) : (
                        <div className="bg-white border border-gray-300 rounded-md shadow-sm overflow-hidden">
                          <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                            {workers.map((worker) => (
                              <li 
                                key={worker.id}
                                className={`px-4 py-3 cursor-pointer hover:bg-gray-50 ${selectedWorker?.id === worker.id ? 'bg-blue-50' : ''}`}
                                onClick={() => setSelectedWorker(worker)}
                              >
                                <div className="flex items-center">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-gray-900 truncate">{worker.name}</p>
                                    <p className="text-sm text-gray-500 truncate">Cédula: {worker.identification || 'No registrada'}</p>
                                  </div>
                                  {selectedWorker?.id === worker.id && (
                                    <div className="ml-3 flex-shrink-0">
                                      <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Código QR</h3>
                      {selectedWorker ? (
                        <div className="text-center">
                          <div 
                            id="qr-print-content" 
                            className="bg-white p-4 inline-block rounded-lg border border-gray-300 shadow-sm"
                          >
                            {/* Renderizamos el componente QR de forma dinámica */}
                            {React.createElement(QRCodeComponent, {
                              value: selectedWorker.id,
                              size: 200,
                              level: "H",
                              includeMargin: true
                            })}
                          </div>
                          <div className="mt-3">
                            <p className="text-sm text-gray-500 mb-1">Nombre: {selectedWorker.name}</p>
                            <p className="text-sm text-gray-500 mb-3">Cédula: {selectedWorker.identification || 'No registrada'}</p>
                            <button
                              type="button"
                              onClick={handlePrintQR}
                              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <svg className="mr-2 -ml-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                              </svg>
                              Imprimir código QR
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center p-12 border border-dashed border-gray-300 rounded-lg">
                          <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1v-2a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Ningún trabajador seleccionado</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Selecciona un trabajador para generar su código QR.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default WorkerQRPage;