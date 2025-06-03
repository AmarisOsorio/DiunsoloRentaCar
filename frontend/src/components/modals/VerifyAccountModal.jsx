import React, { useState, useEffect } from 'react';
import '../styles/modals/VerifyAccountModal.css';
import { FaEnvelope } from 'react-icons/fa';
import useVerifyAccountModal from '../../hooks/useVerifyAccountModal';

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
  useEffect(() => {
    if (success) {
      const timer = setTimeout(async () => {
        // Login automático tras verificación exitosa
        if (email && password) {
          try {
            const res = await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ correo: email, contraseña: password })
            });
            const data = await res.json();
            if (data.message && data.message.toLowerCase().includes('login exitoso')) {
              onClose && onClose();
              window.location.href = '/'; // Redirige a inicio
            } else {
              // Si el login falla, solo cierra el modal
              onClose && onClose();
            }
          } catch {
            onClose && onClose();
          }
        } else {
          onClose && onClose();
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [success, onClose, email, password]);

  if (!open) return null;

  // Efecto de animación de éxito
  const showSuccessTick = !!success;

  return (
    <div className="register-modal-backdrop modal-fade-in" onClick={onClose}>
      <div className="register-verify-modal-content modal-slide-in" onClick={e => e.stopPropagation()}>
        <button className="register-modal-close" onClick={onClose}>&times;</button>
        {showSuccessTick ? (
          <div className="register-verify-success-anim-container">
            <div className="register-verify-success-anim">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="36" fill="#e6f9ed" stroke="#34c759" strokeWidth="4" />
                <polyline
                  points="24,44 36,56 56,32"
                  fill="none"
                  stroke="#34c759"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="register-verify-tick-path"
                />
              </svg>
            </div>
            <div className="register-verify-success-message">¡Cuenta Verificada!</div>
          </div>
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
