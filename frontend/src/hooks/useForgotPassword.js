import { useAuth } from '../context/AuthContext.jsx';

export function useForgotPassword({ setStep, setMessage, setLoading, onClose }) {
  const { requestPasswordRecovery, verifyRecoveryCode, setNewPassword: setNewPasswordAPI } = useAuth();

  const handleCorreo = async (data) => {
    setLoading(true);
    setMessage('');
    const result = await requestPasswordRecovery(data.correo);
    setMessage(result.message);
    setLoading(false);
    if (result.message && result.message.includes('enviado')) setStep(2);
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
    const result = await setNewPasswordAPI(data.newPassword);
    setMessage(result.message);
    setLoading(false);
    if (result.message && result.message.includes('actualizada')) setTimeout(onClose, 1500);
  };

  return {
    handleCorreo,
    handleCode,
    handleNewPassword,
  };
}
