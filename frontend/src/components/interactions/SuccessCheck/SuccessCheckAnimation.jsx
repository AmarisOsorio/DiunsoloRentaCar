import React, { useEffect, useRef } from 'react';
import './SuccessCheckAnimation.css';

const PARTICLE_COUNT = 18;
function randomBetween(a, b) {
  return Math.random() * (b - a) + a;
}
const Particle = ({ idx }) => {
  const angle = (idx / PARTICLE_COUNT) * 2 * Math.PI;
  const distance = randomBetween(55, 70);
  const style = {
    left: `calc(50% + ${Math.cos(angle) * distance}px)` ,
    top: `calc(50% + ${Math.sin(angle) * distance}px)` ,
    animationDelay: `${randomBetween(0, 0.3)}s`,
    '--particle-color': ['#4BB543', '#A7E9FF', '#B4FFB4', '#FFD700'][idx % 4],
  };
  return <div className="success-check-particle" style={style} />;
};

const SuccessCheckAnimation = ({ 
  message = '¡Éxito!', 
  subtitle, 
  onClose, 
  duration = 1800, 
  showClose = false,
  operation = 'default', // 'create', 'edit', 'delete', 'logout', 'default'
  itemName = '', // nombre del item para mensajes personalizados
  entityType = 'elemento' // tipo de entidad
}) => {
  const overlayRef = useRef();

  // Generar mensajes dinámicos basados en la operación
  const getMessages = () => {
    if (message !== '¡Éxito!' || subtitle) {
      // Si se proporcionan mensajes personalizados, usarlos
      return { title: message, subtitle };
    }

    switch (operation) {
      case 'create':
        return {
          title: `¡${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Creado!`,
          subtitle: itemName 
            ? `"${itemName}" ha sido agregado exitosamente`
            : `El ${entityType} ha sido creado correctamente`
        };
      case 'edit':
        return {
          title: `¡${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Actualizado!`,
          subtitle: itemName 
            ? `"${itemName}" ha sido actualizado exitosamente`
            : `El ${entityType} ha sido actualizado correctamente`
        };
      case 'delete':
        return {
          title: `¡${entityType.charAt(0).toUpperCase() + entityType.slice(1)} Eliminado!`,
          subtitle: itemName 
            ? `"${itemName}" ha sido eliminado del sistema`
            : `El ${entityType} ha sido eliminado correctamente`
        };
      case 'logout':
        return {
          title: '¡Sesión Cerrada!',
          subtitle: 'Has salido correctamente del sistema'
        };
      default:
        return {
          title: '¡Éxito!',
          subtitle: 'La operación se completó correctamente'
        };
    }
  };

  const messages = getMessages();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (overlayRef.current) {
        overlayRef.current.classList.add('fade-out');
      }
      setTimeout(() => {
        if (onClose) onClose();
      }, 700);
    }, duration);
    return () => clearTimeout(timeout);
  }, [onClose, duration]);

  return (
    <div className="success-check-overlay" ref={overlayRef}>
      <div className="success-check-container">
        {showClose && (
          <button className="success-check-close" onClick={onClose}>&times;</button>
        )}        <div className="success-check-icon">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="50" fill="#1C318C"/>
            <path d="M30 52L45 67L70 42" stroke="#fff" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="success-check-particles">
            {Array.from({ length: PARTICLE_COUNT }).map((_, i) => <Particle key={i} idx={i} />)}
          </div>
        </div>
        <h2 className="success-check-title">{messages.title}</h2>
        {messages.subtitle && <p className="success-check-subtitle">{messages.subtitle}</p>}
      </div>
    </div>
  );
};

export default SuccessCheckAnimation;
