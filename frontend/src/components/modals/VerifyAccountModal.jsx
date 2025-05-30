import React, { useState } from 'react';
import '../styles/modals/RegisterModal.css';

const VerifyAccountModal = ({ open, onClose, onVerify }) => {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const result = await onVerify(code);
      setMessage(result.message);
    } catch (err) {
      setMessage('Error verificando el código');
    }
    setLoading(false);
  };

  return (
    <div className="register-modal-backdrop modal-fade-in" onClick={onClose}>
      <div className="register-modal-content modal-slide-in" onClick={e => e.stopPropagation()}>
        <button className="register-modal-close" onClick={onClose}>&times;</button>
        <h2 className="register-modal-title">Verifica tu cuenta</h2>
        <form onSubmit={handleSubmit} className="register-modal-form">
          <label className="register-modal-label">Código de verificación</label>
          <input
            className="register-modal-input"
            type="text"
            value={code}
            onChange={e => setCode(e.target.value)}
            required
          />
          <button className="register-modal-btn" type="submit" disabled={loading}>
            {loading ? 'Verificando...' : 'Verificar'}
          </button>
        </form>
        {message && <div className="register-modal-success-message">{message}</div>}
      </div>
    </div>
  );
};

export default VerifyAccountModal;
