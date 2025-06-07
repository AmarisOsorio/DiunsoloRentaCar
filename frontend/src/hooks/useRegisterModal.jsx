import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const useRegisterModal = () => {
  const [form, setForm] = useState({
    nombre: '',
    password: '',
    confirmPassword: '',
    telefono: '',
    email: '',
    licencia: null,
    pasaporte: null,
    nacimiento: '',
    licenciaPreview: null,
    pasaportePreview: null
  });

  const { register, verifyAccount } = useAuth();

  const [show, setShow] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registrationSuccessData, setRegistrationSuccessData] = useState(null);

  const nombreRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const telefonoRef = useRef();
  const emailRef = useRef();

  // Animación de apertura/cierre
  const handleOpenEffect = (open) => {
    if (open) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timeout);
    }
  };

  // Handles changes to form input fields, including file inputs.
  const handleChange = e => {
    const { name, value, files } = e.target;
    setForm(prev => {
      if (files && files[0]) {
        return {
          ...prev,
          [name]: files[0],
          [`${name}Preview`]: URL.createObjectURL(files[0])
        };
      } else if (name === 'licencia' || name === 'pasaporte') {
        return {
          ...prev,
          [name]: null,
          [`${name}Preview`]: null
        };
      } else {
        return {
          ...prev,
          [name]: value
        };
      }
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setRegisterError('');
    setRegisterSuccess('');
    setLoading(true);
    // Validar formato de correo antes de continuar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setRegisterError('Dirección de correo incorrecta.');
      setLoading(false);
      return;
    }
    // Validar edad mínima (18 años)
    if (form.nacimiento) {
      const birthDate = new Date(form.nacimiento);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      if (age < 18) {
        setRegisterError('Debes ser mayor de edad para registrarte.');
        setLoading(false);
        return;
      }
    }
    if (form.password.length < 6) {
      setRegisterError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }
    if (form.password !== form.confirmPassword) {
      setRegisterError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }
    if (!/^[0-9]{4}-[0-9]{4}$/.test(form.telefono)) {
      setRegisterError('El teléfono debe estar completo');
      setLoading(false);
      return false;
    }
    try {
      const response = await fetch('/api/clients/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: form.email })
      });
      if (!response.ok) {
        setRegisterError('No se pudo verificar el correo. Intenta más tarde.');
        setLoading(false);
        return;
      }
      const emailResult = await response.json();
      if (emailResult.exists) {
        // Si el correo existe, intentamos registrar para ver si está verificado o no
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
        // Si el backend responde que ya existe pero no está verificado y datos actualizados
        if (result.message && result.message.toLowerCase().includes('datos actualizados') && result.isVerified === false) {
          setRegisterError('La cuenta ya estaba registrada pero no verificada. Tus datos han sido actualizados y se ha enviado un nuevo código de verificación.');
          setShowVerify(true);
          setLoading(false);
          return;
        }
        // Si el backend responde que ya existe pero NO está verificada (prioridad alta)
        if (
          result.message && (
            result.message.toLowerCase().includes('no verificada') ||
            result.message.toLowerCase().includes('nuevo código enviado') ||
            result.message.toLowerCase().includes('se ha enviado un nuevo código de verificación') ||
            result.message.toLowerCase().includes('la cuenta ya está registrada pero no verificada')
          )
        ) {
          setRegisterError('La cuenta ya está registrada pero no verificada. Se ha enviado un nuevo código de verificación. Si modificas tus datos, se actualizarán.');
          setShowVerify(true);
          // Ya no llamamos a resendVerificationCode aquí
          setLoading(false);
          return;
        }
        // Si el backend responde que ya existe y está verificado
        if (result.message && result.message.toLowerCase().includes('client already exists')) {
          if (result.isVerified === true || (result.message && result.message.toLowerCase().includes('ya está registrado y verificado'))) {
            setRegisterError('El correo ya está registrado y verificado.');
            setShowVerify(false);
          } else {
            setRegisterError('El correo ya está registrado.');
            setShowVerify(false);
          }
          setLoading(false);
          return;
        } else {
          setRegisterError('El correo ya está registrado.');
          setShowVerify(false);
        }
        setLoading(false);
        return;
      }
      if (emailResult.message && emailResult.message.toLowerCase().includes('correo ya está registrado')) {
        setRegisterError('El correo ya está registrado.');
        setLoading(false);
        return;
      }
    } catch (err) {
      setRegisterError('No se pudo verificar el correo. Intenta más tarde.');
      setLoading(false);
      return;
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
        setRegistrationSuccessData({ nombre: form.nombre });
        setRegisterSuccess(result.message);
      } else if (result.message && result.message.toLowerCase().includes('client already exists')) {
        // Si el backend responde aquí que ya existe pero no está verificado
        setRegisterError('La cuenta ya está registrada pero no verificada. Se ha enviado un nuevo código de verificación.');
        setShowVerify(true);
        if (typeof window !== 'undefined') {
          if (window.resendVerificationCode) {
            await window.resendVerificationCode();
          }
        }
      } else {
        setRegisterError(result.message || 'Error al registrar');
      }
    } catch (err) {
      setRegisterError('Error de red o servidor');
    }
    setLoading(false);
  };

  const handleVerify = async (code) => {
    const result = await verifyAccount(code);
    if (result.message && result.message.includes('exitosamente')) {
      // No cerrar el modal de verificación aquí, solo mostrar el éxito
      setRegisterSuccess('¡Cuenta verificada! Ya puedes iniciar sesión.');
      // El cierre del modal de verificación lo maneja el flujo del modal de verificación
    }
    return result;
  };

  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4, 8);
    }
    if (value.length > 9) value = value.slice(0, 9);
    handleChange({
      target: {
        name: 'telefono',
        value
      }
    });
  };

  const handleInputChange = (e) => {
    handleChange(e);
    if (focusedField === e.target.name) {
      setFocusedField(null);
    }
  };

  return {
    form,
    handleChange,
    setForm,
    show,
    setShow,
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
    handleSubmit,
    handleVerify,
    handlePhoneChange,
    handleInputChange,
    handleOpenEffect,
    loading,
    registrationSuccessData,
    setRegistrationSuccessData
  };
};

export default useRegisterModal;
