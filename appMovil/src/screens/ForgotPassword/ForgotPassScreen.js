import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, TextInput, Animated, ActivityIndicator, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useForgotPassScreen from './Hooks/useForgotPass';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ForgotPassScreen() {
    const navigation = useNavigation();
    
    const {
        currentStep,
        loading,
        error,
        formData,
        updateFormData,
        requestCode,
        verifyCode,
        resetPassword
    } = useForgotPassScreen();
    
    const tireTopSlide = useRef(new Animated.Value(-200)).current;
    const tireBottomSlide = useRef(new Animated.Value(-200)).current;
    const bottomElementsFade = useRef(new Animated.Value(0)).current;
    const bottomElementsSlide = useRef(new Animated.Value(100)).current;

    useEffect(() => {
        setTimeout(() => {
            Animated.parallel([
                Animated.timing(tireTopSlide, {
                    toValue: 0,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(tireBottomSlide, {
                    toValue: 0,
                    duration: 900,
                    useNativeDriver: true,
                }),
                Animated.timing(bottomElementsFade, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(bottomElementsSlide, {
                    toValue: 0,
                    duration: 1200,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 100);
    }, [tireTopSlide, tireBottomSlide, bottomElementsFade, bottomElementsSlide]);

    const handleRequestCode = async () => {
        const success = await requestCode();
        if (!success) return;
    };

    const handleVerifyCode = async () => {
        const success = await verifyCode();
        if (!success) return;
    };

    const handleResetPassword = async () => {
        const success = await resetPassword();
        if (success) {
            navigation.goBack();
        }
    };

    const getTitle = () => {
        switch (currentStep) {
            case 1: return 'Recuperar Contraseña';
            case 2: return 'Recuperación de contraseña';
            case 3: return 'Recuperación de contraseña';
            default: return 'Recuperar Contraseña';
        }
    };

    const getSubtitle = () => {
        switch (currentStep) {
            case 1: return 'Ingresa tu correo electrónico y te enviaremos un código de verificación para reestablecer tu contraseña';
            case 2: return 'Escribe el código enviado.';
            case 3: return 'Escribe tu nueva contraseña';
            default: return '';
        }
    };

    const renderEmailForm = () => (
        <>
            <View style={styles.emailInputContainer}>
                <Image source={require('./assets/Email-Icon.png')} style={styles.emailIcon} />
                <TextInput
                    placeholder="Correo electrónico"
                    placeholderTextColor="#3571B8"
                    style={styles.emailInput}
                    value={formData.email}
                    onChangeText={(text) => updateFormData('email', text)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>
            
            <TouchableOpacity 
                style={styles.sendCodeButton} 
                onPress={handleRequestCode} 
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.sendCodeButtonText}>Enviar Código</Text>
                )}
            </TouchableOpacity>
        </>
    );

    const renderCodeForm = () => (
        <>
            <View style={styles.codeInputContainer}>
                <TextInput
                    placeholder="Código"
                    placeholderTextColor="#3571B8"
                    style={styles.codeInput}
                    value={formData.code}
                    onChangeText={(text) => updateFormData('code', text)}
                    keyboardType="numeric"
                    maxLength={6}
                />
            </View>
            
            <TouchableOpacity 
                style={styles.verifyCodeButton} 
                onPress={handleVerifyCode} 
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.verifyCodeButtonText}>Verificar Código</Text>
                )}
            </TouchableOpacity>
        </>
    );

    const renderPasswordForm = () => (
        <>
            <View style={styles.passwordInputContainer}>
                <TextInput
                    placeholder="Contraseña"
                    placeholderTextColor="#3571B8"
                    style={styles.passwordInput}
                    value={formData.newPassword}
                    onChangeText={(text) => updateFormData('newPassword', text)}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                />
            </View>
            
            <View style={styles.confirmPasswordInputContainer}>
                <TextInput
                    placeholder="Confirmar contraseña"
                    placeholderTextColor="#3571B8"
                    style={styles.confirmPasswordInput}
                    value={formData.confirmPassword}
                    onChangeText={(text) => updateFormData('confirmPassword', text)}
                    secureTextEntry={true}
                    autoCapitalize="none"
                    autoCorrect={false}
                    textContentType="newPassword"
                />
            </View>
            
            <TouchableOpacity 
                style={styles.resetPasswordButton} 
                onPress={handleResetPassword} 
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.resetPasswordButtonText}>Cambiar Contraseña</Text>
                )}
            </TouchableOpacity>
        </>
    );

    const renderForm = () => {
        switch (currentStep) {
            case 1: return renderEmailForm();
            case 2: return renderCodeForm();
            case 3: return renderPasswordForm();
            default: return null;
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topSection}>
                <Animated.Image 
                    source={require('./assets/Tire-BG-Top.png')} 
                    style={[styles.tireMarkTop, { transform: [{ translateY: tireTopSlide }] }]} 
                />
                <Animated.Image 
                    source={require('./assets/Tire-BG-Bottom.png')} 
                    style={[styles.tireMarkBottom, { transform: [{ translateY: tireBottomSlide }] }]} 
                />
            </View>

            <View style={styles.logo}>
                <Image source={require('./assets/Login-Logo.png')} style={styles.logo} />
            </View>

            <Animated.View style={[styles.carSection, { 
                opacity: bottomElementsFade,
                transform: [{ translateY: bottomElementsSlide }]
            }]}>
                <Image source={require('./assets/Forgot-Car.png')} style={styles.car} />
            </Animated.View>
            
            <Animated.View style={[styles.formSection, {
                opacity: bottomElementsFade,
                transform: [{ translateY: bottomElementsSlide }]
            }]}>
                <Image source={require('./assets/Forgot-BG.png')} style={styles.BG} />
                
                <Text style={styles.title}>{getTitle()}</Text>
                
                <Text style={styles.subtitle}>
                    {getSubtitle()}
                </Text>
                
                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : null}
                
                {renderForm()}

                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Volver</Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#3D83D2',
    },
    logo: {
        width: screenWidth * 0.8,
        height: screenWidth * 0.26,
        resizeMode: 'contain',
        marginTop: -0.02 * screenHeight,
        left: 0.06 * screenWidth,
        zIndex: 11,
    },
    topSection: {
        backgroundColor: '#3D83D2',
        paddingTop: 0.08 * screenHeight,
        paddingBottom: 0.025 * screenHeight,
        alignItems: 'center',
        position: 'relative',
    },
    tireMarkTop: {
        position: 'absolute',
        top: -0.22 * screenHeight,
        left: -0.18 * screenWidth,
        width: screenWidth * 1.3,
        height: screenHeight * 0.65,
        resizeMode: 'contain',
    },
    tireMarkBottom: {
        position: 'absolute',
        top: screenHeight * 0.080,
        left: -0.01 * screenWidth,
        width: screenWidth * 1.3,
        height: screenHeight * 0.65,
        resizeMode: 'contain',
    },
    carSection: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
        height: screenHeight * 0.18,
        marginBottom: 0.012 * screenHeight,
        zIndex: 10,
        elevation: 10
    },
    car: {
        width: screenWidth * 1,
        height: screenHeight * 1,
        resizeMode: 'contain',
        marginTop: -0.012 * screenHeight,
        left: 0.05 * screenWidth,
        zIndex: 12,
        elevation: 12
    },
    formSection: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: 0,
        paddingHorizontal: 0.08 * screenWidth,
        paddingTop: 0.04 * screenHeight,
        paddingBottom: 0.03 * screenHeight,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 9,
    },
    BG: {
        position: 'absolute',
        top: -0.39 * screenHeight,
        left: 0,
        paddingTop: 0.04 * screenHeight,
        paddingBottom: 0.13 * screenHeight,
        width: screenWidth,
        height: screenHeight * 1.1,
        zIndex: -1,
    },
    title: {
        fontSize: 0.018 * screenHeight + 12,
        fontWeight: 'bold',
        color: '#1A237E',
        marginBottom: 0.02 * screenHeight,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 0.014 * screenHeight + 6,
        color: '#757575',
        textAlign: 'center',
        marginBottom: 0.03 * screenHeight,
        paddingHorizontal: 0.02 * screenWidth,
        lineHeight: 0.018 * screenHeight + 12,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: '#3571B8',
        marginBottom: 0.022 * screenHeight,
        width: '100%',
    },
    icon: {
        width: 0.045 * screenWidth,
        height: 0.045 * screenWidth,
        marginRight: 0.02 * screenWidth,
        tintColor: '#3571B8',
        resizeMode: 'contain',
    },
    input: {
        flex: 1,
        height: 0.06 * screenHeight,
        fontSize: 0.014 * screenHeight + 8,
        color: '#3571B8',
    },
    // Estilos específicos para el formulario de email
    emailInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: '#3571B8',
        marginBottom: 0.022 * screenHeight,
        width: '100%',
    },
    emailIcon: {
        width: 0.045 * screenWidth,
        height: 0.045 * screenWidth,
        marginRight: 0.02 * screenWidth,
        tintColor: '#3571B8',
        resizeMode: 'contain',
    },
    emailInput: {
        flex: 1,
        height: 0.06 * screenHeight,
        fontSize: 0.014 * screenHeight + 8,
        color: '#3571B8',
    },
    // Estilos específicos para el formulario de código
    codeInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: '#3571B8', // Verde para distinguir
        marginBottom: 0.022 * screenHeight,
        width: '100%',
    },
    codeInput: {
        flex: 1,
        height: 0.06 * screenHeight,
        fontSize: 0.016 * screenHeight + 10,
        color: '#3571B8',
        textAlign: 'center',
        letterSpacing: 2,
    },
    // Estilos específicos para el formulario de contraseñas
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: '#3571B8', // Rojo para distinguir
        marginBottom: 0.022 * screenHeight,
        width: '100%',
    },
    passwordInput: {
        flex: 1,
        height: 0.06 * screenHeight,
        fontSize: 0.014 * screenHeight + 8,
        color: '#3571B8',
    },
    confirmPasswordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: '#3571B8', // Rojo para distinguir
        marginBottom: 0.022 * screenHeight,
        width: '100%',
    },
    confirmPasswordInput: {
        flex: 1,
        height: 0.06 * screenHeight,
        fontSize: 0.014 * screenHeight + 8,
        color: '#3571B8',
    },
    errorText: {
        color: 'red',
        marginBottom: 0.01 * screenHeight,
        fontSize: 0.017 * screenHeight + 6,
        textAlign: 'center',
    },
    // Botón específico para paso 1: Enviar Código
    sendCodeButton: {
        backgroundColor: '#1A237E',
        borderRadius: 24,
        paddingVertical: 0.017 * screenHeight,
        paddingHorizontal: 0.08 * screenWidth,
        alignItems: 'center',
        width: '90%',
        marginTop: 0.02 * screenHeight,
        marginBottom: 0.02 * screenHeight,
    },
    sendCodeButtonText: {
        color: '#fff',
        fontSize: 0.018 * screenHeight + 8,
        fontWeight: 'bold',
    },
    // Botón específico para paso 2: Verificar Código
    verifyCodeButton: {
        backgroundColor: '#1A237E', // Verde para diferenciar
        borderRadius: 24,
        paddingVertical: 0.035 * screenHeight,
        paddingHorizontal: 0.08 * screenWidth,
        alignItems: 'center',
        width: '90%',
        marginTop: 0.02 * screenHeight,
        marginBottom: 0.02 * screenHeight,
    },
    verifyCodeButtonText: {
        color: '#fff',
        fontSize: 0.018 * screenHeight + 8,
        fontWeight: 'bold',
    },
    // Botón específico para paso 3: Cambiar Contraseña
    resetPasswordButton: {
        backgroundColor: '#1A237E', // Rojo para diferenciar
        borderRadius: 24,
        paddingVertical: 0.017 * screenHeight,
        paddingHorizontal: 0.08 * screenWidth,
        alignItems: 'center',
        width: '90%',
        marginTop: 0.02 * screenHeight,
        marginBottom: 0.02 * screenHeight,
    },
    resetPasswordButtonText: {
        color: '#fff',
        fontSize: 0.018 * screenHeight + 8,
        fontWeight: 'bold',
    },
    backButton: {
        marginTop: 0.01 * screenHeight,
        paddingVertical: 0.015 * screenHeight,
    },
    backButtonText: {
        color: '#3571B8',
        fontSize: 0.014 * screenHeight + 6,
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
});