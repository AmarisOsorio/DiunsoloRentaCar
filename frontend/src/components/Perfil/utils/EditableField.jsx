import React from 'react';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

/**
 * Componente reutilizable para campos editables
 */
const EditableField = ({
  label,
  fieldName,
  value,
  tempValue,
  isEditing,
  isSaving,
  type = 'text',
  placeholder,
  maxLength,
  onEdit,
  onSave,
  onCancel,
  onChange,
  formatValue,
  displayValue,
  validationError,
  getInputClassName
}) => {
  // Mostrar displayValue si es definido (aunque sea vacío), si no, mostrar value
  const showValue = displayValue !== undefined ? displayValue : value;
  return (
    <div className="perfil-field">
      <label className="perfil-field-label">{label}</label>
      <div className="perfil-field-content">
        {isEditing ? (
          <div className="perfil-field-edit">
            <div className="perfil-field-edit-row">
              <input
                type={type}
                value={tempValue || ''}
                onChange={(e) => {
                  const newValue = formatValue ? formatValue(e.target.value) : e.target.value;
                  onChange(fieldName, newValue);
                }}
                className={getInputClassName ? getInputClassName(fieldName) : "perfil-input"}
                placeholder={placeholder}
                maxLength={maxLength}
              />
              <div className="perfil-field-actions">
                <button 
                  onClick={onSave} 
                  className="perfil-btn perfil-btn-save"
                  disabled={isSaving}
                >
                  {isSaving ? '⏳' : <FaSave />}
                </button>
                <button onClick={onCancel} className="perfil-btn perfil-btn-cancel">
                  <FaTimes />
                </button>
              </div>
            </div>
            {validationError && (
              <div className="perfil-validation-message">
                {validationError}
              </div>
            )}
          </div>
        ) : (
          <div className="perfil-field-display">
            <span className="perfil-field-value">
              {showValue}
            </span>
            <button 
              onClick={() => onEdit(fieldName)} 
              className="perfil-btn perfil-btn-edit"
            >
              <FaEdit />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditableField;
