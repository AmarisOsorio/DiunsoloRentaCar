import React from 'react';
import '../styles/modals/LoginModal.css';
import LoginImg from '../../assets/imgLogin.jpg';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import useLogin from '../../hooks/useLogin.js';
import TooltipPortal from './TooltipPortal.jsx';
import { useForm } from 'react-hook-form';

const LoginModal = ({ open, onClose, onOpenRegister, onOpenForgot }) => {
  const {
    error,
    showLoginPassword,
    setShowLoginPassword,
    toggleShowPassword,
    handleSubmit: handleLoginSubmit,
    SuccessScreen,
    showSuccess
  } = useLogin(onClose);
  const [show, setShow] = React.useState(false);
  const [emailRef, setEmailRef] = React.useState(null);
  const [passwordRef, setPasswordRef] = React.useState(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    setError,
    clearErrors,
    watch
  } = useForm({
    mode: 'onBlur',
    defaultValues: { email: '', password: '' }
  });

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

  // Para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = React.useState(false);
  const togglePassword = () => setShowPassword(v => !v);

  // Submit usando react-hook-form
  const onSubmit = (data) => {
    // data: { email, password }
    handleLoginSubmit({
      preventDefault: () => {},
      target: { email: { value: data.email }, password: { value: data.password } }
    });
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
            <form className="login-modal-form" onSubmit={handleSubmit(onSubmit)} autoComplete="off">
              <label htmlFor="login-email" className="login-modal-label">Correo electrónico</label>
              <input
                id="login-email"
                type="email"
                placeholder="Correo Electrónico"
                autoComplete="email"
                ref={el => setEmailRef(el)}
                {...register('email', {
                  required: 'El correo es obligatorio',
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: 'Correo inválido'
                  }
                })}
                style={errors.email ? { borderColor: '#d8000c', background: '#fff0f0' } : {}}
              />
              <TooltipPortal targetRef={{ current: emailRef }} visible={!!errors.email || error === 'Usuario no encontrado'}>
                {errors.email?.message || (error === 'Usuario no encontrado' ? error : '')}
              </TooltipPortal>
              <label htmlFor="login-password" className="login-modal-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  className="login-modal-input"
                  ref={el => setPasswordRef(el)}
                  {...register('password', {
                    required: 'La contraseña es obligatoria',
                    minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                  })}
                  style={errors.password || error === 'Contraseña inválida' ? { borderColor: '#d8000c', background: '#fff0f0' } : {}}
                />
                <span
                  onClick={togglePassword}
                  className="input-eye-icon"
                  title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
                <TooltipPortal targetRef={{ current: passwordRef }} visible={!!errors.password || error === 'Contraseña inválida'}>
                  {errors.password?.message || (error === 'Contraseña inválida' ? error : '')}
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
