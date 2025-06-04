import React, { useState, useEffect } from 'react';
import '../styles/modals/VerifyAccountModal.css';
import { FaEnvelope } from 'react-icons/fa';
import useVerifyAccountModal from '../../hooks/useVerifyAccountModal';
import SuccessCheckAnimation from '../SuccessCheckAnimation';
import usePostVerification from '../../hooks/usePostVerification';

const VerifyAccountModal = ({ open, onClose, onVerify, onResend, email, password }) => {
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const {
    code,
    handleInput,
    handlePaste,
    handleSubmit,
    handleResend,
    inputRefs,
    formattedTimer,
    canResend,
    loading,
    error,
    success
  } = useVerifyAccountModal(email, onVerify, async () => {
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

  // Efecto: cerrar modal y redirigir tras éxito + login automático
  usePostVerification({ success, email, password, onClose, redirectUrl: '/catalogo' });

  if (!open) return null;

  // Efecto de animación de éxito
  const showSuccessTick = !!success;

  return (
    <div className="register-modal-backdrop modal-fade-in" onClick={onClose}>
      <div className="register-verify-modal-content modal-slide-in" onClick={e => e.stopPropagation()}>
        <button className="register-modal-close" onClick={onClose}>&times;</button>
        {showSuccessTick ? (
          <SuccessCheckAnimation
            message="¡Cuenta verificada con éxito!"
            subtitle={<span style={{fontWeight:'normal',fontSize:'1rem'}}>¡Bienvenido a DIUNSOLO Renta Car!</span>}
            nextAction={
              <>
                <span>¿Listo para tu primer viaje?</span><br/>
                <span style={{color:'#7c3aed',fontWeight:'bold'}}>Serás dirigido al <b>Catálogo</b> automáticamente...</span>
                <div style={{marginTop:'1.2rem'}}>
                  <a href="/catalogo" className="catalogo-cta-btn">Ir al Catálogo</a>
                </div>
              </>
            }
          />
        ) : (
          <>
            <div className="register-verify-icon" aria-hidden="true">
              <FaEnvelope />
            </div>
            <h2 className="register-verify-title">¡Verifica tu Cuenta!</h2>
            <div className="register-verify-instruction">
              Hemos enviado un código de 6 dígitos a <span className="register-verify-email">{email}</span>.<br />
              Por favor, ingresa el código a continuación para activar tu cuenta.
            </div>
            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="register-verify-code-inputs" onPaste={handlePaste}>
                {code.map((digit, idx) => (
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
              <button className="register-verify-btn" type="submit" disabled={loading || code.some(d => d === '')}>
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
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyAccountModal;
