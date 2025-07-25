import React, { useState } from 'react';
import './VerifyAccountModal.css';
import { FaEnvelope } from 'react-icons/fa';
import useVerifyAccountModal from './hooks/useVerifyAccountModal.jsx';
import SuccessCheckAnimation from '../../../../interactions/SuccessCheck/SuccessCheckAnimation.jsx';

const VerifyAccountModal = ({
  open,
  onClose,
  onVerify,
  onResend,
  email,
  password,
  verifying = false,
  resending = false,
  onLoginAfterVerify,
  emailCodeReady = true, // por defecto true para compatibilidad
  error // <-- error externo
}) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showAccountVerified, setShowAccountVerified] = useState(false);

  const {
    code: codeArr,
    handleInput,
    handlePaste,
    handleSubmit: originalHandleSubmit,
    handleResend,
    inputRefs,
    formattedTimer,
    canResend,
    loading,
    error: localError,
    success,
    isVerified
  } = useVerifyAccountModal(email, async (code) => await onVerify(code), async () => {
    try {
      const result = await onResend();
      if (result && result.message && result.message.includes('No hay sesión de verificación activa')) {
        setToastMsg('No hay sesión de verificación activa. Por favor regístrate de nuevo.');
      } else if (result && result.message && result.message.toLowerCase().includes('nuevo código enviado')) {
        setToastMsg('¡Código reenviado! Revisa tu correo.');
      } else {
        setToastMsg('¡Código reenviado! Revisa tu correo.');
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    } catch {
      setToastMsg('No se pudo reenviar el código.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);
    }
  });

  // Recibe error externo del hook padre (useInfoPerfil)
  const externalError = error;

  React.useEffect(() => {
    if (isVerified) {
      setShowAccountVerified(true);
      // El login automático se maneja desde useRegisterModal
      const timeout = setTimeout(() => {
        setShowAccountVerified(false);
        if (onClose) onClose();
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isVerified, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    originalHandleSubmit();
  };

  // Se usa la condición de renderizado de Eduardo
  if (!open && !showAccountVerified) return null;
  // Usar SuccessCheckAnimation para éxito de verificación
  if (showAccountVerified) {
    setTimeout(() => {
      if (onClose) onClose();
    }, 1200);
    return (
      <SuccessCheckAnimation
        message="¡Cuenta verificada!"
        subtitle="Iniciando sesión automáticamente..."
        onClose={onClose}
        duration={1200}
      />
    );
  }

  return (
    <div className="register-modal-backdrop modal-fade-in" onClick={onClose}>
      <div className="register-verify-modal-content modal-slide-in" onClick={e => e.stopPropagation()}>
        {/* Botón de cerrar y renderizado condicional de Eduardo */}
        <button
          className="register-modal-close"
          onClick={showAccountVerified ? onClose : onClose}
        >
          &times;
        </button>
        {!showAccountVerified && <>
        <div className="register-verify-icon" aria-hidden="true">
          <FaEnvelope />
        </div>
        <h2 className="register-verify-title">¡Verifica tu Cuenta!</h2>
        <div className="register-verify-instruction">
          Hemos enviado un código de 6 dígitos a su correo <span className="register-verify-email">{email}</span>.<br />
          Por favor, ingresa el código a continuación para activar tu cuenta.
        </div>
        <form onSubmit={e => { e.preventDefault(); onVerify(codeArr.join('')); }} autoComplete="off">
          <div className="register-verify-code-inputs" onPaste={handlePaste}>
            {codeArr.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                inputMode="text"
                pattern=".{1}"
                maxLength={1}
                className="register-verify-code-input"
                value={digit}
                onChange={e => handleInput(idx, e.target.value)}
                ref={el => inputRefs.current[idx] = el}
                aria-label={`Dígito ${idx + 1}`}
                tabIndex={open ? 0 : -1}
                autoFocus={idx === 0}
                onKeyDown={e => {
                  if (e.key === 'Backspace' && !digit && idx > 0) {
                    inputRefs.current[idx - 1]?.focus();
                  }
                }}
              />
            ))}
          </div>
          <div className="register-verify-timer">
            El código expira en <b>{formattedTimer}</b>
          </div>
          {(localError || externalError) && (
            <div className="register-verify-error" role="alert">{localError || externalError}</div>
          )}
          {success && <div className="register-verify-success" role="status">{success}</div>}
          <button
            className="register-verify-btn register-verify-btn-relative"
            type="submit"
            disabled={codeArr.some(d => d === '') || verifying || showAccountVerified || !emailCodeReady}
            title={!emailCodeReady ? 'Espera a que el código esté listo' : ''}
          >
            {(verifying || loading) && (
              <span className="spinner register-verify-btn-spinner"></span>
            )}
            <span className={verifying || loading ? 'register-verify-btn-text-disabled' : ''}>
              Verificar Cuenta
            </span>
          </button>
        </form>
        <div className="register-verify-resend-row">
          ¿No recibiste el código?{' '}
          <span
            className={`register-verify-resend${!canResend ? ' disabled' : ''} register-verify-resend-relative`}
            onClick={canResend && !resending ? handleResend : undefined}
            tabIndex={canResend && !resending ? 0 : -1}
            role="button"
            aria-disabled={!canResend || resending}
          >
            {resending && canResend && (
              <span className="spinner register-verify-resend-spinner"></span>
            )}
            <span className={resending ? 'register-verify-resend-text-disabled' : ''}>
              Reenviar Codigo
            </span>
          </span>
        </div>
        {showToast && (
          <div className="register-toast">
            {toastMsg}
          </div>
        )}
        </>}
      </div>
    </div>
  );
};

export default VerifyAccountModal;