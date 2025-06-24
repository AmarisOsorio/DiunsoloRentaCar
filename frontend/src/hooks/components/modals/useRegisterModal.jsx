import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';
import { useForm } from 'react-hook-form';

const useRegisterModal = () => {
  const { register: registerUser, verifyAccount, login } = useAuth();

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
      nombres: '',
      apellidos: '',
      contraseña: '', // changed from password
      confirmarContraseña: '', // changed from confirmPassword
      telefono: '',
      email: '',
      licenciaFrente: null,
      licenciaReverso: null,
      pasaporteFrente: null,
      pasaporteReverso: null,
      nacimiento: '',
    }
  });

  const [show, setShow] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [loading, setLoading] = useState(false);  const [registrationSuccessData, setRegistrationSuccessData] = useState(null);
  const [licenciaFrentePreview, setLicenciaFrentePreview] = useState(null);
  const [licenciaReversoPreview, setLicenciaReversoPreview] = useState(null);
  const [pasaporteFrentePreview, setPasaporteFrentePreview] = useState(null);
  const [pasaporteReversoPreview, setPasaporteReversoPreview] = useState(null);

  const nombreRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const telefonoRef = useRef();
  const emailRef = useRef();

  // Animación de apertura/cierre
  const handleOpenEffect = (isOpen) => {
    if (isOpen) {
      setShow(true);
    } else {
      const timeout = setTimeout(() => setShow(false), 300);
      return () => clearTimeout(timeout);
    }
  };
  // Handles changes to form input fields, including file inputs.
  const handleChange = async e => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      // Subir la imagen al backend y guardar la URL
      const formData = new FormData();
      formData.append("image", files[0]);
      try {
        const res = await fetch("/api/upload/upload-image", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.url) {
          setValue(name, data.url);
          // Actualizar preview correspondiente
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
          setRegisterError("Error subiendo la imagen.");
        }
      } catch (err) {
        setRegisterError("Error subiendo la imagen.");
      }
    } else if (name === 'licenciaFrente' || name === 'licenciaReverso' || name === 'pasaporteFrente' || name === 'pasaporteReverso') {
      setValue(name, null);
      // Limpiar preview correspondiente
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
    } else {
      setValue(name, null);
      // Limpiar todos los previews si es necesario
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
    if (value !== getValues('contraseña')) return 'Las contraseñas no coinciden.';
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
    try {
      const response = await fetch('/api/clients/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: data.email })
      });
      if (!response.ok) {
        setRegisterError("No se pudo verificar el correo. Intenta más tarde.");
        setLoading(false);
        return;
      }
      const emailResult = await response.json();
      if (emailResult.exists) {        // Si el correo existe, intentamos registrar para ver si está verificado o no
        const payload = {
          nombreCompleto: `${data.nombres} ${data.apellidos}`,
          correo: data.email,
          contraseña: data.contraseña, // use ñ
          telefono: data.telefono,
          fechaDeNacimiento: data.nacimiento,
          pasaporteFrenteDui: data.pasaporteFrente || undefined,
          pasaporteReversoDui: data.pasaporteReverso || undefined,
          licenciaFrente: data.licenciaFrente || undefined,
          licenciaReverso: data.licenciaReverso || undefined
        };
        const result = await registerUser(payload);
        if (result.message && result.message.toLowerCase().includes('datos actualizados') && result.isVerified === false) {
          setRegisterError('La cuenta ya estaba registrada pero no verificada. Tus datos han sido actualizados y se ha enviado un nuevo código de verificación.');
          setShowVerify(true);
          setLoading(false);
          return;
        }
        // Si el backend responde que ya existe pero NO está verificada (prioridad alta)
        if (
          result.message &&
          (result.message.toLowerCase().includes("no verificada") ||
            result.message.toLowerCase().includes("nuevo código enviado") ||
            result.message.toLowerCase().includes("se ha enviado un nuevo código de verificación") ||
            result.message.toLowerCase().includes("la cuenta ya está registrada pero no verificada"))
        ) {
          setRegisterError(
            "La cuenta ya está registrada pero no verificada. Se ha enviado un nuevo código de verificación. Si modificas tus datos, se actualizarán."
          );
          setShowVerify(true);
          // Ya no llamamos a resendVerificationCode aquí
          setLoading(false);
          return;
        }
        if (result.message && result.message.toLowerCase().includes('client already exists')) {
          if (result.isVerified === true || (result.message && result.message.toLowerCase().includes('ya está registrado y verificado'))) {
            setRegisterError('El correo ya está registrado y verificado.');
            setShowVerify(false);
          } else {
            setRegisterError("El correo ya está registrado.");
            setShowVerify(false);
          }
          setLoading(false);
          return;
        } else {
          setRegisterError("El correo ya está registrado.");
          setShowVerify(false);
        }
        setLoading(false);
        return;
      }
      if (emailResult.message && emailResult.message.toLowerCase().includes("correo ya está registrado")) {
        setRegisterError("El correo ya está registrado.");
        setLoading(false);
        return;
      }
    } catch (err) {
      setRegisterError("No se pudo verificar el correo. Intenta más tarde.");
      setLoading(false);
      return;
    }    try {
      const payload = {
        nombreCompleto: `${data.nombres} ${data.apellidos}`,
        correo: data.email,
        contraseña: data.contraseña, // use ñ
        telefono: data.telefono,
        fechaDeNacimiento: data.nacimiento,
        pasaporteFrenteDui: data.pasaporteFrente || undefined,
        pasaporteReversoDui: data.pasaporteReverso || undefined,
        licenciaFrente: data.licenciaFrente || undefined,
        licenciaReverso: data.licenciaReverso || undefined
      };
      const result = await registerUser(payload);      if (result.message && result.message.includes('verifica tu correo')) {
        setRegistrationSuccessData({ nombre: `${data.nombres} ${data.apellidos}` });
        setRegisterSuccess(result.message);
      } else if (result.message && result.message.toLowerCase().includes('client already exists')) {
        setRegisterError('La cuenta ya está registrada pero no verificada. Se ha enviado un nuevo código de verificación.');
        setShowVerify(true);
        if (typeof window !== "undefined") {
          if (window.resendVerificationCode) {
            await window.resendVerificationCode();
          }
        }
      } else {
        setRegisterError(result.message || "Error al registrar");
      }
    } catch (err) {
      setRegisterError("Error de red o servidor");
    }
    setLoading(false);
  };  const handleVerify = async (code) => {
    const result = await verifyAccount(code);
    if (result.message && result.message.includes('exitosamente')) {
      setRegisterSuccess('¡Cuenta verificada! Iniciando sesión...');
        try {
        // Obtener las credenciales del formulario
        const email = getValues('email');
        const password = getValues('contraseña');
        
        // Intentar iniciar sesión automáticamente usando el contexto
        const loginResult = await login({ correo: email, contraseña: password });
        
        if (loginResult.userType && !loginResult.needVerification) {
          // Login exitoso - redirigir después de un breve delay
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          // Si por alguna razón el login automático falla, mostrar mensaje normal
          setRegisterSuccess('¡Cuenta verificada! Ya puedes iniciar sesión.');
        }
      } catch (loginError) {
        // Si hay error en el login automático, solo mostrar mensaje de verificación exitosa
        setRegisterSuccess('¡Cuenta verificada! Ya puedes iniciar sesión.');
      }
    }
    return result;
  };

  const handleInputChange = (e) => {
    handleChange(e);
    if (focusedField === e.target.name) {
      setFocusedField(null);
    }
  };
  return {
    register,
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
    nombreRef,
    passwordRef,
    confirmPasswordRef,
    telefonoRef,
    emailRef,
    handleSubmit,
    onSubmit,
    handleVerify,
    handlePhoneChange,
    handleInputChange,
    handleOpenEffect,    loading,
    registrationSuccessData,
    setRegistrationSuccessData,    licenciaFrentePreview,
    licenciaReversoPreview,
    pasaporteFrentePreview,
    pasaporteReversoPreview,
    setLicenciaFrentePreview,
    setLicenciaReversoPreview,
    setPasaporteFrentePreview,
    setPasaporteReversoPreview,
    validateEdad,
    validateConfirmPassword,
    errors, // <-- exponer errors
    watch, // <-- return watch for RegisterModal.jsx
    getValues, // <-- add getValues for RegisterModal.jsx
    setValue // <-- add setValue for RegisterModal.jsx
  };
};

export default useRegisterModal;
