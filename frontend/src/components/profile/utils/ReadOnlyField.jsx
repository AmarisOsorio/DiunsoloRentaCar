import React from 'react';

/**
 * Componente para mostrar un campo de solo lectura
 */
const ReadOnlyField = ({
  label,
  value,
  formatValue
}) => {
  return (
    <div className="perfil-field">
      <label className="perfil-field-label">{label}</label>
      <div className="perfil-field-content">
        <div className="perfil-field-display">
          <span className="perfil-field-value">
            {formatValue ? formatValue(value) : value}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReadOnlyField;
