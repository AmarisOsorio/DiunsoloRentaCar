import React, { useState } from 'react';
import '../styles/modals/LoginModal.css';
import ejemploImg from '../../assets/imagenEjemplo.png';
import RegisterModal from './RegisterModal';

const LoginModal = ({ open, onClose, onOpenRegister, onOpenForgot }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);

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

  if (!open && !show) return null;

  return (
    <>
      <div className={`login-modal-backdrop${open ? ' modal-fade-in' : ' modal-fade-out'}`} onClick={onClose}>
        <div className={`login-modal-content${open ? ' modal-slide-in' : ' modal-slide-out'}`} onClick={e => e.stopPropagation()}>
          <div className="login-modal-left">
            <img src={ejemploImg} alt="Ejemplo" className="login-modal-img-bg" />
            <div className="login-modal-overlay" />
          </div>
          <div className="login-modal-right">
            <button className="login-modal-close" onClick={onClose}>&times;</button>
            <h2 className="login-modal-title">Iniciar sesión</h2>
            <div className="login-modal-register">
              ¿Aún no tienes cuenta?{' '}
              <a href="#" className="login-modal-link" onClick={handleOpenRegister}>Regístrate</a>.
            </div>
            <form className="login-modal-form">
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
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Contraseña"
                autoComplete="current-password"
              />
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
