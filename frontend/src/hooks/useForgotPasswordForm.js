import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { useForgotPassword } from './useForgotPassword';

export function useForgotPasswordForm(onClose) {
  // Formularios
  const correoForm = useForm();
  const codeForm = useForm();
  const newPasswordForm = useForm();

  // Lógica de pasos y mensajes
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Lógica de negocio (puedes adaptar estos handlers a tu backend)
  const { handleCorreo, handleCode, handleNewPassword } = useForgotPassword({
    setStep,
    setLoading,
    setMessage,
    onClose,
    correoForm,
    codeForm,
    newPasswordForm
  });

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
    handleCode,
    handleNewPassword,
    correoForm,
    codeForm,
    newPasswordForm,
    resetAll,
  };
}
