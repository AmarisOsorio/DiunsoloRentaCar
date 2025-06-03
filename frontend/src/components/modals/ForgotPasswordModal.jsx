import React, { useState, useEffect } from 'react';
import '../styles/modals/ForgotPasswordModal.css';
import ejemploImg from '../../assets/imagenEjemplo.png';
import { useAuth } from '../../context/AuthContext.jsx';

const ForgotPasswordModal = ({ open, onClose }) => {
  const { requestPasswordRecovery, verifyRecoveryCode, setNewPassword: setNewPasswordAPI } = useAuth();
  const [step, setStep] = useState(1);
  const [correo, setCorreo] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (open) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  const handleCorreo = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const result = await requestPasswordRecovery(correo);
    setMessage(result.message);
    setLoading(false);
    if (result.message && result.message.includes('enviado')) setStep(2);
  };

  const handleCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const result = await verifyRecoveryCode(code);
    setMessage(result.message);
    setLoading(false);
    if (result.message && result.message.includes('verificado')) setStep(3);
  };

  const handleNewPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const result = await setNewPasswordAPI(newPassword);
    setMessage(result.message);
    setLoading(false);
    if (result.message && result.message.includes('actualizada')) setTimeout(onClose, 1500);
  };

  if (!open && !show) return null;

  return (
    <div className={`forgot-password-modal-backdrop${open ? ' modal-fade-in' : ' modal-fade-out'}`} onClick={onClose}>
      <div className={`forgot-password-modal-content forgot-password-modal-flex${open ? ' modal-slide-in' : ' modal-slide-out'}`} onClick={e => e.stopPropagation()}>
        {/* Imagen y overlay a la izquierda */}
        <div className="forgot-password-modal-left">
          <img src={ejemploImg} alt="Ejemplo" className="forgot-password-modal-img-bg" />
          <div className="forgot-password-modal-overlay" />
        </div>
        {/* Formulario a la derecha */}
        <div className="forgot-password-modal-right">
          <button className="forgot-password-modal-close" onClick={onClose}>&times;</button>
          <h2 className="forgot-password-modal-title">Recuperación contraseña</h2>
          {/* Pasos visuales */}
          <div className="forgot-password-modal-steps">
            <span className={`forgot-password-step${step === 1 ? ' active' : ''}`}>1</span>
            <span className={`forgot-password-step${step === 2 ? ' active' : ''}`}>2</span>
            <span className={`forgot-password-step${step === 3 ? ' active' : ''}`}>3</span>
          </div>
          <div className="forgot-password-modal-desc">Recupera tu cuenta en 3 pasos</div>
          {message && <div className="forgot-password-modal-success-message">{message}</div>}
          {step === 1 && (
            <form className="forgot-password-modal-form" onSubmit={handleCorreo}>
              <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="correo">Correo electrónico</label>
              <input className="forgot-password-modal-input" id="correo" name="correo" type="email" value={correo} onChange={e => setCorreo(e.target.value)} required />
              <button type="submit" className="forgot-password-modal-btn" disabled={loading}>{loading ? 'Enviando...' : 'Enviar código'}</button>
            </form>
          )}
          {step === 2 && (
            <form className="forgot-password-modal-form" onSubmit={handleCode}>
              <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="code">Código de verificación</label>
              <input className="forgot-password-modal-input" id="code" name="code" type="text" value={code} onChange={e => setCode(e.target.value)} required />
              <button type="submit" className="forgot-password-modal-btn" disabled={loading}>{loading ? 'Verificando...' : 'Verificar código'}</button>
            </form>
          )}
          {step === 3 && (
            <form className="forgot-password-modal-form" onSubmit={handleNewPassword}>
              <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="newPassword">Nueva contraseña</label>
              <input className="forgot-password-modal-input" id="newPassword" name="newPassword" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              <button type="submit" className="forgot-password-modal-btn" disabled={loading}>{loading ? 'Cambiando...' : 'Cambiar contraseña'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
