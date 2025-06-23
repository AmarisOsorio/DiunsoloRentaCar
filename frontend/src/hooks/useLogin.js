import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function useLogin(onClose) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLogged, setShowLogged] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [pendingVerificationPassword, setPendingVerificationPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingShowVerify, setPendingShowVerify] = useState(false); // Nuevo estado

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const toggleShowPassword = () => setShowLoginPassword((v) => !v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login({ correo: email, contraseña: password });
      if (result.needVerification) {
        // Cambia el orden: primero activa pendingShowVerify, luego desactiva loading
        setPendingVerificationEmail(email);
        setPendingVerificationPassword(password);
        setError(result.message || 'Tu cuenta no está verificada. Revisa tu correo.');
        setPendingShowVerify(true); // Activa pendingShowVerify inmediatamente
        return;
      }
      if (result.message !== 'login exitoso') {
        setError(result.message || 'Error al iniciar sesión');
      } else {
        setShowLogged(true);
        setTimeout(() => {
          setShowLogged(false);
          onClose && onClose();
        }, 2200); // 3 segundos
      }
    } catch (err) {
      setError('Error de red o servidor');
      setLoading(false);
    } finally {
      // Solo desactiva loading si no se va a mostrar verify
      if (!showVerifyModal && !pendingShowVerify) setLoading(false);
    }
  };

  // Nuevo useEffect para mostrar verify y quitar loading
  useEffect(() => {
    if (pendingShowVerify) {
      setShowVerifyModal(true);
      setPendingShowVerify(false);
      setLoading(false); // Desactiva loading después de mostrar el modal de verificación
    }
  }, [pendingShowVerify]);

  // Nueva función: verificar código y mostrar success
  const handleVerifyAndLogin = async (code) => {
    try {
      const res = await fetch('/api/registerClients/verifyCodeEmail', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationCode: code })
      });
      const data = await res.json();
      if (data.message && data.message.toLowerCase().includes('verificado')) {
        setShowVerifyModal(false); // Cierra el modal de verificación
        setShowLogged(true); // Muestra el modal de éxito
        setTimeout(() => {
          setShowLogged(false);
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
        }, 3500); // 3.5 segundos de éxito
      }
      return data;
    } catch (err) {
      return { message: 'Error verificando el código' };
    }
  };

  return {
    email,
    password,
    error,
    showLoginPassword,
    setEmail: handleEmailChange,
    setPassword: handlePasswordChange,
    toggleShowPassword,
    handleSubmit,
    setError,
    showSuccess: showLogged,
    showVerifyModal,
    setShowVerifyModal,
    pendingVerificationEmail,
    pendingVerificationPassword,
    loading,
    pendingShowVerify, // <-- Exponer este estado
    handleVerifyAndLogin, // <-- Exponer la nueva función
  };
}
