import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

const useVerifyAccountModal = (email, onVerify, onResend) => {
  // RHF para el código de 6 dígitos
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm({
    mode: 'onBlur',
    defaultValues: { code: '' }
  });

  const [timer, setTimer] = useState(900); // 15 minutos
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    setTimer(900);
    setCanResend(false);
    setError('');
    setSuccess('');
    reset({ code: '' });
    setIsVerified(false);
  }, [email, reset]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    if (timer === 870) setCanResend(true); // 30s para reenviar
    return () => clearInterval(interval);
  }, [timer]);

  // Submit usando RHF
  const onSubmit = async ({ code }) => {
    if (!code || code.length !== 6) {
      setError('Completa el código de 6 dígitos.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await onVerify(code);
      if (result.success || (result.message && result.message.toLowerCase().includes('exitosamente'))) {
        setSuccess('¡Cuenta verificada! Redirigiendo...');
        setIsVerified(true);
      } else {
        setError(result.message || 'Código incorrecto o expirado.');
      }
    } catch {
      setError('Error verificando el código.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setLoading(true);
    setError('');
    try {
      await onResend();
      setTimer(900);
      setCanResend(false);
    } catch {
      setError('No se pudo reenviar el código.');
    }
    setLoading(false);
  };

  const formattedTimer = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

  return {
    register,
    handleSubmit,
    setValue,
    watch,
    errors,
    timer,
    formattedTimer,
    canResend,
    loading,
    error,
    setError,
    success,
    isVerified,
    onSubmit,
    handleResend
  };
};

export default useVerifyAccountModal;
