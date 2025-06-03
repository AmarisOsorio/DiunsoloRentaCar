import React, { useState } from 'react';
import '../styles/modals/LoginModal.css';
import LoginImg from '../../assets/imgLogin.jpg';
import RegisterModal from './RegisterModal';
import { useAuth } from '../../context/AuthContext.jsx';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const LoginModal = ({ open, onClose, onOpenRegister, onOpenForgot }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login({ correo: email, contraseña: password });
      if (result.message !== 'login exitoso') {
        setError(result.message || 'Error al iniciar sesión');
      } else {
        onClose();
        // Aquí puedes redirigir o actualizar el estado global de usuario
      }
    } catch (err) {
      setError('Error de red o servidor');
    }
  };

  if (!open && !show) return null;

  return (
    <>
      <div className={`login-modal-backdrop${open ? ' modal-fade-in' : ' modal-fade-out'}`} onClick={onClose}>
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
            <form className="login-modal-form" onSubmit={handleSubmit}>
              <label htmlFor="login-email" className="login-modal-label">Correo electrónico</label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Correo Electrónico"
                autoComplete="email"
              />
              <label htmlFor="login-password" className="login-modal-label">Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showLoginPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  className="login-modal-input"
                />
                <span
                  onClick={() => setShowLoginPassword(v => !v)}
                  className="input-eye-icon"
                  title={showLoginPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showLoginPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              <div className="login-modal-forgot">
                ¿Olvidaste tu contraseña?{' '}
                <a href="#" className="login-modal-link" onClick={handleOpenForgot}>Recuperar contraseña</a>
              </div>
              {error && <div className="login-modal-error">{error}</div>}
              <button type="submit" className="login-modal-btn">Iniciar sesión</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginModal;
