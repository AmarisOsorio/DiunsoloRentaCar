import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useForm } from 'react-hook-form';

const useRegisterModal = () => {
  const { register: registerUser, verifyAccount } = useAuth();

  // React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    setError,
    clearErrors,
    getValues,
    reset
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      nombre: '',
      password: '',
      confirmPassword: '',
      telefono: '',
      email: '',
      licencia: null,
      pasaporte: null,
      nacimiento: '',
    }
  });

  const [licenciaPreview, setLicenciaPreview] = useState(null);
  const [pasaportePreview, setPasaportePreview] = useState(null);

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

  // Manejo de archivos (licencia, pasaporte)
  const handleFileChange = async (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const formData = new FormData();
      formData.append('image', files[0]);
      try {
        const res = await fetch('/api/upload/upload-image', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        if (data.url) {
          setValue(name, data.url);
          if (name === 'licencia') setLicenciaPreview(URL.createObjectURL(files[0]));
          if (name === 'pasaporte') setPasaportePreview(URL.createObjectURL(files[0]));
        } else {
          setRegisterError('Error subiendo la imagen.');
        }
      } catch (err) {
        setRegisterError('Error subiendo la imagen.');
      }
    } else {
      setValue(name, null);
      if (name === 'licencia') setLicenciaPreview(null);
      if (name === 'pasaporte') setPasaportePreview(null);
    }
  };

  // Teléfono con formato 0000-0000
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) {
      value = value.slice(0, 4) + '-' + value.slice(4, 8);
    }
    if (value.length > 9) value = value.slice(0, 9);
    setValue('telefono', value);
  };

  // Validación personalizada para edad mínima
  const validateEdad = (value) => {
    if (!value) return 'La fecha de nacimiento es obligatoria';
    const birthDate = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    if (age < 18) return 'Debes ser mayor de edad para registrarte.';
    return true;
  };

  // Validación personalizada para confirmación de contraseña
  const validateConfirmPassword = (value) => {
    if (value !== getValues('password')) return 'Las contraseñas no coinciden.';
    return true;
  };

  // Submit final usando React Hook Form
  const onSubmit = async (data) => {
    setRegisterError('');
    setRegisterSuccess('');
    setLoading(true);
    // Validación de teléfono
    if (!/^[0-9]{4}-[0-9]{4}$/.test(data.telefono)) {
      setRegisterError('El teléfono debe estar completo');
      setLoading(false);
      return;
    }
    // Validación de email (ya la hace RHF, pero por si acaso)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      setRegisterError('Dirección de correo incorrecta.');
      setLoading(false);
      return;
    }
    // Validación de imágenes (opcional)
    // ...
    try {
      const response = await fetch('/api/clients/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: data.email })
      });
      if (!response.ok) {
        setRegisterError('No se pudo verificar el correo. Intenta más tarde.');
        setLoading(false);
        return;
      }
      const emailResult = await response.json();
      if (emailResult.exists) {
        // Si el correo existe, intentamos registrar para ver si está verificado o no
        const payload = {
          nombre_completo: data.nombre,
          correo: data.email,
          contraseña: data.password,
          telefono: data.telefono,
          fecha_de_nacimiento: data.nacimiento,
          pasaporte_dui: data.pasaporte || undefined,
          licencia: data.licencia || undefined
        };
        const result = await registerUser(payload);
        if (result.message && result.message.toLowerCase().includes('datos actualizados') && result.isVerified === false) {
          setRegisterError('La cuenta ya estaba registrada pero no verificada. Tus datos han sido actualizados y se ha enviado un nuevo código de verificación.');
          setShowVerify(true);
          setLoading(false);
          return;
        }
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
          setLoading(false);
          return;
        }
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
      const payload = {
        nombre_completo: data.nombre,
        correo: data.email,
        contraseña: data.password,
        telefono: data.telefono,
        fecha_de_nacimiento: data.nacimiento,
        pasaporte_dui: data.pasaporte || undefined,
        licencia: data.licencia || undefined
      };
      const result = await registerUser(payload);
      if (result.message && result.message.includes('verifica tu correo')) {
        setRegistrationSuccessData({ nombre: data.nombre });
        setRegisterSuccess(result.message);
      } else if (result.message && result.message.toLowerCase().includes('client already exists')) {
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
      setRegisterSuccess('¡Cuenta verificada! Ya puedes iniciar sesión.');
    }
    return result;
  };

  // Para inputs controlados (opcional, para tooltips y focus)
  const handleInputChange = (e) => {
    if (focusedField === e.target.name) {
      setFocusedField(null);
    }
  };

  return {
    register,
    handleSubmit: handleSubmit(onSubmit),
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
    handleVerify,
    handleOpenEffect,
    loading,
    registrationSuccessData,
    setRegistrationSuccessData,
    licenciaPreview,
    pasaportePreview,
    validateEdad,
    validateConfirmPassword
  };
};

export default useRegisterModal;
