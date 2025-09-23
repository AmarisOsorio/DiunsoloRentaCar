import React from 'react';
import { FaExclamationCircle, FaUser, FaTimes } from 'react-icons/fa';
import './CustomAlertModal.css';

const CustomAlertModal = ({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  title = "Editar información personal",
  message = "¿Quieres editar tus datos personales? Serás redirigido a tu perfil.",
  confirmText = "Ir al perfil",
  cancelText = "Cancelar"
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="custom-alert-overlay" onClick={handleBackdropClick}>
      <div className="custom-alert-modal" onClick={e => e.stopPropagation()}>
        <div className="custom-alert-header">
          <div className="custom-alert-icon">
            <FaUser />
          </div>
          <button className="custom-alert-close" onClick={onCancel}>
            <FaTimes />
          </button>
        </div>
        
        <div className="custom-alert-content">
          <h3 className="custom-alert-title">{title}</h3>
          <p className="custom-alert-message">{message}</p>
        </div>
        
        <div className="custom-alert-actions">
          <button 
            className="custom-alert-btn custom-alert-btn-secondary" 
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button 
            className="custom-alert-btn custom-alert-btn-primary" 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlertModal;