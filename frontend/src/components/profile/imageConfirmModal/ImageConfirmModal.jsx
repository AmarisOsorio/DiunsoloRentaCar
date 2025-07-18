import React from 'react';
import './ImageConfirmModal.css';

const ImageConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  action, // 'upload' o 'delete'
  documentType, // 'licencia' o 'pasaporte'
  side, // 'frente' o 'reverso'
  imagePreview // URL de la imagen para preview
}) => {
  if (!isOpen) return null;

  const actionText = action === 'upload' ? 'subir' : 'eliminar';
  const documentName = documentType === 'licencia' ? 'Licencia' : 'Pasaporte/DUI';
  const sideText = side === 'frente' ? 'frontal' : 'reverso';

  return (
    <div className="image-confirm-backdrop" onClick={onClose}>
      <div className="image-confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="image-confirm-header">
          <h3>Confirmar {actionText} imagen</h3>
          <button className="image-confirm-close" onClick={onClose}>
            &times;
          </button>
        </div>
        
        <div className="image-confirm-content">
          <div className="image-confirm-icon">
            {action === 'upload' ? '📤' : '🗑️'}
          </div>
          
          <p className="image-confirm-message">
            ¿Estás seguro de que deseas {actionText} la imagen {sideText} de tu {documentName}?
          </p>
          
          {imagePreview && action === 'upload' && (
            <div className="image-confirm-preview">
              <img src={imagePreview} alt="Vista previa" />
            </div>
          )}
          
          {action === 'delete' && (
            <div className="image-confirm-warning">
              ⚠️ Esta acción no se puede deshacer
            </div>
          )}
        </div>
        
        <div className="image-confirm-actions">
          <button 
            className="image-confirm-btn image-confirm-cancel"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className={`image-confirm-btn ${action === 'upload' ? 'image-confirm-upload' : 'image-confirm-delete'}`}
            onClick={onConfirm}
          >
            {action === 'upload' ? 'Subir imagen' : 'Eliminar imagen'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageConfirmModal;
