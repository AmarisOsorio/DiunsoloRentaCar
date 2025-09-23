import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, TextInput, Animated, ActivityIndicator, Dimensions } from 'react-native';
import { useAuth } from '../../Context/AuthContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import useLogin from './Hooks/useLogin';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LoginScreen({ onLogin }) {
    const navigation = useNavigation();
    
    const tireTopSlide = useRef(new Animated.Value(-200)).current;
    const tireBottomSlide = useRef(new Animated.Value(-200)).current;
    const bottomElementsFade = useRef(new Animated.Value(0)).current;
    const bottomElementsSlide = useRef(new Animated.Value(100)).current;

    // Estados para los inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Custom hook y contexto
    const { loading, error, login: loginRequest, userType, user } = useLogin();
    const { login: authLogin } = useAuth();

    useEffect(() => {
        // Reset animations when component mounts or refocuses
        const resetAnimations = () => {
            tireTopSlide.setValue(-200);
            tireBottomSlide.setValue(-200);
            bottomElementsFade.setValue(0);
            bottomElementsSlide.setValue(100);
            
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
        };

        resetAnimations();
    }, [tireTopSlide, tireBottomSlide, bottomElementsFade, bottomElementsSlide]);

    // Reset animations when screen comes back into focus
    useFocusEffect(
        React.useCallback(() => {
            tireTopSlide.setValue(-200);
            tireBottomSlide.setValue(-200);
            bottomElementsFade.setValue(0);
            bottomElementsSlide.setValue(100);
            
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
        }, [tireTopSlide, tireBottomSlide, bottomElementsFade, bottomElementsSlide])
    );

    // Efecto para manejar login exitoso
    useEffect(() => {
        if (userType && user) {
            authLogin(user, userType);
            if (onLogin) onLogin();
        }
    }, [userType, user, authLogin, onLogin]);

    // Handler para login
    const handleLogin = async () => {
        const success = await loginRequest({ email, password });
        if (success) {
            // El login será manejado por el useEffect anterior
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
                <Image source={require('./assets/Login-Car.png')} style={styles.car} />
            </Animated.View>
            
            <Animated.View style={[styles.formSection, {
                opacity: bottomElementsFade,
                transform: [{ translateY: bottomElementsSlide }]
            }]}>
                <Image source={require('./assets/Login-BG.png')} style={styles.BG} />
                <Text style={styles.title}>Iniciar sesión</Text>
                <View style={styles.inputContainer}>
                    <Image source={require('./assets/Email-Icon.png')} style={styles.icon} />
                    <TextInput
                        placeholder="Correo electrónico"
                        placeholderTextColor="#3571B8"
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                    />
                </View>
                <View style={styles.inputContainer}>
                    <Image source={require('./assets/Password-Icon.png')} style={styles.icon} />
                    <TextInput
                        placeholder="Contraseña"
                        placeholderTextColor="#3571B8"
                        secureTextEntry
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>
                {error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : null}
                <View style={styles.forgotContainer}>
                    <Text style={styles.forgotText}>¿No recuerdas tu contraseña?</Text>
                    <Text style={styles.forgotLink}>Recuperar Contraseña</Text>
                </View>
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                    )}
                </TouchableOpacity>
            </Animated.View>

            {/* Invisible overlay button for "Recuperar Contraseña" */}
            <TouchableOpacity 
                style={styles.forgotOverlayButton}
                onPress={() => navigation.navigate('ForgotPassword')}
                activeOpacity={1}
            >
                <Text style={styles.invisibleText}>Recuperar Contraseña</Text>
            </TouchableOpacity>
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
        pointerEvents: 'box-none', // Allow touches to pass to children
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
        pointerEvents: 'none', // This is key - disable touch on BG
    },
    title: {
        fontSize: 0.018 * screenHeight + 12,
        fontWeight: 'bold',
        color: '#1A237E',
        marginBottom: 0.03 * screenHeight,
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
    errorText: {
        color: 'red',
        marginBottom: 0.01 * screenHeight,
        fontSize: 0.017 * screenHeight + 6,
        textAlign: 'center',
    },
    forgotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 0.022 * screenHeight,
        left: screenWidth * -0.028,
    },
    forgotText: {
        fontSize: 0.012 * screenHeight + 4,
        color: '#757575',
    },
    forgotLink: {
        fontSize: 0.012 * screenHeight + 4,
        color: '#3571B8',
        marginLeft: 0.015 * screenWidth,
        textDecorationLine: 'underline',
    },
    loginButton: {
        backgroundColor: '#1A237E',
        borderRadius: 24,
        paddingVertical: 0.017 * screenHeight,
        paddingHorizontal: 0.08 * screenWidth,
        alignItems: 'center',
        width: '80%',
        marginTop: 0.01 * screenHeight,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 0.018 * screenHeight + 8,
        fontWeight: 'bold',
    },
    forgotOverlayButton: {
        position: 'absolute',
        marginTop: 0.668 * screenHeight,
        right: screenWidth * -0.04,
        paddingVertical: 10,
        paddingHorizontal: 15,
        zIndex: 9999,
        elevation: 9999,
    },
    invisibleText: {
        opacity: 0,
        color: 'white',
        backgroundColor: 'rgba(132, 49, 49, 1), 0, 0, 255',
        padding: 5,
    },
});