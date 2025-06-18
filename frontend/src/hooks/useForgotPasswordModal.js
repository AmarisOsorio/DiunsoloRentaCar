import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export function useForgotPasswordModal(onClose) {
  // Formularios
  const correoForm = useForm();
  const codeForm = useForm();
  const newPasswordForm = useForm();

  // Lógica de pasos y mensajes
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Auth
  const { requestPasswordRecovery, verifyRecoveryCode, setNewPassword: setNewPasswordAPI } = useAuth();

  // Guardar el correo para reenvío
  const [correoGuardado, setCorreoGuardado] = useState('');

  // Handlers
  const handleCorreo = async (data) => {
    setLoading(true);
    setMessage('');
    setCorreoGuardado(data.correo); // Guardar correo al enviar
    const result = await requestPasswordRecovery(data.correo);
    setMessage(result.message);
    setLoading(false);
    if (result.message && result.message.includes('enviado')) setStep(2);
  };

  // Nuevo handler para reenviar código
  const handleReenviarCodigo = async () => {
    if (!correoGuardado) return;
    setLoading(true);
    setMessage('');
    const result = await requestPasswordRecovery(correoGuardado);
    setMessage(result.message);
    setLoading(false);
  };

  const handleCode = async (data) => {
    setLoading(true);
    setMessage('');
    const result = await verifyRecoveryCode(data.code);
    setMessage(result.message);
    setLoading(false);
    if (result.message && result.message.includes('verificado')) setStep(3);
  };

  const handleNewPassword = async (data) => {
    setLoading(true);
    setMessage('');
    // Validación: no permitir que la nueva contraseña sea igual a la anterior
    if (data.newPassword === data.oldPassword) {
      setMessage('La nueva contraseña no puede ser igual a la anterior.');
      setLoading(false);
      return { success: false };
    }
    const result = await setNewPasswordAPI(data.newPassword);
    setMessage(result.message);
    setLoading(false);
    if (result.message && result.message.includes('actualizada')) {
      return { success: true };
    }
    return { success: false };
  };

  // Resetear todos los formularios
  const resetAll = () => {
    correoForm.reset();
    codeForm.reset();
    newPasswordForm.reset();
  };

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
