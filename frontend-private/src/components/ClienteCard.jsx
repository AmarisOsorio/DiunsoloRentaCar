import React from 'react';
import { User, UserCheck, AlertCircle } from 'lucide-react';
import './ClienteCard.css';

const ClienteCard = ({ cliente, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleCardClick = () => {
    onEdit(cliente);
  };

  const getVerificationStatus = (isVerified) => {
    if (isVerified) {
      return { 
        text: 'Verificado',
        icon: UserCheck,
        className: 'verified'
      };
    }
    return { 
      text: 'No Verificado',
      icon: AlertCircle,
      className: 'unverified'
    };
  };

  const verificationStatus = getVerificationStatus(cliente.isVerified);
  const StatusIcon = verificationStatus.icon;

  return (
    <div className="cliente-card-simple" onClick={handleCardClick}>
      <div className="cliente-info">
        <div className="cliente-name">
          {cliente.nombre} {cliente.apellido}
        </div>
        <div className="cliente-email">
          {cliente.correo}
        </div>
        <div className="cliente-phone">
          {cliente.telefono}
        </div>
        <div className="cliente-birth">
          {formatDate(cliente.fechaDeNacimiento)}
        </div>
        <div className={`cliente-status ${verificationStatus.className}`}>
          <StatusIcon className="cliente-status-icon" />
          <span>{verificationStatus.text}</span>
        </div>
      </div>
      
      <div className="cliente-avatar">
        <User className="cliente-avatar-icon" />
      </div>
    </div>
  );
};

export default ClienteCard;