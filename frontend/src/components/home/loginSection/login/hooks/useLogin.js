import { useState, useEffect } from 'react';
import { useAuth } from '../../../../../hooks/useAuth';

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
  const [pendingShowVerify, setPendingShowVerify] = useState(false);

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const toggleShowPassword = () => setShowLoginPassword((v) => !v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Asegurar que los datos se envíen en el formato correcto
      const result = await login({ 
        email: email.trim(), 
        password: password 
      });
      
      if (result.needVerification) {
        setError(result.message || 'Tu cuenta no está verificada. Revisa tu correo.');
        setPendingVerificationEmail(email);
        setPendingVerificationPassword(password);
        
        // Generar nuevo token de verificación para este email
        await generateVerificationToken(email);
        
        setShowVerifyModal(true);
        setLoading(false);
        return;
      }
      
      if (result.message !== 'login exitoso') {
        setError(result.message || 'Error al iniciar sesión');
      } else {
        setShowLogged(true);
        setTimeout(() => {
          setShowLogged(false);
          onClose && onClose();
          window.dispatchEvent(new Event('auth-changed'));
          window.location.href = '/';
        }, 2200);
      }
    } catch (err) {
      console.error('Error en handleSubmit:', err);
      setError('Error de red o servidor');
    } finally {
      setLoading(false);
    }
  };

  // Función para generar token de verificación
  const generateVerificationToken = async (userEmail) => {
    try {
      const response = await fetch('/api/login/generateVerificationToken', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail })
      });
      
      if (!response.ok) {
        console.error('Error generando token de verificación:', response.status);
        // Si el endpoint no existe, intentar con el de registro
        await fallbackGenerateToken(userEmail);
      }
    } catch (error) {
      console.error('Error en generateVerificationToken:', error);
      // Fallback al método de registro
      await fallbackGenerateToken(userEmail);
    }
  };

  // Función de respaldo para generar token usando el endpoint de registro
  const fallbackGenerateToken = async (userEmail) => {
    try {
      const response = await fetch('/api/registerClients/resendCodeEmail', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        console.error('Error en fallback generateToken:', response.status);
      }
    } catch (error) {
      console.error('Error en fallbackGenerateToken:', error);
    }
  };

  // useEffect para mostrar verify y quitar loading
  useEffect(() => {
    if (pendingShowVerify) {
      setShowVerifyModal(true);
      setPendingShowVerify(false);
      setLoading(false);
    }
  }, [pendingShowVerify]);

  // Verificar el código y hacer login
  const handleVerifyAndLogin = async (code) => {
    if (!code || code.trim().length === 0) {
      return { message: 'Código de verificación requerido' };
    }

    try {
      console.log('Verificando código:', code);
      
      // Primero verificar el código
      const verifyRes = await fetch('/api/registerClients/verifyCodeEmail', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          verificationCode: code.trim().toUpperCase() 
        })
      });
      
      const verifyData = await verifyRes.json();
      console.log('Respuesta verificación:', verifyData);
      
      if (!verifyRes.ok) {
        console.error('Error en verificación:', verifyRes.status, verifyData);
        return { 
          message: verifyData.message || 'Error verificando el código' 
        };
      }
      
      if (verifyData.message && verifyData.message.toLowerCase().includes('verificado')) {
        // Ahora hacer login automáticamente
        try {
          console.log('Intentando login automático después de verificación');
          const loginResult = await login({ 
            email: pendingVerificationEmail, 
            password: pendingVerificationPassword 
          });
          
          console.log('Resultado login post-verificación:', loginResult);
          
          if (loginResult.message === 'login exitoso') {
            setShowVerifyModal(false);
            setShowLogged(true);
            setTimeout(() => {
              setShowLogged(false);
              window.dispatchEvent(new Event('auth-changed'));
              window.location.href = '/';
            }, 1500);
            return { message: 'Cuenta verificada y sesión iniciada exitosamente' };
          } else {
            // Si el login falla, al menos la cuenta está verificada
            setShowVerifyModal(false);
            setError('');
            return { 
              message: 'Cuenta verificada exitosamente. Por favor inicia sesión nuevamente.' 
            };
          }
        } catch (loginError) {
          console.error('Error en login después de verificación:', loginError);
          setShowVerifyModal(false);
          setError('');
          return { 
            message: 'Cuenta verificada exitosamente. Por favor inicia sesión nuevamente.' 
          };
        }
      }
      
      return verifyData;
    } catch (error) {
      console.error('Error en handleVerifyAndLogin:', error);
      return { message: 'Error de red al verificar el código' };
    }
  };

  // Función para reenviar código de verificación
  const handleResendVerificationCode = async () => {
    try {
      console.log('Reenviando código para:', pendingVerificationEmail);
      
      // Primero intentar generar nuevo token
      await generateVerificationToken(pendingVerificationEmail);
      
      // Luego intentar reenviar
      const res = await fetch('/api/registerClients/resendCodeEmail', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await res.json();
      console.log('Respuesta reenvío:', data);
      
      if (res.ok) {
        return { message: 'Código reenviado exitosamente' };
      } else {
        return { message: data.message || 'Error reenviando el código' };
      }
    } catch (err) {
      console.error('Error reenviando código:', err);
      return { message: 'No se pudo reenviar el código.' };
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
    pendingShowVerify,
    handleVerifyAndLogin,
    handleResendVerificationCode, // Esta función ahora está incluida en el hook
  };
}