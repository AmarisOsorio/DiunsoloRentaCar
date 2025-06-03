import React, { useEffect } from 'react';
import '../styles/modals/RegisterModal.css';

const RegistrationSuccessAnimation = ({ userName, onAnimationEnd }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationEnd && onAnimationEnd();
    }, 2200); // Duración de la animación (2.2s aprox)
    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return (
    <div className="register-modal-success-animation">
      <div className="car-animation-container">
        {/* SVG simple de coche y check animado */}
        <svg width="120" height="60" viewBox="0 0 120 60" fill="none">
          {/* Coche */}
          <g className="car-body">
            <rect x="20" y="30" width="60" height="18" rx="6" fill="#1C318C" />
            <rect x="35" y="22" width="30" height="14" rx="4" fill="#009BDB" />
          </g>
          {/* Ruedas */}
          <circle className="car-wheel wheel-left" cx="32" cy="50" r="7" fill="#222" />
          <circle className="car-wheel wheel-right" cx="68" cy="50" r="7" fill="#222" />
          {/* Check oculto al inicio, aparece al final */}
          <g className="car-check">
            <circle cx="100" cy="40" r="15" fill="#009BDB" />
            <polyline points="93,40 99,46 108,34" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
      <div className="register-modal-success-text">
        ¡Felicidades, <b>{userName}</b>!<br />
        Tu aventura al volante está a punto de comenzar.
      </div>
    </div>
  );
};

export default RegistrationSuccessAnimation;
