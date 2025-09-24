import { useState } from 'react';
import { Platform, Alert } from 'react-native';
import { useAuth } from '../../../Context/AuthContext';

const useForgotPassScreen = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [formData, setFormData] = useState({
        email: '',
        code: '',
        newPassword: '',
        confirmPassword: ''
    });

    const { requestPasswordRecovery, verifyRecoveryCode, setNewPassword } = useAuth();

    const updateFormData = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (error) setError('');
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const requestCode = async () => {
        if (!formData.email.trim()) {
            setError('Por favor ingresa tu correo electrónico');
            return false;
        }

        if (!validateEmail(formData.email)) {
            setError('Por favor ingresa un correo electrónico válido');
            return false;
        }

        setLoading(true);
        setError('');

        const result = await requestPasswordRecovery(formData.email);

        if (result.message === 'Usuario no encontrado') {
            setError('No se encontró una cuenta con este correo electrónico');
            setLoading(false);
            return false;
        } else if (result.message && result.message.includes('enviado')) {
            setCurrentStep(2);
            Alert.alert(
                'Código enviado',
                'Se ha enviado un código de verificación a tu correo electrónico.'
            );
            setLoading(false);
            return true;
        } else {
            setError(result.message || 'Error al enviar el código');
            setLoading(false);
            return false;
        }
    };

    const verifyCode = async () => {
        if (!formData.code.trim()) {
            setError('Por favor ingresa el código de verificación');
            return false;
        }

        if (formData.code.length < 4) {
            setError('El código debe tener al menos 4 dígitos');
            return false;
        }

        setLoading(true);
        setError('');

        try {
            const result = await verifyRecoveryCode(formData.code);

            if (result.message === 'Código inválido') {
                setError('El código ingresado es incorrecto');
                setLoading(false);
                return false;
            } else if (result.message === 'Token de recuperación no proporcionado o expirado.') {
                setError('El código ha expirado. Por favor solicita uno nuevo');
                setCurrentStep(1);
                setLoading(false);
                return false;
            } else {
                setCurrentStep(3);
                setLoading(false);
                return true;
            }
        } catch (error) {
            setError('Error de conexión');
            setLoading(false);
            return false;
        }
    };

    const resetPassword = async () => {
        if (!formData.newPassword.trim() || !formData.confirmPassword.trim()) {
            setError('Por favor completa ambos campos de contraseña');
            return false;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }

        if (formData.newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        setLoading(true);
        setError('');

        const result = await setNewPassword(formData.newPassword);

        if (result.message === 'La nueva contraseña no puede ser igual a la anterior.') {
            setError('La nueva contraseña no puede ser igual a la anterior');
            setLoading(false);
            return false;
        } else if (result.message === 'Código no verificado') {
            setError('Sesión expirada. Por favor reinicia el proceso');
            setCurrentStep(1);
            setLoading(false);
            return false;
        } else if (result.message === 'Token de recuperación no proporcionado o expirado.') {
            setError('Sesión expirada. Por favor reinicia el proceso');
            setCurrentStep(1);
            setLoading(false);
            return false;
        } else if (result.message && !result.message.includes('Error')) {
            Alert.alert(
                'Contraseña actualizada',
                'Tu contraseña ha sido actualizada exitosamente.',
                [{ text: 'OK' }]
            );
            setLoading(false);
            return true;
        } else {
            setError(result.message);
            setLoading(false);
            return false;
        }
    };

    const resetForm = () => {
        setFormData({
            email: '',
            code: '',
            newPassword: '',
            confirmPassword: ''
        });
        setCurrentStep(1);
        setError('');
        setLoading(false);
    };

    return {
        currentStep,
        setCurrentStep,
        loading,
        error,
        formData,
        updateFormData,
        requestCode,
        verifyCode,
        resetPassword,
        resetForm
    };
};

export default useForgotPassScreen;