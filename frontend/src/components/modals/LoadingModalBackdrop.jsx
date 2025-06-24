import React from 'react';
import '../styles/modals/LoadingModalSpinner.css';

const LoadingModalBackdrop = ({ text = 'Cargando...' }) => (
  <div className="loading-modal-backdrop modal-fade-in">
    <div className="loading-modal-content loading-modal-loading-content modal-slide-in">
      <div className="loading-modal-spinner">
        <div className="loading-modal-spinner-icon" />
        <div className="loading-modal-spinner-text">{text}</div>
      </div>
    </div>
  </div>
);

export default LoadingModalBackdrop;
