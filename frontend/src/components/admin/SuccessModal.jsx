import React from 'react';
import { FaCheckCircle, FaTimes, FaCar, FaEdit, FaTrash } from 'react-icons/fa';
import './styles/SuccessModal.css';

const SuccessModal = ({ 
  isOpen, 
  onClose, 
  operation, // 'create', 'edit', 'delete'
  vehicleName,
  autoCloseTime = 3000 
}) => {
  const [timeLeft, setTimeLeft] = React.useState(autoCloseTime / 1000);

  React.useEffect(() => {
    if (isOpen) {
      setTimeLeft(autoCloseTime / 1000);
      
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, autoCloseTime, onClose]);

  if (!isOpen) return null;

  const getOperationConfig = () => {
    switch (operation) {
      case 'create':
        return {
          icon: <FaCar />,
          title: '¡Vehículo Creado!',
          message: `El vehículo "${vehicleName}" ha sido creado exitosamente.`,
          color: '#10b981' // green
        };
      case 'edit':
        return {
          icon: <FaEdit />,
          title: '¡Vehículo Actualizado!',
          message: `El vehículo "${vehicleName}" ha sido actualizado exitosamente.`,
          color: '#3b82f6' // blue
        };
      case 'delete':
        return {
          icon: <FaTrash />,
          title: '¡Vehículo Eliminado!',
          message: `El vehículo "${vehicleName}" ha sido eliminado exitosamente.`,
          color: '#ef4444' // red
        };
      default:
        return {
          icon: <FaCheckCircle />,
          title: '¡Operación Exitosa!',
          message: 'La operación se ha completado correctamente.',
          color: '#10b981'
        };
    }
  };

  const config = getOperationConfig();

  return (
    <div className="success-modal-overlay">
      <div className="success-modal-container">
        <button 
          className="success-modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <FaTimes />
        </button>
        
        <div className="success-modal-content">
          <div 
            className="success-modal-icon"
            style={{ backgroundColor: config.color }}
          >
            <FaCheckCircle className="success-check" />
            <div className="success-operation-icon">
              {config.icon}
            </div>
          </div>
          
          <h2 className="success-modal-title">{config.title}</h2>
          <p className="success-modal-message">{config.message}</p>
          
          <div className="success-modal-actions">
            <button 
              className="success-modal-btn-primary"
              onClick={onClose}
            >
              Continuar
            </button>
          </div>
          
          <div className="success-modal-timer">
            <div className="success-timer-text">
              Se cerrará automáticamente en {timeLeft}s
            </div>
            <div 
              className="success-timer-bar"
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
