import React, { useState } from 'react';
import '../styles/modals/VerifyAccountModal.css';
import { FaEnvelope } from 'react-icons/fa';
import useVerifyAccountModal from '../../hooks/useVerifyAccountModal';
import AccountVerifiedScreen from '../AccountVerifiedScreen.jsx'; // Se queda la importación de Eduardo

const VerifyAccountModal = ({ open, onClose, onVerify, onResend, email, password, onLoginAfterVerify }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showAccountVerified, setShowAccountVerified] = useState(false); // Se queda el estado de Eduardo

  const {
    code: codeArr, // Se queda la desestructuración de Eduardo
    handleInput,
    handlePaste,
    handleSubmit: originalHandleSubmit,
    handleResend,
    inputRefs,
    formattedTimer,
    canResend,
    loading,
    error,
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

  // Lógica del useEffect de Eduardo para el cierre del modal y redirección
  const handleAccountVerifiedClose = () => {
    setShowAccountVerified(false);
    if (onClose) onClose();
  };

  React.useEffect(() => {
    if (isVerified) {
      setShowAccountVerified(true);
      // Cierra el modal automáticamente después de 2s
      const timeout = setTimeout(() => {
        setShowAccountVerified(false);
        if (onClose) onClose();
        window.location.href = '/'; // Redirige a inicio después de verificación
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isVerified, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    originalHandleSubmit(); // Se mantiene el handleSubmit original
  };

  // Se usa la condición de renderizado de Eduardo
  if (!open && !showAccountVerified) return null;

  return (
    <div className="register-modal-backdrop modal-fade-in" onClick={onClose}>
      <div className="register-verify-modal-content modal-slide-in" onClick={e => e.stopPropagation()}>
        {/* Botón de cerrar y renderizado condicional de Eduardo */}
        <button
          className="register-modal-close"
          onClick={showAccountVerified ? handleAccountVerifiedClose : onClose}
        >
          &times;
        </button>
        {showAccountVerified && <AccountVerifiedScreen onClose={handleAccountVerifiedClose} />}
        {!showAccountVerified && <>
        <div className="register-verify-icon" aria-hidden="true">
          <FaEnvelope />
        </div>
        <h2 className="register-verify-title">¡Verifica tu Cuenta!</h2>
        <div className="register-verify-instruction">
          Hemos enviado un código de 6 dígitos a <span className="register-verify-email">{email}</span>.<br />
          Por favor, ingresa el código a continuación para activar tu cuenta.
        </div>
        <form onSubmit={originalHandleSubmit} autoComplete="off">
          <div className="register-verify-code-inputs" onPaste={handlePaste}>
            {codeArr.map((digit, idx) => ( // Se usa `codeArr` de Eduardo
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
          {error && <div className="register-verify-error" role="alert">{error}</div>}
          {success && <div className="register-verify-success" role="status">{success}</div>}
          <button className="register-verify-btn" type="submit" disabled={loading || codeArr.some(d => d === '')}> {/* Se usa `codeArr` de Eduardo */}
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
            Reenviar Codigo
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
