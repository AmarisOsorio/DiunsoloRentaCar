import React, { useRef } from 'react';
import '../styles/modals/RegisterModal.css';
import VerifyAccountModal from './VerifyAccountModal';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import TooltipPortal from './TooltipPortal';
import useRegisterModal from '../../hooks/useRegisterModal.jsx';
import RegistrationSuccessAnimation from './RegistrationSuccessAnimation';
import { useAuth } from '../../context/AuthContext.jsx';
import LoadingModalBackdrop from './LoadingModalBackdrop.jsx';

const RegisterModal = ({ open, onClose, onSwitchToLogin }) => {
  const {
    register,
    handleSubmit,
    onSubmit,
    handleChange,
    handlePhoneChange,
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
    handleVerify,
    handleOpenEffect,
    loading,
    registrationSuccessData,
    setRegistrationSuccessData,
    getValues,
    licenciaPreview,
    pasaportePreview,
    validateEdad,
    validateConfirmPassword,
    errors,
    watch
  } = useRegisterModal();
  const { resendVerificationCode } = useAuth();

  // Refs solo para tooltips (no para RHF)
  const nombreInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);
  const telefonoInputRef = useRef(null);
  const emailInputRef = useRef(null);

  // Callback ref para no romper RHF
  const setInputRef = (rhfRef, tooltipRef) => (el) => {
    rhfRef(el);
    tooltipRef.current = el;
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.resendVerificationCode = resendVerificationCode;
    }
    handleOpenEffect(open);
  }, [open, handleOpenEffect, resendVerificationCode]);

  // useEffect para redirección tras éxito de registro
  React.useEffect(() => {
    if (registrationSuccessData) {
      const timeout = setTimeout(() => {
        onClose && onClose();
        window.location.href = '/';
      }, 2200); // 3 segundos
      return () => clearTimeout(timeout);
    }
  }, [registrationSuccessData, onClose]);

  // Si hay éxito, mostrar solo el success check (el modal se cerrará tras 1.5s)
  if (registrationSuccessData) {
    return (
      <div className="register-modal-backdrop modal-fade-in">
        <div className="register-modal-content modal-slide-in">
          <RegistrationSuccessAnimation userName={registrationSuccessData.nombre} onAnimationEnd={() => {}} />
        </div>
      </div>
    );
  }

  // Si el modal no está abierto y no está en proceso de animación de cierre, devuelve null para no renderizar nada.
  if (!open && !show) return null;

  // Mostrar animación de carga
  if (loading) {
    return <LoadingModalBackdrop text="Creando tu cuenta..." />;
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
          email={getValues('email')}
          password={getValues('contraseña')}
        />
      </div>
    );
  }

  const passwordValue = watch('contraseña');

  return (
    <div className={`register-modal-backdrop${open ? ' modal-fade-in' : ' modal-fade-out'}`} onClick={onClose}>
      <div className={`register-modal-content${open ? ' modal-slide-in' : ' modal-slide-out'}`} onClick={e => e.stopPropagation()}>
        <button className="register-modal-close" onClick={onClose}>&times;</button>
        <h2 className="register-modal-title">Crear cuenta</h2>
        <div className="register-modal-login">
          ¿Ya tienes cuenta?{' '}
          <a href="#" className="register-modal-link" onClick={e => { e.preventDefault(); onSwitchToLogin && onSwitchToLogin(); }}>Iniciar sesión</a>
        </div>
        <form className="register-modal-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group-full-width" style={{ position: 'relative' }}>
            <label htmlFor="nombre" className="register-modal-label">Nombre</label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('nombre', {
                  required: 'El nombre es obligatorio',
                  pattern: {
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/,
                    message: 'Solo letras y espacios'
                  }
                })}
                id="nombre"
                name="nombre"
                type="text"
                className={(errors.nombre || (registerError && registerError.toLowerCase().includes('nombre'))) ? 'input-error' : ''}
                onFocus={() => setFocusedField('nombre')}
                onBlur={() => setFocusedField(null)}
                ref={setInputRef(register('nombre').ref, nombreInputRef)}
                onInput={e => {
                  e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
                }}
              />
              {(errors.nombre || (registerError && registerError.toLowerCase().includes('nombre'))) && (
                <span className="fb-error-icon">!</span>
              )}
            </div>
            <TooltipPortal targetRef={nombreInputRef} visible={(errors.nombre || (registerError && registerError.toLowerCase().includes('nombre'))) && focusedField === 'nombre'}>
              {errors.nombre?.message || registerError}
            </TooltipPortal>
          </div>

          <div className="form-group-half-width" style={{ position: 'relative' }}>
            <label htmlFor="contraseña" className="register-modal-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('contraseña', {
                  required: 'La contraseña es obligatoria',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' },
                  pattern: {
                    value: /^[^\s]{6,}$/,
                    message: 'No puede contener espacios'
                  }
                })}
                id="contraseña"
                name="contraseña"
                type={showPassword ? 'text' : 'password'}
                className={
                  (errors.contraseña || (registerError && registerError.toLowerCase().includes('contraseña')))
                    ? 'input-error input-error-has-icon'
                    : ''
                }
                onFocus={() => setFocusedField('contraseña')}
                onBlur={() => setFocusedField(null)}
                ref={setInputRef(register('contraseña').ref, passwordInputRef)}
              />
              <span
                onClick={() => setShowPassword(v => !v)}
                className={`input-eye-icon${(errors.contraseña || (registerError && registerError.toLowerCase().includes('contraseña'))) ? ' input-eye-icon-error' : ''}`}
                title={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {(errors.contraseña || (registerError && registerError.toLowerCase().includes('contraseña'))) && (
                <span className="fb-error-icon">!</span>
              )}
            </div>
            <TooltipPortal targetRef={passwordInputRef} visible={(errors.contraseña || (registerError && registerError.toLowerCase().includes('contraseña'))) && focusedField === 'contraseña'}>
              {errors.contraseña?.message || registerError}
            </TooltipPortal>
          </div>
          <div className="form-group-half-width" style={{ position: 'relative' }}>
            <label htmlFor="confirmarContraseña" className="register-modal-label">Confirmar contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('confirmarContraseña', {
                  required: 'Confirma tu contraseña',
                  validate: value => value === passwordValue || 'Las contraseñas no coinciden.'
                })}
                id="confirmarContraseña"
                name="confirmarContraseña"
                type={showConfirmPassword ? 'text' : 'password'}
                className={
                  (errors.confirmarContraseña || registerError === 'Las contraseñas no coinciden.')
                    ? 'input-error input-error-has-icon'
                    : ''
                }
                onFocus={() => setFocusedField('confirmarContraseña')}
                onBlur={() => setFocusedField(null)}
                ref={el => {
                  setInputRef(register('confirmarContraseña').ref, confirmPasswordInputRef)(el);
                }}
              />
              <span
                onClick={() => setShowConfirmPassword(v => !v)}
                className={`input-eye-icon${(errors.confirmarContraseña || registerError === 'Las contraseñas no coinciden.') ? ' input-eye-icon-error' : ''}`}
                title={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
              {(errors.confirmarContraseña || registerError === 'Las contraseñas no coinciden.') && (
                <span className="fb-error-icon">!</span>
              )}
            </div>
            <TooltipPortal targetRef={confirmPasswordInputRef} visible={(errors.confirmarContraseña || registerError === 'Las contraseñas no coinciden.') && focusedField === 'confirmarContraseña'}>
              {errors.confirmarContraseña?.message || 'Las contraseñas no coinciden.'}
            </TooltipPortal>
          </div>

          <div className="form-group-half-width" style={{ position: 'relative' }}>
            <label htmlFor="telefono" className="register-modal-label">Teléfono</label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('telefono', {
                  required: 'El teléfono es obligatorio',
                  pattern: {
                    value: /^[267][0-9]{3}-[0-9]{4}$/,
                    message: 'Formato: 0000-0000 y debe iniciar con 2, 6 o 7'
                  }
                })}
                id="telefono"
                name="telefono"
                type="tel"
                className={(errors.telefono || (registerError && registerError.toLowerCase().includes('teléfono'))) ? 'input-error' : ''}
                onFocus={() => setFocusedField('telefono')}
                onBlur={() => setFocusedField(null)}
                ref={setInputRef(register('telefono').ref, telefonoInputRef)}
                onInput={e => {
                  // Opcional: autoformato, pero NO llames setValue aquí
                  let v = e.target.value.replace(/[^0-9-]/g, '');
                  if (v.length === 4 && !v.includes('-')) v = v + '-';
                  e.target.value = v.slice(0, 9);
                }}
              />
              {(errors.telefono || (registerError && registerError.toLowerCase().includes('teléfono'))) && (
                <span className="fb-error-icon">!</span>
              )}
            </div>
            <TooltipPortal targetRef={telefonoInputRef} visible={(errors.telefono || (registerError && registerError.toLowerCase().includes('teléfono'))) && focusedField === 'telefono'}>
              {errors.telefono?.message || registerError}
            </TooltipPortal>
          </div>
          <div className="form-group-half-width" style={{ position: 'relative' }}>
            <label htmlFor="email" className="register-modal-label">Correo electrónico</label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('email', {
                  required: 'El correo es obligatorio',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Correo inválido'
                  }
                })}
                id="email"
                name="email"
                type="email"
                className={(errors.email || (registerError && registerError.toLowerCase().includes('correo'))) ? 'input-error' : ''}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                ref={setInputRef(register('email').ref, emailInputRef)}
              />
              {(errors.email || (registerError && registerError.toLowerCase().includes('correo'))) && (
                <span className="fb-error-icon">!</span>
              )}
            </div>
            <TooltipPortal targetRef={emailInputRef} visible={(errors.email || (registerError && registerError.toLowerCase().includes('correo'))) && focusedField === 'email'}>
              {errors.email?.message || registerError}
            </TooltipPortal>
          </div>

          <div className="form-group-half-width">
            <label htmlFor="licencia" className="register-modal-label">Licencia (Opcional)</label>
            <input id="licencia" name="licencia" type="file" accept="image/*" onChange={handleChange} />
            {licenciaPreview && (
              <img src={licenciaPreview} alt="Previsualización de Licencia" className="register-modal-image-preview" />
            )}
          </div>

          <div className="form-group-half-width">
            <label htmlFor="pasaporte" className="register-modal-label">Pasaporte/DUI (Opcional)</label>
            <input id="pasaporte" name="pasaporte" type="file" accept="image/*" onChange={handleChange} />
            {pasaportePreview && (
              <img src={pasaportePreview} alt="Previsualización de Pasaporte/DUI" className="register-modal-image-preview" />
            )}
          </div>

          <div className="form-group-full-width" style={{ position: 'relative' }}>
            <label htmlFor="nacimiento" className="register-modal-label">Fecha de nacimiento</label>
            <input
              {...register('nacimiento', {
                required: 'La fecha de nacimiento es obligatoria',
                validate: validateEdad
              })}
              id="nacimiento"
              name="nacimiento"
              type="date"
              className={(errors.nacimiento || (registerError && registerError.toLowerCase().includes('mayor de edad'))) ? 'input-error' : ''}
              onFocus={() => setFocusedField('nacimiento')}
              onBlur={() => setFocusedField(null)}
            />
            <TooltipPortal
              targetRef={{ current: document.getElementById('nacimiento') }}
              visible={(errors.nacimiento || (registerError && registerError.toLowerCase().includes('mayor de edad'))) && focusedField === 'nacimiento'}
            >
              {errors.nacimiento?.message || registerError}
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

