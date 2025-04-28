import React from 'react';

const AlertBadge = ({ priority }) => {
  // Determinar el color del badge según la prioridad
  const getBadgeColor = (priority) => {
    switch (priority) {
      case 'baja':
        return 'bg-blue-100 text-blue-800';
      case 'media':
        return 'bg-yellow-100 text-yellow-800';
      case 'alta':
        return 'bg-orange-100 text-orange-800';
      case 'crítica':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(priority)}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

export default AlertBadge;