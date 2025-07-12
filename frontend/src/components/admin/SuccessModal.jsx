import React, { useEffect, useCallback } from 'react';
import { FaCheckCircle, FaTimes, FaCar, FaEdit, FaTrash, FaPlay, FaPause } from 'react-icons/fa';
import './styles/SuccessModal.css';

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  operation, // 'create', 'edit', 'delete'
  vehicleName,
  autoCloseTime = 4000 
}) => {
  const [timeLeft, setTimeLeft] = React.useState(autoCloseTime / 1000);
  const [isPaused, setIsPaused] = React.useState(false);

  // Memoizar la función onClose para evitar re-renders innecesarios
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Manejar el escape key para cerrar el modal
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => document.removeEventListener('keydown', handleEscapeKey);
    }
  }, [isOpen, handleClose]);

  // Timer de auto-cierre con pausa
  useEffect(() => {
    if (isOpen && !isPaused) {
      setTimeLeft(autoCloseTime / 1000);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, autoCloseTime, handleClose, isPaused]);

  // Pausar/reanudar timer al hover
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  // Pausar/reanudar timer manualmente
  const togglePause = () => setIsPaused(!isPaused);

  // Enfocar el modal cuando se abre para accesibilidad
  const modalRef = React.useRef(null);
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getOperationConfig = () => {
    switch (operation) {
      case 'create':
        return {
          icon: <FaCar />,
          title: '¡Vehículo Creado Exitosamente!',
          message: `El vehículo "${vehicleName}" ha sido agregado al catálogo y está disponible para reservas.`,
          color: '#10b981', // green
          bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          secondaryColor: '#065f46'
        };
      case 'edit':
        return {
          icon: <FaEdit />,
          title: '¡Vehículo Actualizado Correctamente!',
          message: `Los datos del vehículo "${vehicleName}" han sido actualizados exitosamente.`,
          color: '#3b82f6', // blue
          bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          secondaryColor: '#1e40af'
        };
      case 'delete':
        return {
          icon: <FaTrash />,
          title: '¡Vehículo Eliminado Correctamente!',
          message: `El vehículo "${vehicleName}" ha sido eliminado permanentemente del sistema.`,
          color: '#ef4444', // red
          bgGradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          secondaryColor: '#991b1b'
        };
      default:
        return {
          icon: <FaCheckCircle />,
          title: '¡Operación Completada!',
          message: 'La operación se ha realizado correctamente.',
          color: '#10b981',
          bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          secondaryColor: '#065f46'
        };
    }
  };

  const config = getOperationConfig();

  // Prevenir el cierre al hacer clic dentro del modal
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div 
      className="success-modal-overlay" 
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
      aria-describedby="success-modal-message"
    >
      <div 
        className="success-modal-container"
        onClick={handleModalClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        ref={modalRef}
        tabIndex={-1}
      >
        <button 
          className="success-modal-close"
          onClick={handleClose}
          aria-label="Cerrar modal de éxito"
          title="Cerrar (Esc)"
        >
          <FaTimes />
        </button>
        
        <div className="success-modal-content">
          <div 
            className="success-modal-icon"
            style={{ 
              background: config.bgGradient,
              '--primary-color': config.color
            }}
          >
            <FaCheckCircle className="success-check" />
            <div className="success-operation-icon">
              {config.icon}
            </div>
          </div>
          
          <h2 
            id="success-modal-title" 
            className="success-modal-title"
          >
            {config.title}
          </h2>
          <p 
            id="success-modal-message"
            className="success-modal-message"
          >
            {config.message}
          </p>
          
          <div className="success-modal-actions">
            <button 
              className="success-modal-btn-primary"
              onClick={handleClose}
              style={{ 
                background: config.bgGradient,
                boxShadow: `0 4px 12px ${config.color}40`
              }}
              autoFocus
            >
              Continuar
            </button>
          </div>
          
          <div className="success-modal-timer">
            <div className="success-timer-controls">
              <div className="success-timer-text">
                {isPaused 
                  ? `Timer pausado (${timeLeft}s restantes)` 
                  : `Se cerrará automáticamente en ${timeLeft}s`
                }
              </div>
              <button 
                className="success-timer-toggle"
                onClick={togglePause}
                title={isPaused ? 'Reanudar timer' : 'Pausar timer'}
                aria-label={isPaused ? 'Reanudar timer automático' : 'Pausar timer automático'}
              >
                {isPaused ? <FaPlay /> : <FaPause />}
              </button>
            </div>
            <div 
              className={`success-timer-bar ${isPaused ? 'paused' : ''}`}
              style={{ 
                '--duration': `${autoCloseTime}ms`,
                backgroundColor: config.color 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
