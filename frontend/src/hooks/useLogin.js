import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import AccountLogedScreen from '../components/AccountLogedScreen.jsx';

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

  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const toggleShowPassword = () => setShowLoginPassword((v) => !v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login({ correo: email, contraseña: password });
      if (result.needVerification) {
        setShowVerifyModal(true);
        setPendingVerificationEmail(email);
        setPendingVerificationPassword(password);
        setError(result.message || 'Tu cuenta no está verificada. Revisa tu correo.');
        return;
      }
      if (result.message !== 'login exitoso') {
        setError(result.message || 'Error al iniciar sesión');
      } else {
        setShowLogged(true);
        setTimeout(() => {
          setShowLogged(false);
          onClose && onClose();
        }, 2200);
      }
    } catch (err) {
      setError('Error de red o servidor');
    }
  };

  const SuccessScreen = showLogged ? AccountLogedScreen : null;

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
    SuccessScreen,
    showSuccess: showLogged,
    showVerifyModal,
    setShowVerifyModal,
    pendingVerificationEmail,
    pendingVerificationPassword
  };
}
