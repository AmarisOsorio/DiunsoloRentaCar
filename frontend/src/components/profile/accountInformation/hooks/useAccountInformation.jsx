  // --- Eliminar cuenta con validación de reservas/contratos ---
  const handleDeleteAccount = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/profile/delete`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'No se pudo eliminar la cuenta.');
      }
      // Opcional: limpiar estado, cerrar sesión, redirigir, etc.
      setShowSuccess(true);
      setSuccessMessage('¡Cuenta eliminada correctamente!');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      throw err;
    }
  };
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

/**
 * Hook para la información y edición básica del perfil (nombre, apellido, teléfono, fechaNacimiento, documentos)
 */
// --- INICIO: Lógica migrada de usePerfil.js ---
export function useInfoPerfil() {
  // --- Función para eliminar imagen de documento con confirmación modal ---
  const handleRemoveImage = (documentType, side) => {
    setImageConfirmModal({
      isOpen: true,
      action: 'delete',
      documentType,
      side,
      file: null,
      imagePreview: null
    });
  };

  // --- Confirmar acción del modal (subida o eliminación) ---
  // --- Confirmar acción del modal (subida o eliminación) ---
  const handleImageConfirm = async () => {
    if (imageConfirmModal.action === 'upload') {
      // Subir imagen al backend
      const formData = new FormData();
      formData.append('document', imageConfirmModal.file);
      formData.append('documentType', imageConfirmModal.documentType);
      formData.append('side', imageConfirmModal.side);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/profile/upload-document`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        const data = await res.json();
        if (data.success && data.fileUrl) {
          setLocalUserInfo((prev) => {
            const key = imageConfirmModal.documentType === 'licencia'
              ? (imageConfirmModal.side === 'frente' ? 'licenciaFrente' : 'licenciaReverso')
              : (imageConfirmModal.side === 'frente' ? 'pasaporteFrente' : 'pasaporteReverso');
            return { ...prev, [key]: data.fileUrl };
          });
          setSuccessMessage('¡Imagen subida correctamente!');
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        } else {
          setSuccessMessage(data.message || 'Error al subir la imagen');
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        }
      } catch (error) {
        setSuccessMessage('Error de red al subir la imagen');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    } else if (imageConfirmModal.action === 'delete') {
      // Eliminar imagen
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/profile/delete-document`, {
          method: 'DELETE',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentType: imageConfirmModal.documentType, side: imageConfirmModal.side })
        });
        const data = await res.json();
        if (data.success) {
          setLocalUserInfo((prev) => {
            const key = imageConfirmModal.documentType === 'licencia'
              ? (imageConfirmModal.side === 'frente' ? 'licenciaFrente' : 'licenciaReverso')
              : (imageConfirmModal.side === 'frente' ? 'pasaporteFrente' : 'pasaporteReverso');
            return { ...prev, [key]: null };
          });
          setSuccessMessage('Imagen eliminada correctamente');
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        } else {
          setSuccessMessage(data.message || 'Error al eliminar la imagen');
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        }
      } catch (error) {
        setSuccessMessage('Error de red al eliminar la imagen');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    }
    // Cierra el modal después de la acción
    setImageConfirmModal({
      isOpen: false,
      action: null,
      documentType: null,
      side: null,
      file: null,
      imagePreview: null
    });
  };
  const { userType, userInfo, getProfile, updateUserInfo, changePassword, deleteAccount, uploadDocument, deleteDocument } = useAuth();
  // --- Estados y lógica para verificación de cambio de correo ---
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState(''); // correo a verificar
  const [emailVerificationError, setEmailVerificationError] = useState('');
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailResending, setEmailResending] = useState(false);
  const [emailCodeReady, setEmailCodeReady] = useState(true);

  // Enviar código de verificación al nuevo correo
  const handleVerifyEmailRequest = async (correo) => {
    setEmailVerificationError('');
    setEmailVerifying(true);
    // Validar si el correo ingresado es igual al actual (case/espacios ignorados)
    const correoNormalized = (correo || '').trim().toLowerCase();
    const correoActualNormalized = (localUserInfo.correo || '').trim().toLowerCase();
    if (correoNormalized === correoActualNormalized) {
      setValidationErrors((prev) => ({ ...prev, correo: 'No puedes ingresar tu mismo correo electronico' }));
      setHasErrors(true);
      setEmailVerifying(false);
      return false;
    }
    try {
      // Llama al backend para enviar código
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/profile/request-email-change`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo })
      });
      const data = await res.json();
      if (!data.success) {
        // Mostrar error como validación visual igual que otros campos
        setValidationErrors((prev) => ({ ...prev, correo: data.message || 'No se pudo enviar el código' }));
        setHasErrors(true);
        setEmailVerifying(false);
        return false;
      }
      setVerifyEmail(correo); // <-- IMPORTANTE: solo setear aquí tras éxito
      setEmailVerifying(false);
      setEmailCodeReady(true);
      setValidationErrors((prev) => ({ ...prev, correo: undefined })); // Limpia error si éxito
      setHasErrors(false);
      return true;
    } catch (e) {
      setValidationErrors((prev) => ({ ...prev, correo: 'Error de red' }));
      setHasErrors(true);
      setEmailVerifying(false);
      return false;
    }
  };

  // Verificar código y actualizar correo
  const handleVerifyEmailCode = async (correo, code) => {
    setEmailVerificationError('');
    setEmailVerifying(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/profile/verify-email-change`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo, code })
      });
      const data = await res.json();
      if (data.success) {
        setShowVerifyModal(false);
        setEditingField(null);
        setTempValues({});
        setValidationErrors({});
        setHasErrors(false);
        setSuccessMessage('¡Correo actualizado correctamente!');
        setShowSuccess(true);
        setLocalUserInfo((prev) => ({ ...prev, correo }));
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        setEmailVerificationError(data.message || 'Código incorrecto');
      }
    } catch (e) {
      setEmailVerificationError('Error de red');
    } finally {
      setEmailVerifying(false);
    }
  };

  // Reenviar código
  const handleResendEmailCode = async () => {
    setEmailResending(true);
    setEmailVerificationError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/profile/request-email-change`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: verifyEmail })
      });
      const data = await res.json();
      if (!data.success) {
        setValidationErrors((prev) => ({ ...prev, correo: data.message || 'No se pudo reenviar el código' }));
        setHasErrors(true);
      } else {
        setValidationErrors((prev) => ({ ...prev, correo: undefined }));
        setHasErrors(false);
      }
    } catch (e) {
      setValidationErrors((prev) => ({ ...prev, correo: 'Error de red' }));
      setHasErrors(true);
    } finally {
      setEmailResending(false);
    }
  };
  const navigate = useNavigate();

  // Estados para el submenú activo
  // Leer el submenú activo desde localStorage si existe
  const getInitialSubmenu = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('perfilActiveSubmenu');
      if (saved === 'informacion-cuenta' || saved === 'reservas' || saved === 'contratos') {
        return saved;
      }
    }
    return 'informacion-cuenta';
  };
  const [activeSubmenu, setActiveSubmenu] = useState(getInitialSubmenu);

  // Estados para edición de campos
  const [editingField, setEditingField] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Estados para validación y errores
  const [validationErrors, setValidationErrors] = useState({});
  const [hasErrors, setHasErrors] = useState(false);

  // Estados para información del usuario (conectado con la base de datos)
  const [localUserInfo, setLocalUserInfo] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    fechaNacimiento: '',
    miembroDesde: '',
    licenciaFrente: null,
    licenciaReverso: null,
    pasaporteFrente: null,
    pasaporteReverso: null
  });

  // Estados para el modal de confirmación de imágenes
  const [imageConfirmModal, setImageConfirmModal] = useState({
    isOpen: false,
    action: null, // 'upload' | 'delete'
    documentType: null, // 'licencia' | 'pasaporte'
    side: null, // 'frente' | 'reverso'
    file: null, // archivo a subir
    imagePreview: null // preview de la imagen
  });

  // Cargar información del perfil al montar el componente
  useEffect(() => {
    const loadProfile = async () => {
      if (getProfile) {
        try {
          const result = await getProfile();
          if (result.success) {
            const userData = result.user;
            // Adaptar para nombres/apellidos o nombre/apellido
            let nombre = userData.nombre || userData.nombres || userData.nombreCompleto || '';
            let apellido = userData.apellido || userData.apellidos || '';
            if (!apellido && nombre && nombre.split(' ').length > 1) {
              const partes = nombre.split(' ');
              nombre = partes.slice(0, -1).join(' ');
              apellido = partes.slice(-1).join(' ');
            }
            // Fecha de registro robusta
            let fechaRegistro = userData.fechaRegistro || userData.createdAt || '';
            let miembroDesde = '';
            if (fechaRegistro) {
              // Si es objeto tipo Date, conviértelo a string ISO
              let fechaStr = fechaRegistro;
              if (typeof fechaRegistro === 'object' && fechaRegistro !== null && fechaRegistro.toISOString) {
                fechaStr = fechaRegistro.toISOString();
              }
              const fecha = new Date(fechaStr);
              miembroDesde = isNaN(fecha.getTime()) ? '' : fecha.toLocaleDateString('es-ES');
            }
            // Unificar campo de fecha de nacimiento
            let fechaNacimientoRaw = userData.fechaNacimiento || userData.fechaDeNacimiento || '';
            let fechaNacimiento = '';
            if (fechaNacimientoRaw) {
              const d = new Date(fechaNacimientoRaw);
              if (!isNaN(d.getTime())) {
                fechaNacimiento = d.toISOString().split('T')[0];
              }
            }
            setLocalUserInfo({
              nombre,
              apellido,
              telefono: userData.telefono || '',
              correo: userData.correo || userData.email || '',
              fechaNacimiento,
              miembroDesde,
              licenciaFrente: userData.licenciaFrente || userData.licencia || null,
              licenciaReverso: userData.licenciaReverso || null,
              pasaporteFrente: userData.pasaporteFrente || userData.pasaporteDui || null,
              pasaporteReverso: userData.pasaporteReverso || null
            });
          }
        } catch (error) {
          console.warn('Error cargando perfil:', error);
        }
      }
    };
    loadProfile();
  }, [getProfile]);

  // Estados para campos temporales durante edición
  const [tempValues, setTempValues] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Referencias para los inputs de archivos
  const licenciaFrenteRef = useRef();
  const licenciaReversoRef = useRef();
  const pasaporteFrenteRef = useRef();
  const pasaporteReversoRef = useRef();

  // --- Constantes y funciones movidas de usePerfil ---
  // Formatear teléfono
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length > 4) {
      return numbers.slice(0, 4) + '-' + numbers.slice(4, 8);
    }
    return numbers;
  };

  // Validación de campos
  const validateField = (field, value) => {
    const errors = { ...validationErrors };
    let isValid = true;
    switch (field) {
      case 'telefono':
        if (!/^[267][0-9]{3}-[0-9]{4}$/.test(value)) {
          errors.telefono = 'El teléfono debe tener el formato correcto (ej: 2345-6789, inicia con 2, 6 o 7)';
          isValid = false;
        } else {
          delete errors.telefono;
        }
        break;
      case 'correo':
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.correo = 'Ingresa un correo electrónico válido';
          isValid = false;
        } else {
          delete errors.correo;
        }
        break;
      case 'fechaNacimiento': {
        const fechaNacimiento = new Date(value);
        const fechaActual = new Date();
        if (isNaN(fechaNacimiento.getTime())) {
          errors.fechaNacimiento = 'Por favor ingresa una fecha de nacimiento válida';
          isValid = false;
        } else if (fechaNacimiento > fechaActual) {
          errors.fechaNacimiento = 'La fecha de nacimiento no puede ser en el futuro';
          isValid = false;
        } else {
          const edad = fechaActual.getFullYear() - fechaNacimiento.getFullYear();
          const mesActual = fechaActual.getMonth();
          const diaActual = fechaActual.getDate();
          const mesNacimiento = fechaNacimiento.getMonth();
          const diaNacimiento = fechaNacimiento.getDate();
          const edadReal = edad - (mesActual < mesNacimiento || (mesActual === mesNacimiento && diaActual < diaNacimiento) ? 1 : 0);
          if (edadReal < 18) {
            errors.fechaNacimiento = `Debes ser mayor de 18 años. Tu edad actual es de ${edadReal} años.`;
            isValid = false;
          } else {
            delete errors.fechaNacimiento;
          }
        }
        break;
      }
      case 'nombre':
        if (!value || value.trim().length < 2) {
          errors.nombre = 'El nombre debe tener al menos 2 caracteres';
          isValid = false;
        } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s]+$/.test(value)) {
          errors.nombre = 'El nombre solo puede contener letras y espacios';
          isValid = false;
        } else {
          delete errors.nombre;
        }
        break;
      case 'apellido':
        if (!value || value.trim().length < 2) {
          errors.apellido = 'El apellido debe tener al menos 2 caracteres';
          isValid = false;
        } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s]+$/.test(value)) {
          errors.apellido = 'El apellido solo puede contener letras y espacios';
          isValid = false;
        } else {
          delete errors.apellido;
        }
        break;
      default:
        break;
    }
    setValidationErrors(errors);
    setHasErrors(Object.keys(errors).length > 0);
    return isValid;
  };

  // Actualizar valores temporales con validación en tiempo real y filtrar nombre/apellido
  const updateTempValue = (field, value) => {
    let filteredValue = value;
    if (field === 'nombre' || field === 'apellido') {
      // Solo letras, espacios y tildes
      filteredValue = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñüÜ\s]/g, '');
    }
    setTempValues(prev => ({ ...prev, [field]: filteredValue }));
    if (hasErrors || validationErrors[field]) {
      validateField(field, filteredValue);
    }
  };

  // Obtener la clase CSS del input basada en el estado de validación
  const getInputClassName = (fieldName, baseClassName = 'perfil-input') => {
    const hasError = validationErrors[fieldName];
    const hasValue = tempValues[fieldName] || localUserInfo[fieldName];
    let className = baseClassName;
    if (hasError) {
      className += ' error';
    } else if (hasValue && (hasErrors || validationErrors[fieldName] !== undefined)) {
      className += ' success';
    }
    return className;
  };

  const handleEditField = (field) => {
    setEditingField(field);
    setTempValues({ ...localUserInfo });
  };
  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValues({});
    setValidationErrors({});
    setHasErrors(false);
  };

  // Guardar campo editado (edición por campo)
  const handleSaveField = async (field) => {
    let fieldsToSave = {};
    // Cambiar contraseña
    if (field === 'password') {
      // Validaciones básicas
      let errors = {};
      if (!newPassword || newPassword.length < 6) {
        errors.newPassword = 'La nueva contraseña debe tener al menos 6 caracteres';
      }
      if (newPassword !== confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
      }
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setHasErrors(true);
        return;
      }
      setIsSaving(true);
      try {
        const result = await changePassword(newPassword);
        if (result.success) {
          setEditingField(null);
          setNewPassword('');
          setConfirmPassword('');
          setValidationErrors({});
          setHasErrors(false);
          setSuccessMessage('¡Contraseña actualizada correctamente!');
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 2000);
        } else {
          // Si el backend devuelve que la contraseña es igual a la anterior, mostrarlo en el campo newPassword
          if (result.message && result.message.toLowerCase().includes('igual a la anterior')) {
            setValidationErrors({ newPassword: result.message });
          } else {
            setValidationErrors({ general: result.message || 'Error al cambiar la contraseña' });
          }
          setHasErrors(true);
        }
      } catch (error) {
        setValidationErrors({ general: 'Error de red al cambiar la contraseña' });
        setHasErrors(true);
      } finally {
        setIsSaving(false);
      }
      return;
    }
    // Si se está editando nombre o apellido, guardar ambos juntos
    if (field === 'nombre' || field === 'apellido') {
      fieldsToSave = {
        nombre: tempValues.nombre ?? localUserInfo.nombre,
        apellido: tempValues.apellido ?? localUserInfo.apellido,
      };
      // Validar ambos
      const validNombre = validateField('nombre', fieldsToSave.nombre);
      const validApellido = validateField('apellido', fieldsToSave.apellido);
      if (!validNombre || !validApellido) return;
    } else if (field === 'fechaNacimiento') {
      // Validar y formatear fechaNacimiento
      const fecha = tempValues.fechaNacimiento ?? localUserInfo.fechaNacimiento;
      if (!validateField('fechaNacimiento', fecha)) return;
      // Formatear a YYYY-MM-DD si es posible
      let formattedDate = fecha;
      if (fecha) {
        const d = new Date(fecha);
        if (!isNaN(d.getTime())) {
          formattedDate = d.toISOString().split('T')[0];
        }
      }
      // Enviar al backend como fechaDeNacimiento, pero mantener local como fechaNacimiento
      fieldsToSave.fechaDeNacimiento = formattedDate;
    } else {
      fieldsToSave[field] = tempValues[field];
      if (!validateField(field, tempValues[field])) return;
    }
    setIsSaving(true);
    try {
      const result = await updateUserInfo(fieldsToSave);
      if (result.success) {
        setLocalUserInfo((prev) => {
          // Si se actualizó fechaDeNacimiento, guardar en formato yyyy-mm-dd en local como fechaNacimiento
          if (fieldsToSave.fechaDeNacimiento !== undefined) {
            return { ...prev, fechaNacimiento: fieldsToSave.fechaDeNacimiento };
          }
          return { ...prev, ...fieldsToSave };
        });
        setEditingField(null);
        setTempValues({});
        setValidationErrors({});
        setHasErrors(false);
        setSuccessMessage('¡Información actualizada correctamente!');
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        setValidationErrors((prev) => ({ ...prev, general: result.message || 'Error al guardar cambios' }));
        setHasErrors(true);
      }
    } catch (error) {
      setValidationErrors((prev) => ({ ...prev, general: 'Error de red al guardar cambios' }));
      setHasErrors(true);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Función para subir archivos de documentos ---
  const handleFileUpload = (event, documentType, side) => {
    // Abre el modal de confirmación de imagen antes de subir
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageConfirmModal({
        isOpen: true,
        action: 'upload',
        documentType,
        side,
        file,
        imagePreview: e.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  // ...existing code...

  // --- Función para cancelar el modal de imagen ---
  const handleImageCancel = () => {
    setImageConfirmModal({
      isOpen: false,
      action: null,
      documentType: null,
      side: null,
      file: null,
      imagePreview: null
    });
  };

  const handleNavigation = (submenu) => {
    setActiveSubmenu(submenu);
    if (typeof window !== 'undefined') {
      localStorage.setItem('perfilActiveSubmenu', submenu);
    }
  };

  return {
    activeSubmenu,
    setActiveSubmenu,
    editingField,
    setEditingField,
    showSuccess,
    setShowSuccess,
    successMessage,
    setSuccessMessage,
    showPassword,
    setShowPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isSaving,
    setIsSaving,
    localUserInfo,
    setLocalUserInfo,
    tempValues,
    setTempValues,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    validationErrors,
    setValidationErrors,
    hasErrors,
    setHasErrors,
    licenciaFrenteRef,
    licenciaReversoRef,
    pasaporteFrenteRef,
    pasaporteReversoRef,
    handleEditField,
    handleCancelEdit,
    handleSaveField,
    handleFileUpload,
    handleRemoveImage,
    handleImageConfirm,
    handleImageCancel,
    formatPhoneNumber,
    validateField,
    updateTempValue,
    getInputClassName,
    imageConfirmModal,
    setImageConfirmModal,

    // Navegación de submenús
    handleNavigation,

    // Eliminar cuenta
    handleDeleteAccount,

    // Para verificación de email
    showVerifyModal,
    setShowVerifyModal,
    verifyEmail,
    handleVerifyEmailRequest,
    handleVerifyEmailCode,
    handleResendEmailCode,
    emailCodeReady,
    emailVerificationError,
    emailVerifying,
    emailResending

  };
}
