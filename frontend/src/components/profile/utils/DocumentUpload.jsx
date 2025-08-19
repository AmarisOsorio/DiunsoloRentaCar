import React from 'react';
import '../utils/styles/DocumentUpload.css';
import { FaUpload, FaTrash } from 'react-icons/fa';

/**
 * Componente para subir y mostrar documentos (licencia, pasaporte, etc.)
 */
const DocumentUpload = ({
  label,
  documents,
  fileRefs,
  onFileUpload,
  onRemoveImage,
  validationErrors = {} // Nuevo prop para errores de validación
}) => {
  return (
    <div className="perfil-field perfil-field-document">
      <label className="perfil-field-label">{label}</label>
      <div className="perfil-field-content">
        <div className="perfil-document-upload">
          <div className="perfil-document-side">
            <span className="perfil-document-label">Frente</span>
            {documents.frente ? (
              <div className="perfil-document-preview">
                <img src={documents.frente} alt={`${label} Frente`} />
                <div className="perfil-document-actions">
                  <button 
                    onClick={() => fileRefs?.frente?.current?.click()}
                    className="perfil-btn perfil-btn-change"
                  >
                    <FaUpload size={32} />
                  </button>
                  <button 
                    onClick={() => onRemoveImage('frente')}
                    className="perfil-btn perfil-btn-delete"
                  >
                    <FaTrash size={32} />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => fileRefs?.frente?.current?.click()}
                className="perfil-upload-button"
              >
                <FaUpload size={32} />
                Subir imagen
              </button>
            )}
            <input
              ref={fileRefs?.frente}
              type="file"
              accept="image/*"
              onChange={(e) => onFileUpload(e, 'frente')}
              className="perfil-file-input"
            />
            {/* Mensaje de error para frente */}
            {validationErrors.frente && (
              <div className="perfil-validation-message">
                {validationErrors.frente}
              </div>
            )}
          </div>
          
          <div className="perfil-document-side">
            <span className="perfil-document-label">Reverso</span>
            {documents.reverso ? (
              <div className="perfil-document-preview">
                <img src={documents.reverso} alt={`${label} Reverso`} />
                <div className="perfil-document-actions">
                  <button 
                    onClick={() => fileRefs?.reverso?.current?.click()}
                    className="perfil-btn perfil-btn-change"
                  >
                    <FaUpload size={32} />
                  </button>
                  <button 
                    onClick={() => onRemoveImage('reverso')}
                    className="perfil-btn perfil-btn-delete"
                  >
                    <FaTrash size={32} />
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => fileRefs?.reverso?.current?.click()}
                className="perfil-upload-button"
              >
                <FaUpload size={32} />
                Subir imagen
              </button>
            )}
            <input
              ref={fileRefs?.reverso}
              type="file"
              accept="image/*"
              onChange={(e) => onFileUpload(e, 'reverso')}
              className="perfil-file-input"
            />
            {/* Mensaje de error para reverso */}
            {validationErrors.reverso && (
              <div className="perfil-validation-message">
                {validationErrors.reverso}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentUpload;
