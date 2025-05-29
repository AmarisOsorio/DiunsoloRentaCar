import React, { useState, useEffect } from 'react';
import '../styles/modals/ForgotPasswordModal.css';
import ejemploImg from '../../assets/imagenEjemplo.png';

const ForgotPasswordModal = ({ open, onClose }) => {
  const [form, setForm] = useState({
    nombre_completo: '',
    correo: '',
    contrasena: '',
    telefono: '',
    nacimiento: '',
    pasaporte_dui: '',
    licencia: '',
  });
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
            <span className="forgot-password-step active">1</span>
            <span className="forgot-password-step">2</span>
            <span className="forgot-password-step">3</span>
          </div>
          <div className="forgot-password-modal-desc">Completa los datos para recuperar tu cuenta</div>
          {submitted ? (
            <div className="forgot-password-modal-success-message">
              Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.
            </div>
          ) : (
            <form className="forgot-password-modal-form" onSubmit={handleSubmit}>
              <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="nombre_completo">Nombre completo</label>
              <input className="forgot-password-modal-input" id="nombre_completo" name="nombre_completo" type="text" value={form.nombre_completo} onChange={handleChange} required />
              <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="correo">Correo electrónico</label>
              <input className="forgot-password-modal-input" id="correo" name="correo" type="email" value={form.correo} onChange={handleChange} required />
              <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="contrasena">Contraseña</label>
              <input className="forgot-password-modal-input" id="contrasena" name="contrasena" type="password" value={form.contrasena} onChange={handleChange} required />
              <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="telefono">Teléfono</label>
              <input className="forgot-password-modal-input" id="telefono" name="telefono" type="tel" value={form.telefono} onChange={handleChange} required />
              <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="nacimiento">Fecha de nacimiento</label>
              <input className="forgot-password-modal-input" id="nacimiento" name="nacimiento" type="date" value={form.nacimiento} onChange={handleChange} required />
              <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="pasaporte_dui">Pasaporte/DUI</label>
              <input className="forgot-password-modal-input" id="pasaporte_dui" name="pasaporte_dui" type="text" value={form.pasaporte_dui} onChange={handleChange} required />
              <label className="forgot-password-modal-label forgot-password-modal-label-bg" htmlFor="licencia">Licencia</label>
              <input className="forgot-password-modal-input" id="licencia" name="licencia" type="text" value={form.licencia} onChange={handleChange} required />
              <button type="submit" className="forgot-password-modal-btn">Enviar</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
