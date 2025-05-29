import React, { useState, useEffect } from 'react';
import '../styles/modals/RegisterModal.css';
import useRegisterModal from '../../hooks/useRegisterModal.jsx'; 

const RegisterModal = ({ open, onClose, onSwitchToLogin }) => {
  // Usa el hook personalizado para gestionar el estado del formulario y la lógica de handleChange
  const { form, handleChange } = useRegisterModal();

  const [show, setShow] = useState(false); // Estado para controlar la visibilidad de las animaciones

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
  const handleSubmit = e => {
    e.preventDefault();
    // TODO: Implementar la lógica de registro real aquí.
    // Por ejemplo, enviar datos del formulario a una API.
    console.log('Formulario enviado:', form);
    // Es posible que desees cerrar el modal o mostrar un mensaje de éxito después del envío.
    // onClose();
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
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <div className="form-group-half-width">
            <label htmlFor="confirmPassword" className="register-modal-label">Confirmar contraseña</label>
            <input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required />
          </div>

          {/* Teléfono y Correo electrónico en la misma fila */}
          <div className="form-group-half-width">
            <label htmlFor="telefono" className="register-modal-label">Teléfono</label>
            <input id="telefono" name="telefono" type="tel" value={form.telefono} onChange={handleChange} required />
          </div>
          <div className="form-group-half-width">
            <label htmlFor="email" className="register-modal-label">Correo electrónico</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>

          {/* Campo de entrada para Licencia (foto) y previsualización */}
          <div className="form-group-half-width">
            <label htmlFor="licencia" className="register-modal-label">Licencia (foto)</label>
            <input id="licencia" name="licencia" type="file" accept="image/*" onChange={handleChange} required />
            {form.licenciaPreview && (
              <img src={form.licenciaPreview} alt="Previsualización de Licencia" className="register-modal-image-preview" />
            )}
          </div>

          {/* Campo de entrada para Pasaporte/DUI (foto) y previsualización */}
          <div className="form-group-half-width">
            <label htmlFor="pasaporte" className="register-modal-label">Pasaporte/DUI (foto)</label>
            <input id="pasaporte" name="pasaporte" type="file" accept="image/*" onChange={handleChange} required />
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
      </div>
    </div>
  );
};

export default RegisterModal;

