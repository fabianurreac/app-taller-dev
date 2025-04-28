import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { supabase } from '../../supabaseClient';

const QRScanner = ({ onUserScanned, onCancel }) => {
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(true);

  const handleScan = async (result) => {
    if (!result || !scanning) return;
    
    setScanning(false);
    
    try {
      // Asumimos que el QR puede contener el ID, cédula o email del usuario
      const scanData = result.text;
      
      // Primero intentamos buscar por ID
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', scanData)
        .single();
      
      // Si no se encuentra por ID, intentamos por identificación (cédula)
      if (error || !data) {
        const { data: userByIdentification, error: identificationError } = await supabase
          .from('profiles')
          .select('*')
          .eq('identification', scanData)
          .single();
          
        if (identificationError || !userByIdentification) {
          // Como último recurso, intentamos por email
          const { data: userByEmail, error: emailError } = await supabase
            .from('profiles')
            .select('*')
            .eq('email', scanData)
            .single();
            
          if (emailError || !userByEmail) {
            setError('No se encontró ningún trabajador con este código QR');
            setScanning(true);
            return;
          }
          
          data = userByEmail;
        } else {
          data = userByIdentification;
        }
      }
      
      // Si llegamos aquí, hemos encontrado un usuario válido
      onUserScanned(data);
    } catch (err) {
      setError('Error al procesar el código QR: ' + err.message);
      setScanning(true);
    }
  };

  const handleError = (err) => {
    setError('Error al acceder a la cámara: ' + err.message);
  };

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Escanear Código QR del Trabajador
          </h3>
          <p className="text-sm text-gray-500">
            Coloca el código QR del trabajador frente a la cámara
          </p>
        </div>
        
        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
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
        )}
        
        <div className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300">
          <QrReader
            constraints={{ facingMode: 'environment' }}
            onResult={handleScan}
            onError={handleError}
            style={{ width: '100%' }}
          />
        </div>
        
        <div className="mt-5 sm:mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;