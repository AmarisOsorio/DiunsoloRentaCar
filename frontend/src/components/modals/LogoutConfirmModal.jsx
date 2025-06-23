import React from 'react';
import '../styles/modals/LogoutConfirmModal.css';
import SuccessCheckAnimation from '../SuccessCheckAnimation';

const LogoutConfirmModal = ({ isOpen, onConfirm, onCancel, showSuccess }) => {
  if (showSuccess) {
    return (
          <SuccessCheckAnimation
            message="¡Sesión cerrada!"
            subtitle="Has salido correctamente."
            nextAction="Redirigiendo..."
          />
    );
  }
  if (!isOpen) return null;
  return (
    <div className="logout-modal-overlay">
      <div className="logout-modal">
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
