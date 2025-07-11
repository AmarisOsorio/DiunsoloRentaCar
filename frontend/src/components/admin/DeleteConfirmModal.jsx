import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import './styles/DeleteConfirmModal.css';

const DeleteConfirmModal = ({ isOpen, onConfirm, onCancel, vehicleName }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className="delete-modal-overlay" onClick={handleOverlayClick}>
      <div className="delete-modal">
        <div className="delete-modal-icon">
          <FaExclamationTriangle />
        </div>
        <h3>¿Eliminar vehículo?</h3>
        <p>
          ¿Estás seguro que deseas eliminar el vehículo <strong>"{vehicleName}"</strong>?
        </p>
        <p className="delete-modal-warning">
          Esta acción no se puede deshacer.
        </p>
        <div className="delete-modal-actions">
          <button className="btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button className="btn-confirm-delete" onClick={onConfirm}>
            Sí, eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
