import React from 'react';
import { FaEdit, FaSave, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';

/**
 * Componente para el campo de contraseña
 */
const PasswordField = ({
  isEditing,
  isSaving,
  newPassword,
  confirmPassword,
  showNewPassword,
  showConfirmPassword,
  onEdit,
  onSave,
  onCancel,
  setNewPassword,
  setConfirmPassword,
  setShowNewPassword,
  setShowConfirmPassword,
  validationErrors,
  getInputClassName
}) => {
  return (
    <div className="perfil-field perfil-field-vertical">
      <div className="perfil-field-content">
        {isEditing ? (
          <div className="perfil-field-edit perfil-password-edit">
            {/* Fila superior: Label y botones */}
            <div className="perfil-field-label">
              <span>Contraseña</span>
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
            {/* Inputs de contraseña */}
            <div className="perfil-password-inputs">
              {/* Nueva contraseña */}
              <div className="perfil-password-field">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={getInputClassName ? getInputClassName('password') : "perfil-input"}
                  placeholder="Nueva contraseña"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="perfil-password-toggle"
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {(validationErrors?.password || validationErrors?.newPassword) && (
                <div className="perfil-validation-message">
                  {validationErrors.newPassword || validationErrors.password}
                </div>
              )}
              {/* Confirmar contraseña */}
              <div className="perfil-password-field">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={getInputClassName ? getInputClassName('confirmPassword') : "perfil-input"}
                  placeholder="Confirmar contraseña"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="perfil-password-toggle"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {validationErrors?.confirmPassword && (
                <div className="perfil-validation-message">
                  {validationErrors.confirmPassword}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="perfil-field-display">
            <label className="perfil-field-label">Contraseña</label>
            <span className="perfil-field-value">-</span>
            <button 
              onClick={() => onEdit('password')} 
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

export default PasswordField;
