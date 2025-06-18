import React from 'react';
import '../styles/modals/LoginModal.css';
import LoginImg from '../../assets/imgLogin.jpg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useLogin from '../../hooks/useLogin.js';
import TooltipPortal from './TooltipPortal.jsx';
import VerifyAccountModal from './VerifyAccountModal.jsx';
import LoadingModalBackdrop from './LoadingModalBackdrop.jsx';

const LoginModal = ({ open, onClose, onOpenRegister, onOpenForgot }) => {
  const {
    email,
    password,
    error,
    showLoginPassword,
    setEmail,
    setPassword,
    toggleShowPassword,
    handleSubmit,
    SuccessScreen,
    showSuccess,
    showVerifyModal,
    setShowVerifyModal,
    pendingVerificationEmail,
    pendingVerificationPassword,
    loading,
    pendingShowVerify,
    handleVerifyAndLogin // <-- Usar la función expuesta del hook
  } = useLogin(onClose);
  const [show, setShow] = React.useState(false);
  const [emailRef, setEmailRef] = React.useState(null);
  const [passwordRef, setPasswordRef] = React.useState(null);
  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');
  const [focusedField, setFocusedField] = React.useState(null);
  const [hasTriedLogin, setHasTriedLogin] = React.useState(false);
  const { setError } = useLogin(onClose); // <-- Extraer setError

  React.useEffect(() => {
    if (open) {
      setShow(true);
      setEmailError('');
      setPasswordError('');
      setFocusedField(null);
      setHasTriedLogin(false); // <-- Reset al abrir
      setError && setError(''); // <-- Limpiar error global
    } else {
      // Espera la animación antes de desmontar
      const timeout = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  // useEffect para redirección tras éxito
  React.useEffect(() => {
    if (SuccessScreen && showSuccess) {
      const timeout = setTimeout(() => {
        onClose && onClose();
        window.location.href = '/';
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [SuccessScreen, showSuccess, onClose]);

  const handleOpenRegister = (e) => {
    e.preventDefault();
    onOpenRegister && onOpenRegister();
  };
  const handleOpenForgot = (e) => {
    e.preventDefault();
    onOpenForgot && onOpenForgot();
  };

  const validateEmail = (value) => {
    if (!value) return 'El correo es obligatorio';
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) return 'Correo inválido';
    return '';
  };
  const validatePassword = (value) => {
    if (!value) return 'La contraseña es obligatoria';
    if (value.length < 6) return 'Mínimo 6 caracteres';
    return '';
  };

  const handleEmailBlur = () => {
    setEmailError(validateEmail(email));
    setHasTriedLogin(true);
  };
  const handlePasswordBlur = () => {
    setPasswordError(validatePassword(password));
    setHasTriedLogin(true);
  };
  const handleSubmitWithValidation = (e) => {
    e.preventDefault();
    setHasTriedLogin(true);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(passErr);
    if (emailErr || passErr) return;
    handleSubmit(e);
  };

  // Handler para cerrar el modal de verificación
  const handleCloseVerify = () => {
    setShowVerifyModal(false);
    onClose && onClose();
  };

  // Handler para reenviar el código de verificación
  const handleResendVerificationCode = async () => {
    try {
      const res = await fetch('/api/registerClients/resendCodeEmail', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return await res.json();
    } catch (err) {
      return { message: 'No se pudo reenviar el código.' };
    }
  };

  // Escucha el evento para mostrar el modal de éxito tras verificación
  React.useEffect(() => {
    const handler = () => {
      if (typeof setShowLogged === 'function') setShowLogged(true);
    };
    window.addEventListener('show-login-success', handler);
    return () => window.removeEventListener('show-login-success', handler);
  }, []);

  // Mostrar modal de verificación si corresponde (tiene máxima prioridad)
  if (showVerifyModal) {
    return (
      <VerifyAccountModal
        open={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        onVerify={handleVerifyAndLogin}
        onResend={handleResendVerificationCode}
        email={pendingVerificationEmail}
        password={pendingVerificationPassword}
      />
    );
  }

  // Mostrar pantalla de éxito si corresponde
  if (SuccessScreen && showSuccess) {
    return <SuccessScreen onClose={() => {}} />;
  }

  if (!open && !show) return null;

  return (
    <>
      {SuccessScreen && <SuccessScreen onClose={() => {}} />}
      <div className={`login-modal-backdrop${open ? ' modal-fade-in' : ' modal-fade-out'}`} onClick={onClose} style={showSuccess ? { pointerEvents: 'none', opacity: 0.5 } : {}}>
        <div className={`login-modal-content${open ? ' modal-slide-in' : ' modal-slide-out'}`} onClick={e => e.stopPropagation()}>
          <div className="login-modal-left">
            <img src={LoginImg} alt="Ejemplo" className="login-modal-img-bg" />
            <div className="login-modal-overlay" />
          </div>
          <div className="login-modal-right">
            <button className="login-modal-close" onClick={onClose}>&times;</button>
            <h2 className="login-modal-title">Iniciar sesión</h2>
            <div className="login-modal-register">
              ¿Aún no tienes cuenta?{' '}
              <a href="#" className="login-modal-link" onClick={handleOpenRegister}>Regístrate</a>.
            </div>
            <form className="login-modal-form" onSubmit={handleSubmitWithValidation} autoComplete="off">
              <label htmlFor="login-email" className="login-modal-label">Correo electrónico</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="Correo Electrónico"
                  autoComplete="email"
                  ref={el => setEmailRef(el)}
                  onBlur={() => { handleEmailBlur(); setFocusedField(null); }}
                  onFocus={() => setFocusedField('email')}
                  className={emailError || error === 'Usuario no encontrado' ? 'input-error' : ''}
                  style={emailError ? { borderColor: '#d8000c', background: '#fff0f0' } : {}}
                  disabled={loading}
                />
                {(emailError || error === 'Usuario no encontrado') && (
                  <span className="fb-error-icon">!</span>
                )}
                <TooltipPortal targetRef={{ current: emailRef }} visible={((hasTriedLogin || focusedField === 'email') && (!!emailError || error === 'Usuario no encontrado'))}>
                  {emailError || (error === 'Usuario no encontrado' ? error : '')}
                </TooltipPortal>
              </div>
              <label htmlFor="login-password" className="login-modal-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  className={passwordError || error === 'Contraseña inválida' ? 'input-error input-error-has-icon' : ''}
                  ref={el => setPasswordRef(el)}
                  onBlur={() => { handlePasswordBlur(); setFocusedField(null); }}
                  onFocus={() => setFocusedField('password')}
                  style={passwordError || error === 'Contraseña inválida' ? { borderColor: '#d8000c', background: '#fff0f0' } : {}}
                  disabled={loading}
                />
                <span
                  onClick={loading ? undefined : toggleShowPassword}
                  className={`input-eye-icon${passwordError || error === 'Contraseña inválida' ? ' input-eye-icon-error' : ''}`}
                  title={showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  style={loading ? { pointerEvents: 'none', opacity: 0.5 } : {}}
                >
                  {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                {(passwordError || error === 'Contraseña inválida') && (
                  <span className="fb-error-icon">!</span>
                )}
                <TooltipPortal targetRef={{ current: passwordRef }} visible={((hasTriedLogin || focusedField === 'password') && (!!passwordError || error === 'Contraseña inválida'))}>
                  {passwordError || (error === 'Contraseña inválida' ? error : '')}
                </TooltipPortal>
              </div>
              <div className="login-modal-forgot">
                ¿Olvidaste tu contraseña?{' '}
                <a href="#" className="login-modal-link" onClick={handleOpenForgot}>Recuperar contraseña</a>
              </div>
              <button type="submit" className="login-modal-btn" disabled={loading}>Iniciar sesión</button>
            </form>
          </div>
        </div>
        {loading && <LoadingModalBackdrop text="Iniciando sesión..." />}
      </div>
    </>
  );
};

export default LoginModal;
