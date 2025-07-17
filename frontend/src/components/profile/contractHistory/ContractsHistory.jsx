import React from 'react';
import { FaFileContract } from 'react-icons/fa';

/**
 * Componente para mostrar los contratos del usuario
 */
const Contratos = () => {
  return (
    <div className="perfil-content">
      <div className="perfil-section">
        <h2 className="perfil-section-title">
          <FaFileContract className="perfil-section-icon" />
          Contratos
        </h2>
        <div className="perfil-coming-soon">
          <p>Esta sección estará disponible próximamente.</p>
          <p>Aquí podrás ver y descargar todos tus contratos de alquiler.</p>
        </div>
      </div>
    </div>
  );
};

export default Contratos;
