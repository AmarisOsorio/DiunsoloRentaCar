import React from 'react';
import { User, UserCheck, AlertCircle, Mail, Phone, Calendar } from 'lucide-react';
import './styles/ClienteCard.css';

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
    <div className="cliente-card" onClick={handleCardClick}>
      <div className="cliente-card-header">
        <div className="cliente-avatar">
          <User size={24} />
        </div>
        <div className={`cliente-status-badge ${verificationStatus.className}`}>
          <StatusIcon size={14} />
          <span>{verificationStatus.text}</span>
        </div>
      </div>
      
      <div className="cliente-card-body">
        <h3 className="cliente-name">
          {cliente.nombre} {cliente.apellido}
        </h3>
        
        <div className="cliente-info-grid">
          <div className="cliente-info-item">
            <Mail size={16} />
            <span>{cliente.correo}</span>
          </div>
          
          <div className="cliente-info-item">
            <Phone size={16} />
            <span>{cliente.telefono}</span>
          </div>
          
          <div className="cliente-info-item">
            <Calendar size={16} />
            <span>{formatDate(cliente.fechaDeNacimiento)}</span>
          </div>
        </div>
      </div>
      
      <div className="cliente-card-footer">
        <span className="cliente-id">ID: {cliente._id?.slice(-6)}</span>
      </div>
    </div>
  );
};

export default ClienteCard;
