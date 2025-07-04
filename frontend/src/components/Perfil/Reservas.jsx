import React from 'react';
import { FaCalendarAlt } from 'react-icons/fa';

/**
 * Componente para mostrar las reservas del usuario
 */
const Reservas = () => {
  return (
    <div className="perfil-content">
      <div className="perfil-section">
        <h2 className="perfil-section-title">
          <FaCalendarAlt className="perfil-section-icon" />
          Reservas
        </h2>
        <div className="perfil-coming-soon">
          <p>Esta sección estará disponible próximamente.</p>
          <p>Aquí podrás ver y gestionar todas tus reservas de vehículos.</p>
        </div>
      </div>
    </div>
  );
};

export default Reservas;
