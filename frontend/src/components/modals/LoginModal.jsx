import React from 'react';
import '../styles/modals/LoginModal.css';
import LoginImg from '../../assets/imgLogin.jpg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useLogin from '../../hooks/useLogin.js';
import TooltipPortal from './TooltipPortal.jsx';

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
    showSuccess
  } = useLogin(onClose);
  const [show, setShow] = React.useState(false);
  const [emailRef, setEmailRef] = React.useState(null);
  const [passwordRef, setPasswordRef] = React.useState(null);
  const [emailError, setEmailError] = React.useState('');
  const [passwordError, setPasswordError] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setShow(true);
    } else {
      // Espera la animación antes de desmontar
      const timeout = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

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

  const handleEmailBlur = () => setEmailError(validateEmail(email));
  const handlePasswordBlur = () => setPasswordError(validatePassword(password));

  const handleSubmitWithValidation = (e) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setEmailError(emailErr);
    setPasswordError(passErr);
    if (emailErr || passErr) return;
    handleSubmit(e);
  };

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
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="Correo Electrónico"
                autoComplete="email"
                ref={el => setEmailRef(el)}
                onBlur={handleEmailBlur}
                style={emailError ? { borderColor: '#d8000c', background: '#fff0f0' } : {}}
              />
              <TooltipPortal targetRef={{ current: emailRef }} visible={!!emailError || error === 'Usuario no encontrado'}>
                {emailError || (error === 'Usuario no encontrado' ? error : '')}
              </TooltipPortal>
              <label htmlFor="login-password" className="login-modal-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  className="login-modal-input"
                  ref={el => setPasswordRef(el)}
                  onBlur={handlePasswordBlur}
                  style={passwordError || error === 'Contraseña inválida' ? { borderColor: '#d8000c', background: '#fff0f0' } : {}}
                />
                <span
                  onClick={toggleShowPassword}
                  className="input-eye-icon"
                  title={showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                <TooltipPortal targetRef={{ current: passwordRef }} visible={!!passwordError || error === 'Contraseña inválida'}>
                  {passwordError || (error === 'Contraseña inválida' ? error : '')}
                </TooltipPortal>
              </div>
              <div className="login-modal-forgot">
                ¿Olvidaste tu contraseña?{' '}
                <a href="#" className="login-modal-link" onClick={handleOpenForgot}>Recuperar contraseña</a>
              </div>
              <button type="submit" className="login-modal-btn">Iniciar sesión</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
