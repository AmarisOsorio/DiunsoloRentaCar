import React, { useRef, useEffect, useState } from 'react';
import './RegisterModal.css';
import VerifyAccountModal from '../../../profile/accountInformation/modals/verifyAccount/VerifyAccountModal.jsx';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import TooltipPortal from '../../../interactions/tooltipPortal/TooltipPortal.jsx';
import useRegisterModal from './hooks/useRegisterModal.jsx';
import RegistrationSuccessAnimation from './RegistrationSuccessAnimation.jsx';
import { useAuth } from '../../../../context/AuthContext.jsx';
import LoadingModalBackdrop from '../login/LoadingModalBackdrop.jsx';
import ImageViewSelector from '../../../profile/accountInformation/modals/imageViewSelector/ImageViewSelector.jsx';

const RegisterModal = ({ open, onClose, onSwitchToLogin }) => {
  const {
    register,
    handleSubmit,
    onSubmit,
    handleChange,
    handlePhoneChange, // This is not used in the provided JSX, consider removing if truly unused.
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
    licenciaFrentePreview,
    licenciaReversoPreview,
    pasaporteFrentePreview,
    pasaporteReversoPreview,
    setLicenciaFrentePreview,
    setLicenciaReversoPreview,
    setPasaporteFrentePreview,
    setPasaporteReversoPreview,
    validateEdad,
    validateConfirmPassword, // This is not used in the provided JSX, consider removing if truly unused.
    errors,
    watch,
    setValue
  } = useRegisterModal();
  const { resendVerificationCode } = useAuth();
  // Refs solo para tooltips (no para RHF)
  const nombresInputRef = useRef(null);
  const apellidosInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const confirmPasswordInputRef = useRef(null);
  const telefonoInputRef = useRef(null);
  const emailInputRef = useRef(null);

  // Refs para los inputs de archivos
  const licenciaFrenteInputRef = useRef(null);
  const licenciaReversoInputRef = useRef(null);
  const pasaporteFrenteInputRef = useRef(null);
  const pasaporteReversoInputRef = useRef(null);

  // Callback ref para no romper RHF
  const setInputRef = (rhfRef, tooltipRef) => (el) => {
    rhfRef(el);
    tooltipRef.current = el;
  };

  // Effect to manage body scroll and scrollbar width compensation
  useEffect(() => {
    if (open) {
      // Calculate scrollbar width to prevent content reflow
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('--scrollbar-width');
    }
    // Clean up on component unmount
    return () => {
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('--scrollbar-width');
    };
  }, [open]);


  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.resendVerificationCode = resendVerificationCode;
    }
    handleOpenEffect(open);
  }, [open, handleOpenEffect, resendVerificationCode]);
  // useEffect para mostrar modal de verificación tras éxito de registro
  React.useEffect(() => {
    // No necesitamos hacer nada aquí ahora, la transición se maneja en onAnimationEnd
  }, [registrationSuccessData, onClose]);
  
  // Hooks para verificar y reenviar, movidos al nivel superior
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  // Si hay éxito, mostrar solo el success check y luego el modal de verificación
  if (registrationSuccessData) {
    return (
      <div className="register-modal-backdrop modal-fade-in">
        <div className="register-modal-content modal-slide-in">
          <RegistrationSuccessAnimation
            userName={registrationSuccessData.nombre}
            onAnimationEnd={() => {
              // Después de la animación, mostrar el modal de verificación
              setRegistrationSuccessData(null);
              setShowVerify(true);
            }}
          />
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

    const handleVerifyWithSpinner = async (code) => {
      setVerifying(true);
      try {
        const result = await handleVerify(code);
        setVerifying(false);
        return result;
      } catch (err) {
        setVerifying(false);
        throw err;
      }
    };

    const handleResendWithSpinner = async () => {
      setResending(true);
      try {
        const result = await resendVerificationCode();
        setResending(false);
        return result;
      } catch (err) {
        setResending(false);
        throw err;
      }
    };

    return (
      <div className={`register-modal-backdrop${open ? ' modal-fade-in' : ' modal-fade-out'}`}>
        <VerifyAccountModal
          open={showVerify}
          onClose={handleCloseVerify}
          onVerify={handleVerifyWithSpinner}
          onResend={handleResendWithSpinner}
          email={getValues('email')}
          password={getValues('contraseña')}
          verifying={verifying}
          resending={resending}
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
        {/* Cambia el onSubmit aquí */}
        <form className="register-modal-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group-half-width" style={{ position: 'relative' }}>
            <label htmlFor="nombres" className="register-modal-label">Nombre/s</label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('nombres', {
                  required: 'El nombre es obligatorio',
                  pattern: {
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/,
                    message: 'Solo letras y espacios'
                  }
                })}
                id="nombres"
                name="nombres"
                type="text"
                autoComplete="given-name"
                className={(errors.nombres || (registerError && registerError.toLowerCase().includes('nombres'))) ? 'input-error' : ''}
                onFocus={() => setFocusedField('nombres')}
                onBlur={() => setFocusedField(null)}
                ref={setInputRef(register('nombres').ref, nombresInputRef)}
                onInput={e => {
                  e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
                }}
              />
      {(errors.nombres || (registerError && registerError.toLowerCase().includes('nombres'))) && (
        <span className="fb-error-icon">!</span>
      )}
            </div>
      <TooltipPortal targetRef={nombresInputRef} visible={(errors.nombres || (registerError && registerError.toLowerCase().includes('nombres'))) && focusedField === 'nombres'}>
        {errors.nombres?.message || registerError}
      </TooltipPortal>
          </div>

          <div className="form-group-half-width" style={{ position: 'relative' }}>
            <label htmlFor="apellidos" className="register-modal-label">Apellido/s</label>
            <div style={{ position: 'relative' }}>
              <input
                {...register('apellidos', {
                  required: 'El apellido es obligatorio',
                  pattern: {
                    value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/,
                    message: 'Solo letras y espacios'
                  }
                })}
                id="apellidos"
                name="apellidos"
                type="text"
                autoComplete="family-name"
                className={(errors.apellidos || (registerError && registerError.toLowerCase().includes('apellidos'))) ? 'input-error' : ''}
                onFocus={() => setFocusedField('apellidos')}
                onBlur={() => setFocusedField(null)}
                ref={setInputRef(register('apellidos').ref, apellidosInputRef)}
                onInput={e => {
                  e.target.value = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]/g, '');
                }}
              />
      {(errors.apellidos || (registerError && registerError.toLowerCase().includes('apellidos'))) && (
        <span className="fb-error-icon">!</span>
      )}
            </div>
      <TooltipPortal targetRef={apellidosInputRef} visible={(errors.apellidos || (registerError && registerError.toLowerCase().includes('apellidos'))) && focusedField === 'apellidos'}>
        {errors.apellidos?.message || registerError}
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
                autoComplete="new-password"
                className={
                  (errors.contraseña || (registerError && registerError.toLowerCase().includes('contraseña')))
                    ? 'input-error input-error-has-icon'
                    : 'input-has-icon'
                }
                style={{
                  paddingRight: (errors.contraseña || (registerError && registerError.toLowerCase().includes('contraseña')))
                    ? '4.5em' // espacio para ojo + error
                    : '2.5em' // solo ojo
                }}
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
                autoComplete="new-password"
                className={
                  (errors.confirmarContraseña || registerError === 'Las contraseñas no coinciden.')
                    ? 'input-error input-error-has-icon'
                    : 'input-has-icon'
                }
                style={{
                  paddingRight: (errors.confirmarContraseña || registerError === 'Las contraseñas no coinciden.')
                    ? '4.5em'
                    : '2.5em'
                }}
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
                    message: 'Formato: 0000-0000, inicia con 2, 6 o 7'
                  }
                })}
                id="telefono"
                name="telefono"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                maxLength={9}
                className={
                  (errors.telefono || (registerError && registerError.toLowerCase().includes('teléfono')))
                    ? 'input-error'
                    : ''
                }
                onFocus={() => setFocusedField('telefono')}
                onBlur={() => setFocusedField(null)}
                ref={setInputRef(register('telefono').ref, telefonoInputRef)}
                onInput={e => {
                  let v = e.target.value.replace(/[^0-9]/g, '');
                  if (v.length > 4) v = v.slice(0, 4) + '-' + v.slice(4, 8);
                  else v = v;
                  v = v.slice(0, 9);
                  e.target.value = v;
                  setValue('telefono', v, { shouldValidate: true });
                }}
                value={typeof watch('telefono') === 'string' ? watch('telefono') : ''}
              />
              {(errors.telefono || (registerError && registerError.toLowerCase().includes('teléfono'))) && (
                <span className="fb-error-icon">!</span>
              )}
            </div>
            <TooltipPortal
              targetRef={telefonoInputRef}
              visible={(errors.telefono || (registerError && registerError.toLowerCase().includes('teléfono'))) && focusedField === 'telefono'}
            >
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
        <div className="form-group-full-width">
          <ImageViewSelector
            title="Licencia (opcional)"
            frontImage={licenciaFrentePreview}
            backImage={licenciaReversoPreview}
            onFrontChange={(e) => {
              e.target.name = 'licenciaFrente';
              handleChange(e);
            }}
            onBackChange={(e) => {
              e.target.name = 'licenciaReverso';
              handleChange(e);
            }}
            onFrontRemove={() => {
              setValue('licenciaFrente', null);
              setLicenciaFrentePreview && setLicenciaFrentePreview(null);
            }}
            onBackRemove={() => {
              setValue('licenciaReverso', null);
              setLicenciaReversoPreview && setLicenciaReversoPreview(null);
            }}
            frontInputRef={licenciaFrenteInputRef}
            backInputRef={licenciaReversoInputRef}
            frontId="licenciaFrente"
            backId="licenciaReverso"
          />
        </div>

          <div className="form-group-full-width">
            <ImageViewSelector
              title="Pasaporte/DUI (opcional)"
              frontImage={pasaporteFrentePreview}
              backImage={pasaporteReversoPreview}
              onFrontChange={(e) => {
                e.target.name = 'pasaporteFrente';
                handleChange(e);
              }}
              onBackChange={(e) => {
                e.target.name = 'pasaporteReverso';
                handleChange(e);
              }}
              onFrontRemove={() => {
                setValue('pasaporteFrente', null);
                setPasaporteFrentePreview && setPasaporteFrentePreview(null);
              }}
              onBackRemove={() => {
                setValue('pasaporteReverso', null);
                setPasaporteReversoPreview && setPasaporteReversoPreview(null);
              }}
              frontInputRef={pasaporteFrenteInputRef}
              backInputRef={pasaporteReversoInputRef}
              frontId="pasaporteFrente"
              backId="pasaporteReverso"
            />
          </div>

          <div className="form-group-full-width" style={{ position: 'relative' }}>
            <label htmlFor="fechaDeNacimiento" className="register-modal-label">Fecha de nacimiento</label>
            <input
              {...register('fechaDeNacimiento', {
                required: 'La fecha de nacimiento es obligatoria',
                validate: validateEdad
              })}
              id="fechaDeNacimiento"
              name="fechaDeNacimiento"
              type="date"
              className={(errors.fechaDeNacimiento || (registerError && registerError.toLowerCase().includes('mayor de edad'))) ? 'input-error' : ''}
              onFocus={() => setFocusedField('fechaDeNacimiento')}
              onBlur={() => setFocusedField(null)}
            />
            <TooltipPortal
              targetRef={{ current: document.getElementById('fechaDeNacimiento') }}
              visible={(errors.fechaDeNacimiento || (registerError && registerError.toLowerCase().includes('mayor de edad'))) && focusedField === 'fechaDeNacimiento'}
            >
              {errors.fechaDeNacimiento?.message || registerError}
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