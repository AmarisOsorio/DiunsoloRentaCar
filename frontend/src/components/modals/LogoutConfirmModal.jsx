import React from 'react';
import '../styles/modals/LogoutConfirmModal.css';
import SuccessCheckAnimation from './SuccessCheckAnimation';
import { FaExclamationCircle } from 'react-icons/fa';

const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel, showSuccess }) => {
  if (showSuccess) {
    return (
          <SuccessCheckAnimation
            message="¡Sesión cerrada!"
            subtitle="Has salido correctamente."
            nextAction="Redirigiendo..."
          />
    );
  }  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="logout-modal-overlay" onClick={handleOverlayClick}>
      <div className="logout-modal">
        <div className="logout-modal-icon">
          <FaExclamationCircle />
        </div>
        <h3>¿Seguro que quieres cerrar sesión?</h3>
        <div className="logout-modal-actions">
          <button className="btn-confirm" onClick={onConfirm}>Sí, cerrar sesión</button>
          <button className="btn-cancel" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default LogoutConfirmModal;
