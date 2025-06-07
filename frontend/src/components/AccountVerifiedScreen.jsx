import React, { useEffect, useRef } from 'react';
import './styles/AccountVerifiedScreen.css';

const PARTICLE_COUNT = 18;

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

const Particle = ({ idx }) => {
  // Distribuye partículas en círculo y con animación aleatoria
  const angle = (idx / PARTICLE_COUNT) * 2 * Math.PI;
  const distance = randomBetween(48, 70);
  const style = {
    left: `calc(50% + ${Math.cos(angle) * distance}px)` ,
    top: `calc(50% + ${Math.sin(angle) * distance}px)` ,
    animationDelay: `${randomBetween(0, 0.3)}s`,
    '--particle-color': ['#FFD700', '#FFF', '#B4FFB4', '#A7E9FF'][idx % 4],
  };
  return <div className="account-verified-particle" style={style} />;
};

const AccountVerifiedScreen = ({ onClose }) => {
  const overlayRef = useRef();

  useEffect(() => {
    // Fade out tras 2s (normal), luego llama onClose
    const timeout = setTimeout(() => {
      if (overlayRef.current) {
        overlayRef.current.classList.add('fade-out');
      }
      setTimeout(() => {
        if (onClose) onClose(); // Cierra el modal (elimina el overlay)
        setTimeout(() => {
          window.location.replace('/'); // Redirige después de cerrar el modal
        }, 100); // Pequeño delay para asegurar desmontaje
      }, 700); // coincide con la animación fade-out
    }, 1500); // 2 segundos
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="account-verified-overlay" ref={overlayRef}>
      <div className="account-verified-container">
        <div className="account-verified-icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="40" fill="#4BB543"/>
            <path d="M24 42L36 54L56 34" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {/* Partículas */}
          <div className="account-verified-particles">
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => <Particle key={i} idx={i} />)}
          </div>
        </div>
        <h2>¡Cuenta Activada!</h2>
        <p>¡Bienvenido a <b>Diunsolo RentaCar</b>!<br/>Tu cuenta ha sido verificada exitosamente.</p>
      </div>
    </div>
  );
};

export default AccountVerifiedScreen;
