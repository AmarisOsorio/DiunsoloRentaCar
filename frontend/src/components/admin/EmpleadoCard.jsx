import React, { useState } from 'react';
import { User } from 'lucide-react';
import './styles/EmpleadoCard.css';

const EmpleadoCard = ({ empleado, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleCardClick = () => {
    onEdit(empleado);
  };

  // Verificar si tiene imagen válida
  const hasValidImage = empleado.foto && !imageError && empleado.foto.trim() !== '';

  return (
    <div className="empleado-card-simple" onClick={handleCardClick}>
      <div className="empleado-info">
        <div className="empleado-name">
          {empleado.nombre} {empleado.apellido}
        </div>
        <div className="empleado-email">
          {empleado.correoElectronico}
        </div>
        <div className="empleado-phone">
          {empleado.telefono}
        </div>
        <div className="empleado-role-simple">
          {empleado.rol}
        </div>
      </div>
      
      <div className="empleado-avatar-simple">
        {hasValidImage ? (
          <img 
            src={empleado.foto} 
            alt={`${empleado.nombre} ${empleado.apellido}`}
            className="empleado-avatar-image-simple"
            onError={handleImageError}
          />
        ) : (
          <User className="empleado-avatar-icon-simple" />
        )}
      </div>
    </div>
  );
};

export default EmpleadoCard;
