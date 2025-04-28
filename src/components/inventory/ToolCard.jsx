import React from 'react';
import { Link } from 'react-router-dom';

const ToolCard = ({ tool }) => {
  // Determinar el color del estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'disponible':
        return 'bg-green-100 text-green-800';
      case 'no_disponible':
        return 'bg-red-100 text-red-800';
      case 'mantenimiento':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Determinar el color del estado de condición
  const getConditionColor = (condition) => {
    switch (condition) {
      case 'buen_estado':
        return 'bg-green-100 text-green-800';
      case 'deterioro':
        return 'bg-yellow-100 text-yellow-800';
      case 'mal_estado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Formatear el nombre para mostrar
  const formatStatus = (status) => {
    const statusMap = {
      'disponible': 'Disponible',
      'no_disponible': 'No disponible',
      'mantenimiento': 'En mantenimiento'
    };
    return statusMap[status] || status;
  };

  const formatCondition = (condition) => {
    const conditionMap = {
      'buen_estado': 'Buen estado',
      'deterioro': 'Deterioro',
      'mal_estado': 'Mal estado'
    };
    return conditionMap[condition] || condition;
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="relative h-48 overflow-hidden">
        {tool.image_url ? (
          <img 
            src={tool.image_url} 
            alt={tool.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </div>
        )}
        <div className="absolute top-0 right-0 p-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tool.status)}`}>
            {formatStatus(tool.status)}
          </span>
        </div>
      </div>
      <div className="px-4 py-4">
        <div className="flex justify-between">
          <h3 className="text-lg font-medium text-gray-900 truncate">{tool.name}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConditionColor(tool.condition)}`}>
            {formatCondition(tool.condition)}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{tool.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm font-medium text-gray-500">
            ID: {tool.code || tool.id}
          </div>
          <Link
            to={`/inventory/${tool.id}`}
            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Ver detalles
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ToolCard;
