import { useState, useEffect, useRef } from 'react';

const useVerifyAccountModal = (email, onVerify, onResend) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(900); // 15 minutos
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef(Array(6).fill(null));

  useEffect(() => {
    setTimer(900);
    setCanResend(false);
    setError('');
    setSuccess('');
    setCode(['', '', '', '', '', '']);
    setIsVerified(false); // Reinicia el estado al cambiar el email
  }, [email]);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    if (timer === 870) setCanResend(true); // 30s para reenviar
    return () => clearInterval(interval);
  }, [timer]);

  const handleInput = (idx, val) => {
    if (!/^\w?$/.test(val)) return; // Permite letras y números
    const newCode = [...code];
    newCode[idx] = val;
    setCode(newCode);
    setError('');
    if (val && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (!val && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData('text').replace(/[^\w]/g, '').slice(0, 6); // Permite letras y números
    if (paste.length === 6) {
      setCode(paste.split(''));
      setTimeout(() => inputRefs.current[5]?.focus(), 10);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.some(d => d === '')) {
      setError('Completa el código de 6 dígitos.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await onVerify(code.join(''));
      // Considera éxito si success es true, o si el mensaje contiene "exitosamente" o "correo actualizado"
      const msg = result.message ? result.message.toLowerCase() : '';
      if (
        result.success ||
        (msg.includes('exitosamente')) ||
        (msg.includes('correo actualizado'))
      ) {
        setSuccess('¡Cuenta verificada! Redirigiendo...');
        setIsVerified(true); // Marca como verificada
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
    // No limpiar success aquí, para no mostrar el check
    try {
      await onResend();
      setTimer(900);
      setCanResend(false);
      // No usar setSuccess aquí, solo mostrar el toast en el modal
    } catch {
      setError('No se pudo reenviar el código.');
    }
    setLoading(false);
  };

  const formattedTimer = `${String(Math.floor(timer / 60)).padStart(2, '0')}:${String(timer % 60).padStart(2, '0')}`;

  return {
    code,
    setCode,
    handleInput,
    handlePaste,
    handleSubmit,
    handleResend,
    inputRefs,
    timer,
    formattedTimer,
    canResend,
    loading,
    error,
    success,
    isVerified // Exporta el nuevo estado
  };
};

export default useVerifyAccountModal;
