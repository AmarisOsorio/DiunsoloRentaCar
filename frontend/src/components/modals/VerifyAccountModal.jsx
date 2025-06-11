import React, { useState } from 'react';
import '../styles/modals/VerifyAccountModal.css';
import { FaEnvelope } from 'react-icons/fa';
import useVerifyAccountModal from '../../hooks/useVerifyAccountModal';
import AccountVerifiedScreen from '../AccountVerifiedScreen.jsx';

const VerifyAccountModal = ({ open, onClose, onVerify, onResend, email, password, onLoginAfterVerify }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showAccountVerified, setShowAccountVerified] = useState(false);

  const {
    register: rhfRegister,
    handleSubmit,
    errors,
    timer,
    formattedTimer,
    canResend,
    loading,
    error,
    setError,
    success,
    isVerified,
    onSubmit,
    handleResend
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

  React.useEffect(() => {
    if (isVerified) {
      setShowAccountVerified(true);
      const timeout = setTimeout(() => {
        setShowAccountVerified(false);
        if (onClose) onClose();
        window.location.href = '/';
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isVerified, onClose]);

  if (!open && !showAccountVerified) return null;

  return (
    <div className="register-modal-backdrop modal-fade-in" onClick={onClose}>
      <div className="register-verify-modal-content modal-slide-in" onClick={e => e.stopPropagation()}>
        <button
          className="register-modal-close"
          onClick={showAccountVerified ? () => { setShowAccountVerified(false); if (onClose) onClose(); } : onClose}
        >
          &times;
        </button>
        {showAccountVerified && <AccountVerifiedScreen onClose={() => { setShowAccountVerified(false); if (onClose) onClose(); }} />}
        {!showAccountVerified && <>
        <div className="register-verify-icon" aria-hidden="true">
          <FaEnvelope />
        </div>
        <h2 className="register-verify-title">¡Verifica tu Cuenta!</h2>
        <div className="register-verify-instruction">
          Hemos enviado un código de 6 dígitos a <span className="register-verify-email">{email}</span>.<br />
          Por favor, ingresa el código a continuación para activar tu cuenta.
        </div>
        <form onSubmit={handleSubmit(onSubmit)} autoComplete="off">
          <div className="register-verify-code-inputs">
            <input
              type="text"
              maxLength={6}
              inputMode="numeric"
              className="register-verify-code-input"
              {...rhfRegister('code', {
                required: 'El código es obligatorio',
                minLength: { value: 6, message: 'Debe tener 6 dígitos' },
                maxLength: { value: 6, message: 'Debe tener 6 dígitos' },
                pattern: { value: /^\w{6}$/, message: 'Solo letras y números' }
              })}
              aria-label="Código de verificación"
              autoFocus={open}
              style={{ letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.5em', width: '12em' }}
            />
          </div>
          <div className="register-verify-timer">
            El código expira en <b>{formattedTimer}</b>
          </div>
          {(error || errors.code) && <div className="register-verify-error" role="alert">{error || errors.code?.message}</div>}
          {success && <div className="register-verify-success" role="status">{success}</div>}
          <button className="register-verify-btn" type="submit" disabled={loading}>
            {loading ? (
              <span className="spinner" style={{ marginRight: 8 }}></span>
            ) : null}
            {loading ? 'Verificando...' : 'Verificar Cuenta'}
          </button>
        </form>
        <div className="register-verify-resend-row">
          ¿No recibiste el código?{' '}
          <span
            className={`register-verify-resend${!canResend ? ' disabled' : ''}`}
            onClick={canResend && !loading ? handleResend : undefined}
            tabIndex={canResend && !loading ? 0 : -1}
            role="button"
            aria-disabled={!canResend || loading}
            style={{ position: 'relative' }}
          >
            {loading && canResend ? (
              <span className="spinner" style={{ marginRight: 6, verticalAlign: 'middle' }}></span>
            ) : null}
            Reenviar
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
