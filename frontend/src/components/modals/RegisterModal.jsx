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
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    setError,
    clearErrors,
    getValues,
    reset,
    handleFileChange,
    handlePhoneChange,
    handleInputChange,
    show,
    showVerify,
    setShowVerify,
    registerError,
    setRegisterError,
    registerSuccess,
    setRegisterSuccess,
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
    setRegistrationSuccessData,
    licenciaPreview,
    pasaportePreview,
    validateEdad,
    validateConfirmPassword
  } = useRegisterModal();
  const { resendVerificationCode, login } = useAuth();

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.resendVerificationCode = resendVerificationCode;
    }
    handleOpenEffect(open);
  }, [open, handleOpenEffect, resendVerificationCode]);

  if (!open && !show) return null;

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

  if (showVerify) {
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
            <input
              ref={nombreRef}
              id="nombre"
              type="text"
              {...register('nombre', {
                required: 'El nombre es obligatorio',
                pattern: {
                  value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/,
                  message: 'Solo letras y espacios'
                }
              })}
              className={errors.nombre ? 'input-error' : ''}
              onFocus={() => setFocusedField('nombre')}
              onBlur={() => setFocusedField(null)}
            />
            {errors.nombre && <span className="fb-error-icon">!</span>}
            <TooltipPortal targetRef={nombreRef} visible={!!errors.nombre && focusedField === 'nombre'}>
              {errors.nombre?.message}
            </TooltipPortal>
          </div>

          <div className="form-group-half-width" style={{ position: 'relative' }}>
            <label htmlFor="password" className="register-modal-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                ref={passwordRef}
                id="password"
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'La contraseña es obligatoria',
                  minLength: { value: 6, message: 'Mínimo 6 caracteres' }
                })}
                className={errors.password ? 'input-error' : ''}
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
              {errors.password && <span className="fb-error-icon">!</span>}
            </div>
            <TooltipPortal targetRef={passwordRef} visible={!!errors.password && focusedField === 'password'}>
              {errors.password?.message}
            </TooltipPortal>
          </div>
          <div className="form-group-half-width" style={{ position: 'relative' }}>
            <label htmlFor="confirmPassword" className="register-modal-label">Confirmar contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                ref={confirmPasswordRef}
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword', {
                  required: 'Confirma tu contraseña',
                  validate: validateConfirmPassword
                })}
                className={errors.confirmPassword ? 'input-error' : ''}
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
              {errors.confirmPassword && <span className="fb-error-icon">!</span>}
            </div>
            <TooltipPortal targetRef={confirmPasswordRef} visible={!!errors.confirmPassword && focusedField === 'confirmPassword'}>
              {errors.confirmPassword?.message}
            </TooltipPortal>
          </div>

          <div className="form-group-half-width" style={{ position: 'relative' }}>
            <label htmlFor="telefono" className="register-modal-label">Teléfono</label>
            <div style={{ position: 'relative' }}>
              <input
                ref={telefonoRef}
                id="telefono"
                type="tel"
                {...register('telefono', {
                  required: 'El teléfono es obligatorio',
                  pattern: {
                    value: /^[0-9]{4}-[0-9]{4}$/,
                    message: 'Formato: 0000-0000'
                  }
                })}
                onChange={handlePhoneChange}
                className={errors.telefono ? 'input-error' : ''}
                onFocus={() => setFocusedField('telefono')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.telefono && <span className="fb-error-icon">!</span>}
            </div>
            <TooltipPortal targetRef={telefonoRef} visible={!!errors.telefono && focusedField === 'telefono'}>
              {errors.telefono?.message}
            </TooltipPortal>
          </div>
          <div className="form-group-half-width" style={{ position: 'relative' }}>
            <label htmlFor="email" className="register-modal-label">Correo electrónico</label>
            <div style={{ position: 'relative' }}>
              <input
                ref={emailRef}
                id="email"
                type="email"
                {...register('email', {
                  required: 'El correo es obligatorio',
                  pattern: {
                    value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
                    message: 'Correo inválido'
                  }
                })}
                className={errors.email ? 'input-error' : ''}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.email && <span className="fb-error-icon">!</span>}
            </div>
            <TooltipPortal targetRef={emailRef} visible={!!errors.email && focusedField === 'email'}>
              {errors.email?.message}
            </TooltipPortal>
          </div>

          <div className="form-group-half-width">
            <label htmlFor="licencia" className="register-modal-label">Licencia (foto)</label>
            <input id="licencia" name="licencia" type="file" accept="image/*" onChange={handleFileChange} />
            {licenciaPreview && (
              <img src={licenciaPreview} alt="Previsualización de Licencia" className="register-modal-image-preview" />
            )}
          </div>

          <div className="form-group-half-width">
            <label htmlFor="pasaporte" className="register-modal-label">Pasaporte/DUI (foto)</label>
            <input id="pasaporte" name="pasaporte" type="file" accept="image/*" onChange={handleFileChange} />
            {pasaportePreview && (
              <img src={pasaportePreview} alt="Previsualización de Pasaporte/DUI" className="register-modal-image-preview" />
            )}
          </div>

          <div className="form-group-full-width">
            <label htmlFor="nacimiento" className="register-modal-label">Fecha de nacimiento</label>
            <input
              id="nacimiento"
              type="date"
              {...register('nacimiento', { required: 'La fecha de nacimiento es obligatoria', validate: validateEdad })}
              className={errors.nacimiento ? 'input-error' : ''}
              onFocus={() => setFocusedField('nacimiento')}
              onBlur={() => setFocusedField(null)}
            />
            <TooltipPortal
              targetRef={{ current: document.getElementById('nacimiento') }}
              visible={!!errors.nacimiento && focusedField === 'nacimiento'}
            >
              {errors.nacimiento?.message}
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

