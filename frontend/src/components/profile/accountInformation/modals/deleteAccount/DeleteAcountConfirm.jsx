
import React from 'react';
import './DeleteAcountConfirm.css';
import { FaExclamationCircle } from 'react-icons/fa';

const DeleteAcountConfirm = ({ isOpen, onConfirm, onCancel, showSuccess, message }) => {
  if (showSuccess) {
    return (
      <div className="delete-modal-overlay">
        <div className="delete-modal">
          <div className="delete-modal-icon">
            <FaExclamationCircle />
          </div>
          <h3>¡Cuenta eliminada!</h3>
          <p>Tu cuenta ha sido eliminada correctamente.</p>
        </div>
      </div>
    );
  }
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
          <FaExclamationCircle />
        </div>
        <h3>{message || '¿Seguro que quieres eliminar tu cuenta?'}</h3>
        <p className="delete-modal-warning">
          Ten en cuenta que al eliminar tu cuenta toda la información de tu cuenta será eliminada sin posibilidad de restauración. No puedes eliminar tu cuenta si tienes reservas realizadas. Si deseas proceder con la eliminación, por favor contáctanos para asistencia.
        </p>
        <div className="delete-modal-actions">
          <button className="btn-delete-confirm" onClick={onConfirm}>Sí, eliminar cuenta</button>
          <button className="btn-delete-cancel" onClick={onCancel}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAcountConfirm;
