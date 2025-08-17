import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';
import { useForm } from 'react-hook-form';

const useRegisterModal = () => {
  const { register: registerUser, verifyAccount, login } = useAuth();

  // React Hook Form con los nombres correctos para el backend
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
      nombres: '',
      apellidos: '',
      contraseña: '',
      confirmarContraseña: '',
      telefono: '',
      email: '',
      fechaDeNacimiento: '',
      licenciaFrente: null,
      licenciaReverso: null,
      pasaporteFrente: null,
      pasaporteReverso: null,
    }
  });

  const [show, setShow] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);
  const [registrationSuccessData, setRegistrationSuccessData] = useState(null);
  const [licenciaFrentePreview, setLicenciaFrentePreview] = useState(null);
  const [licenciaReversoPreview, setLicenciaReversoPreview] = useState(null);
  const [pasaporteFrentePreview, setPasaporteFrentePreview] = useState(null);
  const [pasaporteReversoPreview, setPasaporteReversoPreview] = useState(null);

  // Animación de apertura/cierre
  const handleOpenEffect = (isOpen) => {
    if (isOpen) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timeout);
    }
  };

  // Maneja cambios en archivos
  const handleChange = e => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setValue(name, files[0]);
      const previewUrl = URL.createObjectURL(files[0]);
      switch(name) {
        case 'licenciaFrente':
          setLicenciaFrentePreview(previewUrl);
          break;
        case 'licenciaReverso':
          setLicenciaReversoPreview(previewUrl);
          break;
        case 'pasaporteFrente':
          setPasaporteFrentePreview(previewUrl);
          break;
        case 'pasaporteReverso':
          setPasaporteReversoPreview(previewUrl);
          break;
      }
    } else {
      setValue(name, null);
      switch(name) {
        case 'licenciaFrente':
          setLicenciaFrentePreview(null);
          break;
        case 'licenciaReverso':
          setLicenciaReversoPreview(null);
          break;
        case 'pasaporteFrente':
          setPasaporteFrentePreview(null);
          break;
        case 'pasaporteReverso':
          setPasaporteReversoPreview(null);
          break;
      }
    }
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
    if (value !== getValues('contraseña')) return 'Las contraseñas no coinciden.';
    return true;
  };

  // Submit del formulario
  const onSubmit = async (data) => {
    setRegisterError('');
    setRegisterSuccess('');
    setLoading(true);

    // Normalizar teléfono
    let phone = (data.telefono || '').toString();
    const raw = phone.replace(/[^0-9]/g, '');
    if (raw.length === 8) {
      phone = raw.slice(0, 4) + '-' + raw.slice(4, 8);
    }

    // Preparar datos para el backend (mapear nombres de campos)
    const backendData = {
      name: data.nombres,
      lastName: data.apellidos,
      email: data.email,
      password: data.contraseña,
      phone: phone,
      birthDate: data.fechaDeNacimiento,
    };

    // Si hay archivos, usar FormData, sino usar objeto regular
    const hasFiles = [data.licenciaFrente, data.licenciaReverso, data.pasaporteFrente, data.pasaporteReverso].some(f => f instanceof File);
    
    let payload;
    if (hasFiles) {
      payload = new FormData();
      Object.entries(backendData).forEach(([key, value]) => {
        payload.append(key, value);
      });
      
      if (data.licenciaFrente instanceof File) payload.append('licenseFront', data.licenciaFrente);
      if (data.licenciaReverso instanceof File) payload.append('licenseBack', data.licenciaReverso);
      if (data.pasaporteFrente instanceof File) payload.append('passportFront', data.pasaporteFrente);
      if (data.pasaporteReverso instanceof File) payload.append('passportBack', data.pasaporteReverso);
    } else {
      payload = backendData;
    }

    try {
      const result = await registerUser(payload);
      
      if (result.message && (result.message.includes('verifica tu correo') || result.message.includes('Cliente registrado exitosamente'))) {
        setRegistrationSuccessData({ nombre: `${data.nombres} ${data.apellidos}` });
        setRegisterSuccess(result.message);
      } else if (result.message && result.message.toLowerCase().includes('ya está registrado')) {
        setRegisterError('El correo ya está registrado.');
      } else {
        setRegisterError(result.message || "Error al registrar");
      }
    } catch (err) {
      setRegisterError("Error de red o servidor");
    }
    
    setLoading(false);
  };

  const handleVerify = async (code) => {
    const result = await verifyAccount(code);
    if (result.message && result.message.includes('exitosamente')) {
      setRegisterSuccess('¡Cuenta verificada! Iniciando sesión...');
      try {
        const email = getValues('email');
        const password = getValues('contraseña');
        
        const loginResult = await login({ email: email, password: password });
        
        if (loginResult.userType && !loginResult.needVerification) {
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          setRegisterSuccess('¡Cuenta verificada! Ya puedes iniciar sesión.');
        }
      } catch (loginError) {
        setRegisterSuccess('¡Cuenta verificada! Ya puedes iniciar sesión.');
      }
    }
    return result;
  };

  return {
    register,
    handleSubmit,
    onSubmit,
    handleChange,
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
    validateConfirmPassword,
    errors,
    watch,
    setValue
  };
};

export default useRegisterModal;