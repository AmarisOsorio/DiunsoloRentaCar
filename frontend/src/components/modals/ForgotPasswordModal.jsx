import React, { useEffect, useState, useRef } from 'react';
import '../styles/modals/ForgotPasswordModal.css';
import hiluxImg from '../../assets/ForgotPass.jpg';
import { useForgotPasswordForm } from '../../hooks/useForgotPasswordForm';
import { FaArrowRight } from 'react-icons/fa';

const ForgotPasswordModal = ({ open, onClose, onBackToLogin }) => {
  const [show, setShow] = useState(false);
  const [closing, setClosing] = useState(false);
  const closeTimeout = useRef();

  // Usar el hook centralizado
  const {
    step,
    setStep,
    loading,
    message,
    handleCorreo,
    handleCode,
    handleNewPassword,
    correoForm,
    codeForm,
    newPasswordForm,
    resetAll
  } = useForgotPasswordForm(onClose);

  useEffect(() => {
    if (open) {
      setShow(true);
      setClosing(false);
    } else if (show) {
      setClosing(true);
      closeTimeout.current = setTimeout(() => {
        setShow(false);
        setClosing(false);
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
    setClosing(true);
    closeTimeout.current = setTimeout(() => {
      setShow(false);
      setClosing(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!show) return null;

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
              className={`forgot-password-step${step === 1 ? ' active' : ''}`}
              style={{cursor: step > 1 ? 'pointer' : 'default'}}
              onClick={() => {
                if (step > 1 && typeof setStep === 'function') {
                  resetAll();
                  setStep(1);
                }
              }}
            >1</span>
            <span className={`forgot-password-step${step === 2 ? ' active' : ''}`}>2</span>
            <span className={`forgot-password-step${step === 3 ? ' active' : ''}`}>3</span>
          </div>
          <div className="forgot-password-modal-desc">Recupera tu cuenta en 3 pasos</div>
          {message && <div className="forgot-password-modal-success-message">{message}</div>}
          {step === 1 && (
            <form className="forgot-password-modal-form" data-step={step} onSubmit={correoForm.handleSubmit(handleCorreo)}>
              <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="correo">Correo electrónico</label>
              <input className="forgot-password-modal-input" id="correo" name="correo" type="email" {...correoForm.register('correo', { required: true })} />
              <div className="forgot-password-modal-actions">
                <button type="submit" className="forgot-password-modal-btn" disabled={loading}>{loading ? 'Enviando...' : 'Enviar código'}</button>
              </div>
            </form>
          )}
          {step === 2 && (
            <form className="forgot-password-modal-form" data-step={step} onSubmit={codeForm.handleSubmit(handleCode)}>
              <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="code">Código de verificación</label>
              <input className="forgot-password-modal-input" id="code" name="code" type="text" {...codeForm.register('code', { required: true })} />
              <div className="forgot-password-modal-actions">
                <button type="button" className="forgot-password-modal-btn forgot-password-modal-btn-link" onClick={handleCorreo} disabled={loading} style={{marginLeft:8,marginRight:8}}>Reenviar código</button>
                <button type="submit" className="forgot-password-modal-btn" disabled={loading}>{loading ? 'Verificando...' : 'Verificar código'}</button>
              </div>
            </form>
          )}
          {step === 3 && (
            <form className="forgot-password-modal-form" data-step={step} onSubmit={newPasswordForm.handleSubmit(handleNewPassword)}>
              <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="newPassword">Nueva contraseña</label>
              <input className="forgot-password-modal-input" id="newPassword" name="newPassword" type="password" {...newPasswordForm.register('newPassword', { required: true })} />
              <div className="forgot-password-modal-actions">
                <button type="submit" className="forgot-password-modal-btn" disabled={loading}>{loading ? 'Cambiando...' : 'Cambiar contraseña'}</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
