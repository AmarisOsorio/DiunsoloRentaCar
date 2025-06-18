import React, { useEffect, useState, useRef } from 'react';
import '../styles/modals/ForgotPasswordModal.css';
import hiluxImg from '../../assets/ForgotPass.jpg';
import { useForgotPasswordModal } from '../../hooks/useForgotPasswordModal';
import { FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import SuccessCheckAnimation from '../SuccessCheckAnimation';

const ForgotPasswordModal = ({ open, onClose, onBackToLogin }) => {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);
  const [showSuccessAnim, setShowSuccessAnim] = useState(false);
  const [successAnimMessage, setSuccessAnimMessage] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const closeTimeout = useRef();

  // Usar el hook centralizado y único
  const {
    step,
    setStep,
    loading,
    message,
    handleCorreo,
    handleCode,
    handleNewPassword,
    handleReenviarCodigo,
    correoForm,
    codeForm,
    newPasswordForm,
    resetAll
  } = useForgotPasswordModal(onClose);

  useEffect(() => {
    if (open) {
      setShow(true);
      setClosing(false);
    } else if (show) {
      setClosing(true);
      closeTimeout.current = setTimeout(() => {
        setShow(false);
        setClosing(false);
        setStep(1); // Siempre vuelve al paso 1 al cerrar
        resetAll();
      }, 300);
    }
    return () => clearTimeout(closeTimeout.current);
  }, [open]);

  // Handler para volver al login desde la flecha
  const handleBackToLogin = (e) => {
    e.stopPropagation();
    setClosing(true);
    closeTimeout.current = setTimeout(() => {
      setShow(false);
      setClosing(false);
      if (onBackToLogin) {
        onBackToLogin();
      } else if (onClose) {
        onClose();
      }
    }, 300);
  };

  // Handler para cerrar con el fondo
  const handleBackdropClose = () => {
    if (showSuccessAnim) return; // No cerrar mientras se muestra la animación
    setClosing(true);
    closeTimeout.current = setTimeout(() => {
      setShow(false);
      setClosing(false);
      if (onClose) onClose();
    }, 300);
  };

  // Handler para mostrar animación y luego ir al login
  const handleShowSuccessAnim = (msg) => {
    setSuccessAnimMessage(msg);
    setShowSuccessAnim(true);
    setTimeout(() => {
      setShowSuccessAnim(false);
      setClosing(true);
      closeTimeout.current = setTimeout(() => {
        setShow(false);
        setClosing(false);
        if (onBackToLogin) {
          onBackToLogin();
        } else if (onClose) {
          onClose();
        }
      }, 300);
    }, 1800);
  };

  if (!show) return null;

  if (showSuccessAnim) {
    return (
      <div className="forgot-password-modal-backdrop modal-fade-in">
        <div className="forgot-password-modal-content forgot-password-modal-flex modal-slide-in" onClick={e => e.stopPropagation()}>
          <div className="forgot-password-modal-right" style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%'}}>
              <div className="login-modal-success-check-container">
                <svg width="90" height="90" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r="40" fill="#e6f9ed" stroke="#34c759" strokeWidth="5" />
                  <polyline
                    points="28,50 42,64 66,36"
                    fill="none"
                    stroke="#34c759"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="login-modal-success-message">{successAnimMessage || "¡Contraseña cambiada con éxito!"}</div>
              <div className="login-modal-success-subtitle">Ya puedes iniciar sesión con tu nueva contraseña.</div>
            </div>
          </div>
        </div>
      </div> 
    );
  }

  return (
    <div className={`forgot-password-modal-backdrop${open && !closing ? ' modal-fade-in' : ' modal-fade-out'}`} onClick={handleBackdropClose}>
      <div className={`forgot-password-modal-content forgot-password-modal-flex${open && !closing ? ' modal-slide-in' : ' modal-slide-out'}`} onClick={e => e.stopPropagation()}>
        {/* Imagen y overlay a la izquierda */}
        <div className="forgot-password-modal-left">
          <img src={hiluxImg} alt="Toyota Hilux" className="forgot-password-modal-img-bg" />
          <div className="forgot-password-modal-overlay" />
        </div>
        {/* Formulario a la derecha */}
        <div className="forgot-password-modal-right">
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
          {/* Mensaje solo visible en el paso 2 */}
          {step === 2 && (
            <form className="forgot-password-modal-form" data-step={step} onSubmit={codeForm.handleSubmit(handleCode)}>
              <div style={{width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="code">Código de verificación</label>
                <input
                  className="forgot-password-modal-input"
                  id="code"
                  name="code"
                  type="text"
                  pattern="[0-9]*"
                  maxLength={5}
                  style={{
                    width: '180px',
                    letterSpacing: '0.5em',
                    fontSize: '1.5rem',
                    textAlign: 'center',
                    fontWeight: 600,
                    border: '2px solid #009BDB',
                    borderRadius: '8px',
                    background: '#e6f6fb',
                    marginTop: 0,
                    display: 'block',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    paddingRight: 0
                  }}
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
              {message && (
                <div className={`forgot-password-modal-success-message${message.toLowerCase().includes('inválido') || message.toLowerCase().includes('incorrecto') ? ' error' : ''}`}>{message}</div>
              )}
              <div className="forgot-password-modal-actions">
                <button type="submit" className="forgot-password-modal-btn" disabled={loading}>{loading ? 'Verificando...' : 'Verificar código'}</button>
              </div>
            </form>
          )}
          {step === 3 && (
            <form className="forgot-password-modal-form" data-step={step} onSubmit={newPasswordForm.handleSubmit(async (data) => {
              setNewPasswordError("");
              // Validación: mínimo 6 caracteres
              if (data.newPassword.length < 6) {
                setNewPasswordError('La nueva contraseña debe tener al menos 6 caracteres.');
                newPasswordForm.setError('newPassword', { type: 'manual', message: 'La nueva contraseña debe tener al menos 6 caracteres.' });
                return;
              }
              // Validación: no igual a la anterior
              if (data.oldPassword && data.newPassword === data.oldPassword) {
                setNewPasswordError('La nueva contraseña no puede ser igual a la anterior.');
                newPasswordForm.setError('newPassword', { type: 'manual', message: 'La nueva contraseña no puede ser igual a la anterior.' });
                return;
              }
              // Validación: confirmación
              if (data.newPassword !== data.confirmPassword) {
                setNewPasswordError('Las contraseñas no coinciden.');
                newPasswordForm.setError('confirmPassword', { type: 'manual', message: 'Las contraseñas no coinciden.' });
                return;
              }
              const result = await handleNewPassword(data);
              if (result && result.success) {
                handleShowSuccessAnim('¡Contraseña cambiada con éxito!');
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
                    {...newPasswordForm.register('newPassword', { required: true })}
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
                    {...newPasswordForm.register('confirmPassword', { required: true })}
                  />
                  <span
                    onClick={() => setShowConfirmPassword(v => !v)}
                    className="input-eye-icon"
                    title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {newPasswordError && (
                  <div className="forgot-password-modal-input-error">{newPasswordError}</div>
                )}
              </div>
              <div className="forgot-password-modal-actions">
                <button type="submit" className="forgot-password-modal-btn" disabled={loading}>{loading ? 'Cambiando...' : 'Cambiar contraseña'}</button>
              </div>
            </form>
          )}
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
