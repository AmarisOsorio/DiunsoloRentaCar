import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext.jsx';

/**
 * Hook personalizado para manejar el flujo de recuperación de contraseña.
 * Gestiona los formularios, pasos, loading y comunicación con el backend.
 */
export function useForgotPasswordModal(onClose) {
  // Formularios para cada paso
  const correoForm = useForm(); // Paso 1: correo
  const codeForm = useForm();   // Paso 2: código de verificación
  const newPasswordForm = useForm(); // Paso 3: nueva contraseña

  // Estado del flujo
  const [step, setStep] = useState(1); // Paso actual
  const [loading, setLoading] = useState(false); // Estado de carga global
  const [message, setMessage] = useState(''); // Mensaje de éxito/error del backend
  const [correoGuardado, setCorreoGuardado] = useState(''); // Guarda el correo para reenvío

  // Funciones del contexto de autenticación
  const { requestPasswordRecovery, verifyRecoveryCode, setNewPassword: setNewPasswordAPI } = useAuth();

  /**
   * Envía el correo para iniciar la recuperación.
   * Si es exitoso, avanza al paso 2.
   */
  const handleCorreo = async (data) => {
    setLoading(true);
    setMessage('');
    setCorreoGuardado(data.correo);
    const result = await requestPasswordRecovery(data.correo);
    setMessage(result.message);
    setLoading(false);
    if (result.message && result.message.includes('enviado')) setStep(2);
  };

  /**
   * Reenvía el código de verificación al correo guardado.
   */
  const handleReenviarCodigo = async () => {
    if (!correoGuardado) return;
    setLoading(true);
    setMessage('');
    const result = await requestPasswordRecovery(correoGuardado);
    setMessage(result.message);
    setLoading(false);
  };

  /**
   * Verifica el código ingresado por el usuario.
   * Si es correcto, avanza al paso 3.
   */
  const handleCode = async (data) => {
    setLoading(true);
    setMessage('');
    const result = await verifyRecoveryCode(data.code);
    setMessage(result.message);
    setLoading(false);
    if (result.message && result.message.includes('verificado')) setStep(3);
  };

  /**
   * Envía la nueva contraseña al backend.
   * Si es exitosa, retorna success para mostrar animación.
   */
  const handleNewPassword = async (data) => {
    setLoading(true);
    setMessage('');
    const result = await setNewPasswordAPI(data.newPassword);
    setMessage(result.message);
    setLoading(false);
    if (result.message && result.message.includes('actualizada')) {
      return { success: true };
    }
    return { success: false, message: result.message };
  };

  /**
   * Resetea todos los formularios y estados internos.
   */
  const resetAll = () => {
    correoForm.reset();
    codeForm.reset();
    newPasswordForm.reset();
  };

  // Devuelve el API del hook para el componente
  return {
    step,
    setStep,
    loading,
    message,
    handleCorreo,
    handleReenviarCodigo,
    handleCode,
    handleNewPassword,
    correoForm,
    codeForm,
    newPasswordForm,
    resetAll,
  };
}
