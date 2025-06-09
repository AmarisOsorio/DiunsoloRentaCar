import React from 'react';
import '../styles/modals/RegisterModal.css';
import VerifyAccountModal from './VerifyAccountModal';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import TooltipPortal from './TooltipPortal';
import useRegisterModal from '../../hooks/useRegisterModal.jsx';
import RegistrationSuccessAnimation from './RegistrationSuccessAnimation';
import { useAuth } from '../../context/AuthContext.jsx';

const RegisterModal = ({ open, onClose, onSwitchToLogin }) => {
  const {
    form,
    handleChange,
    handleSubmit,
    handlePhoneChange,
    handleInputChange,
    show,
    showVerify,
    setShowVerify,
    registerError,
    registerSuccess,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    focusedField,
    setFocusedField,
    nombreRef,
    passwordRef,
    confirmPasswordRef,
    telefonoRef,
    emailRef,
    handleVerify,
    handleOpenEffect,
    loading,
    registrationSuccessData,
    setRegistrationSuccessData
  } = useRegisterModal();
  const { resendVerificationCode, login } = useAuth();

  React.useEffect(() => {
    // Hacer disponible resendVerificationCode globalmente para el hook
    if (typeof window !== 'undefined') {
      window.resendVerificationCode = resendVerificationCode;
    }
    handleOpenEffect(open);
  }, [open, handleOpenEffect, resendVerificationCode]);

  // Si el modal no está abierto y no está en proceso de animación de cierre, devuelve null para no renderizar nada.
  if (!open && !show) return null;

  // Mostrar animación de carga
  if (loading) {
    return (
      <div className="register-modal-backdrop modal-fade-in">
        <div className="register-modal-content modal-slide-in" style={{ minHeight: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="register-modal-loading-spinner" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="spinner" style={{ width: 60, height: 60, border: '6px solid #e6f6fb', borderTop: '6px solid #009BDB', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <div style={{ marginTop: 18, color: '#1C318C', fontWeight: 500, fontSize: '1.1rem' }}>Creando tu cuenta...</div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar animación de éxito
  if (registrationSuccessData) {
    return (
      <div className="register-modal-backdrop modal-fade-in">
        <div className="register-modal-content modal-slide-in">
          <RegistrationSuccessAnimation userName={registrationSuccessData.nombre} onAnimationEnd={() => {
            setRegistrationSuccessData(null);
            setShowVerify(true);
          }} />
        </div>
      </div>
    );
  }

  // Si está mostrando el modal de verificación, solo renderiza ese modal
  if (showVerify) {
    // Si se cierra el modal de verificación, vuelve a mostrar el de registro (no redirige)
    const handleCloseVerify = () => setShowVerify(false);
    return (
      <div className={`register-modal-backdrop${open ? ' modal-fade-in' : ' modal-fade-out'}`}>
        <VerifyAccountModal
          open={showVerify}
          onClose={handleCloseVerify}
          onVerify={handleVerify}
          onResend={resendVerificationCode}
          email={form.email}
          password={form.password}
        />
      </div>
    );
  }

  return (
    <div className={`register-modal-backdrop${open ? ' modal-fade-in' : ' modal-fade-out'}`} onClick={onClose}>
      <div className={`register-modal-content${open ? ' modal-slide-in' : ' modal-slide-out'}`} onClick={e => e.stopPropagation()}>
        <button className="register-modal-close" onClick={onClose}>&times;</button>
        <h2 className="register-modal-title">Crear cuenta</h2>
        <div className="register-modal-login">
          ¿Ya tienes cuenta?{' '}
          <a href="#" className="register-modal-link" onClick={e => { e.preventDefault(); onSwitchToLogin && onSwitchToLogin(); }}>Iniciar sesión</a>
        </div>
        <form className="register-modal-form" onSubmit={handleSubmit}>
          <div className="form-group-full-width" style={{ position: 'relative' }}>
            <label htmlFor="nombre" className="register-modal-label">Nombre</label>
            <input ref={nombreRef} id="nombre" name="nombre" type="text" value={form.nombre} 
              onChange={e => {
                // Solo permite letras y espacios
                const value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
                handleInputChange({
                  target: {
                    name: 'nombre',
                    value
                  }
                });
              }}
              required
              className={registerError && registerError.toLowerCase().includes('nombre') ? 'input-error' : ''}
              onFocus={() => setFocusedField('nombre')}
              onBlur={() => setFocusedField(null)}
            />
            {registerError && registerError.toLowerCase().includes('nombre') && (
              <span className="fb-error-icon">!</span>
            )}
            <TooltipPortal targetRef={nombreRef} visible={registerError && registerError.toLowerCase().includes('nombre') && focusedField === 'nombre'}>
              {registerError}
            </TooltipPortal>
          </div>

          <div className="form-group-half-width" style={{ position: 'relative' }}>
            <label htmlFor="password" className="register-modal-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                ref={passwordRef}
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleInputChange}
                required
                className={registerError && registerError.toLowerCase().includes('contraseña') ? 'input-error' : ''}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
              />
              <span
                onClick={() => setShowPassword(v => !v)}
                className="input-eye-icon"
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {registerError && registerError.toLowerCase().includes('contraseña') && (
                <span className="fb-error-icon">!</span>
              )}
            </div>
            <TooltipPortal targetRef={passwordRef} visible={registerError && registerError.toLowerCase().includes('contraseña') && focusedField === 'password'}>
              {registerError}
            </TooltipPortal>
          </div>
          <div className="form-group-half-width" style={{ position: 'relative' }}>
            <label htmlFor="confirmPassword" className="register-modal-label">Confirmar contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                ref={confirmPasswordRef}
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleInputChange}
                required
                className={registerError === 'Las contraseñas no coinciden.' ? 'input-error' : ''}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
              />
              <span
                onClick={() => setShowConfirmPassword(v => !v)}
                className="input-eye-icon"
                title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {registerError === 'Las contraseñas no coinciden.' && (
                <span className="fb-error-icon">!</span>
              )}
            </div>
            <TooltipPortal targetRef={confirmPasswordRef} visible={registerError === 'Las contraseñas no coinciden.' && focusedField === 'confirmPassword'}>
              Las contraseñas no coinciden.
            </TooltipPortal>
          </div>

          <div className="form-group-half-width" style={{ position: 'relative' }}>
            <label htmlFor="telefono" className="register-modal-label">Teléfono</label>
            <div style={{ position: 'relative' }}>
              <input ref={telefonoRef} id="telefono" name="telefono" type="tel" value={form.telefono} onChange={e => { handlePhoneChange(e); if (focusedField === 'telefono') setFocusedField(null); }} required
                className={registerError && registerError.toLowerCase().includes('teléfono') ? 'input-error' : ''}
                onFocus={() => setFocusedField('telefono')}
                onBlur={() => setFocusedField(null)}
              />
              {registerError && registerError.toLowerCase().includes('teléfono') && (
                <span className="fb-error-icon">!</span>
              )}
            </div>
            <TooltipPortal targetRef={telefonoRef} visible={registerError && registerError.toLowerCase().includes('teléfono') && focusedField === 'telefono'}>
              {registerError}
            </TooltipPortal>
          </div>
          <div className="form-group-half-width" style={{ position: 'relative' }}>
            <label htmlFor="email" className="register-modal-label">Correo electrónico</label>
            <div style={{ position: 'relative' }}>
              <input ref={emailRef} id="email" name="email" type="email" value={form.email} onChange={handleInputChange} required
                className={registerError && registerError.toLowerCase().includes('correo') ? 'input-error' : ''}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
              {registerError && registerError.toLowerCase().includes('correo') && (
                <span className="fb-error-icon">!</span>
              )}
            </div>
            <TooltipPortal targetRef={emailRef} visible={registerError && registerError.toLowerCase().includes('correo') && focusedField === 'email'}>
              {registerError}
            </TooltipPortal>
          </div>

          <div className="form-group-half-width">
            <label htmlFor="licencia" className="register-modal-label">Licencia (foto)</label>
            <input id="licencia" name="licencia" type="file" accept="image/*" onChange={handleChange} />
            {form.licenciaPreview && (
              <img src={form.licenciaPreview} alt="Previsualización de Licencia" className="register-modal-image-preview" />
            )}
          </div>

          <div className="form-group-half-width">
            <label htmlFor="pasaporte" className="register-modal-label">Pasaporte/DUI (foto)</label>
            <input id="pasaporte" name="pasaporte" type="file" accept="image/*" onChange={handleChange} />
            {form.pasaportePreview && (
              <img src={form.pasaportePreview} alt="Previsualización de Pasaporte/DUI" className="register-modal-image-preview" />
            )}
          </div>

          <div className="form-group-full-width">
            <label htmlFor="nacimiento" className="register-modal-label">Fecha de nacimiento</label>
            <input
              id="nacimiento"
              name="nacimiento"
              type="date"
              value={form.nacimiento}
              onChange={handleChange}
              required
              className={registerError && registerError.toLowerCase().includes('mayor de edad') ? 'input-error' : ''}
              onFocus={() => setFocusedField('nacimiento')}
              onBlur={() => setFocusedField(null)}
            />
            <TooltipPortal
              targetRef={{ current: document.getElementById('nacimiento') }}
              visible={registerError && registerError.toLowerCase().includes('mayor de edad') && focusedField === 'nacimiento'}
            >
              {registerError}
            </TooltipPortal>
          </div>

          <button type="submit" className="register-modal-btn form-group-full-width">Crear cuenta</button>
        </form>
        {registerError && <div className="register-modal-error">{registerError}</div>}
        {registerSuccess && <div className="register-modal-success-message">{registerSuccess}</div>}
      </div>
    </div>
  );
};

export default RegisterModal;

