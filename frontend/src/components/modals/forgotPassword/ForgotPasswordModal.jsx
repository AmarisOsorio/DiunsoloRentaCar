import React, { useEffect, useState, useRef } from 'react';
import './ForgotPasswordModal.css';
import hiluxImg from '../../../assets/ForgotPass.jpg';
import { FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import SuccessCheckAnimation from '../SuccessCheck/SuccessCheckAnimation.jsx';
import useForgotPasswordModal from './hooks/useForgotPasswordModal.js';

/**
 * Modal de recuperación de contraseña.
 * Permite al usuario recuperar su cuenta en 3 pasos:
 * 1. Ingresar correo
 * 2. Ingresar código de verificación
 * 3. Ingresar nueva contraseña
 */
const ForgotPasswordModal = ({ open, onClose, onBackToLogin }) => {
  // Hook personalizado que maneja toda la lógica del modal
  const {
    step,
    setStep,
    loading,
    message,
    handleCorreo,
    handleReenviarCodigo,
    handleCode,
    handleNewPassword,
    correoForm,
    codeForm,
    newPasswordForm,
    resetAll,
  } = useForgotPasswordModal(onClose);

  // Estados para mostrar/ocultar el modal y animaciones (solo UI)
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const [successAnimMessage, setSuccessAnimMessage] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const closeTimeout = useRef();
  // Sincronizar el estado interno 'show' con la prop 'open'
  useEffect(() => {
    if (open) {
      setShow(true);
      setClosing(false);
    } else {
      setClosing(true);
      const timeout = setTimeout(() => {
        setShow(false);
        setClosing(false);
      }, 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);
  // Cierra el modal al hacer click en el fondo
  const handleBackdropClose = () => {
    if (showSuccessAnim) return; // No cerrar si está la animación de éxito
    setClosing(true);
    closeTimeout.current = setTimeout(() => {
      setShow(false);
      setClosing(false);
      setStep(1);
      resetAll(); // Usar la función del hook
      setNewPasswordError(""); // Limpiar errores locales
      if (onClose) onClose();
    }, 300);
  };

  // Cierra el modal y vuelve al login
  const handleBackToLogin = (e) => {
    e.stopPropagation();
    setClosing(true);
    closeTimeout.current = setTimeout(() => {
      setShow(false);
      setClosing(false);
      setStep(1);
      resetAll(); // Usar la función del hook
      setNewPasswordError(""); // Limpiar errores locales
      if (onBackToLogin) {
        onBackToLogin();
      } else if (onClose) {
        onClose();
      }
    }, 300);
  };
  // Muestra animación de éxito y luego cierra el modal
  const handleShowSuccessAnim = (msg) => {
    setSuccessAnimMessage(msg);
    setShowSuccessAnim(true);
    setTimeout(() => {
      setShowSuccessAnim(false);
      setClosing(true);
      closeTimeout.current = setTimeout(() => {
        setShow(false);
        setClosing(false);
        setStep(1);
        resetAll(); // Usar la función del hook
        setNewPasswordError(""); // Limpiar errores locales
        if (onBackToLogin) {
          onBackToLogin();
        } else if (onClose) {
          onClose();
        }
      }, 300);
    }, 1800);
  };

  // Si el modal no debe mostrarse, no renderiza nada
  if (!show) return null;
  // Renderiza animación de éxito si corresponde
  if (showSuccessAnim) {
    return (
      <SuccessCheckAnimation
        message={successAnimMessage || "¡Contraseña cambiada con éxito!"}
        subtitle="Ya puedes iniciar sesión con tu nueva contraseña."
      />
    );
  }

  // Render principal del modal
  return (
    <div className={`forgot-password-modal-backdrop${open && !closing ? ' modal-fade-in' : ' modal-fade-out'}`} onClick={handleBackdropClose}>
      <div className={`forgot-password-modal-content forgot-password-modal-flex${open && !closing ? ' modal-slide-in' : ' modal-slide-out'}`} onClick={e => e.stopPropagation()}>
        {/* Lado izquierdo: imagen y overlay */}
        <div className="forgot-password-modal-left">
          <img src={hiluxImg} alt="Toyota Hilux" className="forgot-password-modal-img-bg" />
          <div className="forgot-password-modal-overlay" />
        </div>
        {/* Lado derecho: formulario y pasos */}
        <div className="forgot-password-modal-right">
          {/* Botón para volver al login */}
          <button
            className="forgot-password-modal-back-login forgot-password-modal-back-login--right"
            onClick={handleBackToLogin}
            title="Volver al login"
          >
            <span>Volver al login</span>
            <FaArrowRight size={16} />
          </button>
          <h2 className="forgot-password-modal-title">Recuperación contraseña</h2>
          {/* Pasos visuales */}
          <div className="forgot-password-modal-steps">
            <span
              className={`forgot-password-step${step >= 1 ? ' active' : ''}`}
              style={{cursor: step > 1 ? 'pointer' : 'default'}}
              onClick={() => {
                if (step > 1 && typeof setStep === 'function') {
                  resetAll();
                  setStep(1);
                }
              }}
            >1</span>
            <span className="forgot-password-step-bar-container">
              <span className="forgot-password-step-bar-bg">
                <span className="forgot-password-step-bar-fill" style={{ width: step === 1 ? '0%' : step === 2 ? '100%' : '100%' }}></span>
              </span>
            </span>
            <span className={`forgot-password-step${step >= 2 ? ' active' : ''}`}>2</span>
            <span className="forgot-password-step-bar-container">
              <span className="forgot-password-step-bar-bg">
                <span className="forgot-password-step-bar-fill" style={{ width: step === 3 ? '100%' : '0%' }}></span>
              </span>
            </span>
            <span className={`forgot-password-step${step >= 3 ? ' active' : ''}`}>3</span>
          </div>
          <div className="forgot-password-modal-desc">Recupera tu cuenta en 3 pasos</div>

          {/* Paso 2: Código de verificación */}
          {step === 2 && (
            <form className="forgot-password-modal-form" data-step={step} onSubmit={codeForm.handleSubmit(handleCode)}>
              <div className="forgot-password-modal-code-input-wrapper">
                <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="code">Código de verificación</label>
                <input
                  className="forgot-password-modal-input forgot-password-modal-input-code"
                  id="code"
                  name="code"
                  type="text"
                  pattern="[0-9]*"
                  maxLength={5}
                  {...codeForm.register('code', {
                    required: true,
                    pattern: /^[0-9]{5}$/,
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/[^0-9]/g, '');
                    }
                  })}
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </div>
              <div className="forgot-password-resend-row">
                <span>¿No recibiste el código? </span>
                <button
                  type="button"
                  className="forgot-password-modal-btn forgot-password-modal-btn-link"
                  onClick={handleReenviarCodigo}
                  disabled={loading}
                >
                  Reenviar código
                </button>
              </div>
              {/* Mensaje de éxito o error del backend */}
              {message && (
                <div className={`forgot-password-modal-success-message${message.toLowerCase().includes('inválido') || message.toLowerCase().includes('incorrecto') ? ' error' : ''}`}>{message}</div>
              )}
              <div className="forgot-password-modal-actions">
                <button type="submit" className="forgot-password-modal-btn" disabled={loading}>{loading ? 'Verificando...' : 'Verificar código'}</button>
              </div>
            </form>
          )}          {/* Paso 3: Nueva contraseña */}
          {step === 3 && (
            <form className="forgot-password-modal-form" data-step={step} onSubmit={newPasswordForm.handleSubmit(async (data) => {
              setNewPasswordError("");
              // Validación manual de mínimo 6 caracteres
              if (!data.newPassword || data.newPassword.length < 6) {
                newPasswordForm.setError('newPassword', { type: 'manual', message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
                return;
              }
              // Validación de confirmación de contraseña
              if (data.newPassword !== data.confirmPassword) {
                setNewPasswordError('Las contraseñas no coinciden.');
                newPasswordForm.setError('confirmPassword', { type: 'manual', message: 'Las contraseñas no coinciden.' });
                return;
              }
              // Solo si pasa todas las validaciones, llama al backend usando el hook
              const result = await handleNewPassword(data);
              if (result && result.success) {
                handleShowSuccessAnim('¡Contraseña cambiada con éxito!');
              } else if (result && result.message) {
                setNewPasswordError(result.message);
              }
            })}>
              <div className="input-eye-wrapper">
                <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="newPassword">Nueva contraseña</label>
                <div className="input-eye-input-container">
                  <input
                    className="forgot-password-modal-input"
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    {...newPasswordForm.register('newPassword', {
                      required: 'La nueva contraseña es obligatoria.',
                      minLength: { value: 6, message: 'La nueva contraseña debe tener al menos 6 caracteres.' },
                      onChange: (e) => {
                        setNewPasswordError("");
                        if (newPasswordForm.formState.errors.newPassword) {
                          newPasswordForm.clearErrors('newPassword');
                        }
                      }
                    })}
                  />
                  <span
                    onClick={() => setShowNewPassword(v => !v)}
                    className="input-eye-icon"
                    title={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="confirmPassword" style={{marginTop: '14px'}}>Confirmar contraseña</label>
                <div className="input-eye-input-container">
                  <input
                    className="forgot-password-modal-input"
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...newPasswordForm.register('confirmPassword', {
                      required: 'La confirmación es obligatoria.',
                      onChange: () => {
                        setNewPasswordError("");
                        if (newPasswordForm.formState.errors.confirmPassword) {
                          newPasswordForm.clearErrors('confirmPassword');
                        }
                      }
                    })}
                  />
                  <span
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="input-eye-icon"
                    title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {/* Mostrar solo un error: primero RHF, luego manual/backend */}
                {newPasswordForm.formState.errors.newPassword ? (
                  <div className="forgot-password-modal-input-error">{newPasswordForm.formState.errors.newPassword.message}</div>
                ) : newPasswordForm.formState.errors.confirmPassword ? (
                  <div className="forgot-password-modal-input-error">{newPasswordForm.formState.errors.confirmPassword.message}</div>
                ) : newPasswordError ? (
                  <div className="forgot-password-modal-input-error">{newPasswordError}</div>
                ) : null}
              </div>
              <div className="forgot-password-modal-actions">
                <button type="submit" className="forgot-password-modal-btn" disabled={loading}>{loading ? 'Cambiando...' : 'Cambiar contraseña'}</button>
              </div>
            </form>
          )}

          {/* Paso 1: Correo electrónico */}
          {step === 1 && (
            <form className="forgot-password-modal-form" data-step={step} onSubmit={correoForm.handleSubmit(handleCorreo)}>
              <div style={{width: '100%'}}>
                <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="correo">Correo electrónico</label>
                <input className="forgot-password-modal-input" id="correo" name="correo" type="email" {...correoForm.register('correo', { required: true })} />
              </div>
              <div className="forgot-password-modal-actions">
                <button type="submit" className="forgot-password-modal-btn" disabled={loading}>{loading ? 'Enviando...' : 'Enviar código'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
