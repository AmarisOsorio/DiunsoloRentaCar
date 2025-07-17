import React, { useState } from 'react';
import { FaExchangeAlt } from 'react-icons/fa';
import '../imageViewSelector/ImageViewSelector.css';

/**
 * Componente para seleccionar la vista de una imagen (frente/reverso)
 * Permite cambiar entre frente y reverso con un botón de intercambio
 */
const ImageViewSelector = ({ 
  title, 
  frontImage, 
  backImage, 
  onFrontChange, 
  onBackChange,
  onFrontRemove,
  onBackRemove,
  frontInputRef,
  backInputRef,
  frontId,
  backId
}) => {
  const [currentView, setCurrentView] = useState('front'); // 'front' o 'back'

  /**
   * Alterna entre la vista frontal y trasera
   */
  const toggleView = () => {
    setCurrentView(prev => prev === 'front' ? 'back' : 'front');
  };

  return (
    <div className="image-view-selector">
      <div className="image-view-header">
        <label className="image-view-title">{title}</label>
        <div className="image-view-controls">
          <span className="image-view-current">
            {currentView === 'front' ? 'Frente' : 'Reverso'}
          </span>          <button 
            type="button"
            onClick={toggleView}
            className="image-view-toggle"
            title="Cambiar vista"
          >
            <FaExchangeAlt />
          </button>
        </div>
      </div>

      <div className="image-view-container">
        {/* Vista Frontal */}
        {currentView === 'front' && (
          <div className="image-view-content">
            {frontImage ? (
              <div className="image-preview">
                <img src={frontImage} alt={`${title} - Frente`} />
                <div className="image-actions">
                  <button 
                    type="button"
                    onClick={() => frontInputRef.current?.click()}
                    className="image-action-btn change-btn"
                    title="Cambiar imagen"
                  >
                    📷
                  </button>
                  <button 
                    type="button"
                    onClick={onFrontRemove}
                    className="image-action-btn remove-btn"
                    title="Eliminar imagen"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => frontInputRef.current?.click()}
                className="image-upload-btn"
              >
                <div className="upload-icon">📷</div>
                <span>Subir imagen del frente</span>
              </button>
            )}
            <input
              ref={frontInputRef}
              id={frontId}
              type="file"
              accept="image/*"
              onChange={onFrontChange}
              className="image-input"
            />
          </div>
        )}

        {/* Vista Trasera */}
        {currentView === 'back' && (
          <div className="image-view-content">
            {backImage ? (
              <div className="image-preview">
                <img src={backImage} alt={`${title} - Reverso`} />
                <div className="image-actions">
                  <button 
                    type="button"
                    onClick={() => backInputRef.current?.click()}
                    className="image-action-btn change-btn"
                    title="Cambiar imagen"
                  >
                    📷
                  </button>
                  <button 
                    type="button"
                    onClick={onBackRemove}
                    className="image-action-btn remove-btn"
                    title="Eliminar imagen"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => backInputRef.current?.click()}
                className="image-upload-btn"
              >
                <div className="upload-icon">📷</div>
                <span>Subir imagen del reverso</span>
              </button>
            )}
            <input
              ref={backInputRef}
              id={backId}
              type="file"
              accept="image/*"
              onChange={onBackChange}
              className="image-input"
            />
          </div>
        )}
      </div>

      {/* Indicadores de estado */}
      <div className="image-view-indicators">
        <div className={`indicator ${frontImage ? 'filled' : 'empty'}`}>
          <span>Frente</span>
        </div>
        <div className={`indicator ${backImage ? 'filled' : 'empty'}`}>
          <span>Reverso</span>
        </div>
      </div>
    </div>
  );
};

export default ImageViewSelector;
