import React, { useEffect, useRef } from 'react';
import './styles/AccountVerifiedScreen.css';

const PARTICLE_COUNT = 18;

function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}

const Particle = ({ idx }) => {
  const angle = (idx / PARTICLE_COUNT) * 2 * Math.PI;
  const distance = randomBetween(48, 70);
  const style = {
    left: `calc(50% + ${Math.cos(angle) * distance}px)` ,
    top: `calc(50% + ${Math.sin(angle) * distance}px)` ,
    animationDelay: `${randomBetween(0, 0.3)}s`,
    '--particle-color': ['#4BB543', '#A7E9FF', '#B4FFB4', '#FFD700'][idx % 4],
  };
  return <div className="account-verified-particle" style={style} />;
};

const AccountLogedScreen = ({ onClose }) => {
  const overlayRef = useRef();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (overlayRef.current) {
        overlayRef.current.classList.add('fade-out');
      }
      setTimeout(() => {
        if (onClose) onClose();
      }, 700);
    }, 1500);
    return () => clearTimeout(timeout);
  }, [onClose]);

  return (
    <div className="account-verified-overlay" ref={overlayRef}>
      <div className="account-verified-container">
        <div className="account-verified-icon">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="40" cy="40" r="40" fill="#1C318C"/>
            <path d="M24 42L36 54L56 34" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="account-verified-particles">
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => <Particle key={i} idx={i} />)}
          </div>
        </div>
        <h2 style={{ color: '#1C318C' }}>¡Sesión Iniciada!</h2>
        <p>Bienvenido de nuevo a <b>Diunsolo RentaCar</b>.<br/>Has iniciado sesión exitosamente.</p>
      </div>
    </div>
  );
};

export default AccountLogedScreen;
