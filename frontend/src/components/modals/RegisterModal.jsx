import React, { useState, useEffect } from 'react';
import '../styles/modals/RegisterModal.css';
import useRegisterModal from '../../hooks/useRegisterModal.jsx'; 
import { useAuth } from '../../context/AuthContext.jsx';
import VerifyAccountModal from './VerifyAccountModal';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const RegisterModal = ({ open, onClose, onSwitchToLogin }) => {
  // Usa el hook personalizado para gestionar el estado del formulario y la lógica de handleChange
  const { form, handleChange } = useRegisterModal();
  const { register, verifyAccount } = useAuth();

  const [show, setShow] = useState(false); // Estado para controlar la visibilidad de las animaciones
  const [showVerify, setShowVerify] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Efecto para gestionar el estado de mostrar/ocultar del modal para las animaciones
  useEffect(() => {
    if (open) {
      setShow(true); // Cuando 'open' es true, muestra el modal inmediatamente
    } else {
      // Cuando 'open' es false, espera a que la animación se complete antes de desmontar
      const timeout = setTimeout(() => setShow(false), 300); // 300ms coincide con la duración de la animación CSS
      return () => clearTimeout(timeout); // Limpia el timeout si el componente se desmonta o 'open' cambia
    }
  }, [open]); // Vuelve a ejecutar el efecto cuando la prop 'open' cambia

  // Si el modal no está abierto y no está en proceso de animación de cierre, devuelve null para no renderizar nada.
  if (!open && !show) return null;

  // Maneja el envío del formulario. Marcador de posición para la lógica de registro.
  const handleSubmit = async e => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    // Validación de confirmación de contraseña
    if (form.password !== form.confirmPassword) {
      setRegisterError('Las contraseñas no coinciden.');
      return;
    }
    // Validación de teléfono: exactamente 9 caracteres y formato 1234-5678
    if (!/^\d{4}-\d{4}$/.test(form.telefono)) {
      setRegisterError('El teléfono debe estar completo y tener el formato 1234-5678.');
      return false;
    }
    try {
      const data = {
        nombre_completo: form.nombre,
        correo: form.email,
        contraseña: form.password,
        telefono: form.telefono,
        fecha_de_nacimiento: form.nacimiento,
        pasaporte_dui: form.pasaporte || undefined,
        licencia: form.licencia || undefined
      };
      const result = await register(data);
      if (result.message && result.message.includes('verifica tu correo')) {
        setShowVerify(true);
        setRegisterSuccess(result.message);
      } else {
        setRegisterError(result.message || 'Error al registrar');
      }
    } catch (err) {
      setRegisterError('Error de red o servidor');
    }
  };

  const handleVerify = async (code) => {
    const result = await verifyAccount(code);
    if (result.message && result.message.includes('exitosamente')) {
      setShowVerify(false);
      setRegisterSuccess('¡Cuenta verificada! Ya puedes iniciar sesión.');
      onClose && onClose();
    }
    return result;
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    // Si hay más de 4 dígitos, inserta el guion después del cuarto
    if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4, 8);
    }
    // Limita a 9 caracteres (ej: 1234-5678)
    if (value.length > 9) value = value.slice(0, 9);
    handleChange({
      target: {
        name: 'telefono',
        value
      }
    });
  };

  return (
    // Fondo del modal, cubre toda la pantalla. Cierra el modal al hacer clic fuera.
    // Aplica la animación de aparición/desaparición (fade-in/fade-out) según la prop 'open'
    <div className={`register-modal-backdrop${open ? ' modal-fade-in' : ' modal-fade-out'}`} onClick={onClose}>
      {/* Área de contenido del modal. Evita que se cierre al hacer clic dentro. */}
      {/* Aplica la animación de deslizamiento (slide-in/slide-out) según la prop 'open' */}
      <div className={`register-modal-content${open ? ' modal-slide-in' : ' modal-slide-out'}`} onClick={e => e.stopPropagation()}>
        {/* Botón para cerrar el modal */}
        <button className="register-modal-close" onClick={onClose}>&times;</button>
        {/* Título del modal */}
        <h2 className="register-modal-title">Crear cuenta</h2>
        {/* Enlace para cambiar al formulario de inicio de sesión */}
        <div className="register-modal-login">
          ¿Ya tienes cuenta?{' '}
          <a href="#" className="register-modal-link" onClick={e => { e.preventDefault(); onSwitchToLogin && onSwitchToLogin(); }}>Iniciar sesión</a>
        </div>
        {/* Formulario de registro */}
        <form className="register-modal-form" onSubmit={handleSubmit}>
          {/* Campo de entrada para el Nombre - abarca dos columnas */}
          <div className="form-group-full-width">
            <label htmlFor="nombre" className="register-modal-label">Nombre</label>
            <input id="nombre" name="nombre" type="text" value={form.nombre} onChange={handleChange} required />
          </div>

          {/* Contraseña y Confirmar Contraseña en la misma fila */}
          <div className="form-group-half-width">
            <label htmlFor="password" className="register-modal-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                required
              />
              <span
                onClick={() => setShowPassword(v => !v)}
                className="input-eye-icon"
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>
          <div className="form-group-half-width">
            <label htmlFor="confirmPassword" className="register-modal-label">Confirmar contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                required
                style={registerError === 'Las contraseñas no coinciden.' ? { borderColor: 'red' } : {}}
              />
              <span
                onClick={() => setShowConfirmPassword(v => !v)}
                className="input-eye-icon"
                title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)' }}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {registerError === 'Las contraseñas no coinciden.' && (
                <div style={{ color: 'red', fontSize: '0.9em', marginTop: 2, position: 'absolute', left: 0, top: '100%' }}>
                  Las contraseñas no coinciden.
                </div>
              )}
            </div>
          </div>

          {/* Teléfono y Correo electrónico en la misma fila */}
          <div className="form-group-half-width">
            <label htmlFor="telefono" className="register-modal-label">Teléfono</label>
            <input id="telefono" name="telefono" type="tel" value={form.telefono} onChange={handlePhoneChange} required 
              style={registerError && registerError.includes('teléfono') ? { borderColor: 'red' } : {}} />
            {registerError && registerError.includes('teléfono') && (
              <div style={{ color: 'red', fontSize: '0.9em', marginTop: 2 }}>
                {registerError}
              </div>
            )}
          </div>
          <div className="form-group-half-width">
            <label htmlFor="email" className="register-modal-label">Correo electrónico</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          {/* Campo de entrada para Licencia (foto) y previsualización */}
          <div className="form-group-half-width">
            <label htmlFor="licencia" className="register-modal-label">Licencia (foto)</label>
            <input id="licencia" name="licencia" type="file" accept="image/*" onChange={handleChange} />
            {form.licenciaPreview && (
              <img src={form.licenciaPreview} alt="Previsualización de Licencia" className="register-modal-image-preview" />
            )}
          </div>

          {/* Campo de entrada para Pasaporte/DUI (foto) y previsualización */}
          <div className="form-group-half-width">
            <label htmlFor="pasaporte" className="register-modal-label">Pasaporte/DUI (foto)</label>
            <input id="pasaporte" name="pasaporte" type="file" accept="image/*" onChange={handleChange} />
            {form.pasaportePreview && (
              <img src={form.pasaportePreview} alt="Previsualización de Pasaporte/DUI" className="register-modal-image-preview" />
            )}
          </div>

          {/* Campo de entrada para Fecha de nacimiento - abarca dos columnas */}
          <div className="form-group-full-width">
            <label htmlFor="nacimiento" className="register-modal-label">Fecha de nacimiento</label>
            <input id="nacimiento" name="nacimiento" type="date" value={form.nacimiento} onChange={handleChange} required />
          </div>

          {/* Botón de envío - abarca dos columnas */}
          <button type="submit" className="register-modal-btn form-group-full-width">Crear cuenta</button>
        </form>
        {registerError && <div className="register-modal-error">{registerError}</div>}
        {registerSuccess && <div className="register-modal-success-message">{registerSuccess}</div>}
        <VerifyAccountModal open={showVerify} onClose={() => setShowVerify(false)} onVerify={handleVerify} />
      </div>
    </div>
  );
};

export default RegisterModal;

