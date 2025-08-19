import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Text, Image, TouchableOpacity, TextInput, Animated, ActivityIndicator } from 'react-native';
import useLogin from './Hooks/useLogin';

export default function LoginScreen({ navigation }) {
    const tireTopSlide = useRef(new Animated.Value(-200)).current;
    const tireBottomSlide = useRef(new Animated.Value(-200)).current;
    const bottomElementsFade = useRef(new Animated.Value(0)).current;
    const bottomElementsSlide = useRef(new Animated.Value(100)).current;

    // Estados para los inputs
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // Custom hook
    const { loading, error, login } = useLogin();

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

    // Handler para login
    const handleLogin = async () => {
        await login({ email, password });
        // Puedes navegar o mostrar mensaje según resultado
        // if (userType) navigation.navigate('Home');
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
                    <Text style={{ color: 'red', marginBottom: 8 }}>{error}</Text>
                ) : null}
                <View style={styles.forgotContainer}>
                    <Text style={styles.forgotText}>¿No recuerdas tu contraseña?</Text>
                    <TouchableOpacity>
                        <Text style={styles.forgotLink}>Recuperar Contraseña</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.loginButtonText}>Iniciar sesión</Text>
                    )}
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
        width: 312,
        height: 103,
        resizeMode: 'contain',
        marginTop: -30,
        left: 13,
        zIndex: 11,
    },
    topSection: {
        backgroundColor: '#3D83D2',
        paddingTop: 60,
        paddingBottom: 20,
        alignItems: 'center',
        position: 'relative',
    },
    tireMarkTop: {
        position: 'absolute',
        top: -165,
        left: 0,
        width: 393,
        height: 325,
        resizeMode: 'contain',
    },
    tireMarkBottom: {
        position: 'absolute',
        top: -50,
        left: 0,
        width: 470,
        height: 400,
        resizeMode: 'contain',
    },
    carSection: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: '100%',
        height: 140,
        marginBottom: 10,
        zIndex: 10,
    },
    car: {
        width: 381,
        height: 286,
        resizeMode: 'contain',
        marginTop: -10,
        left: 20,
        zIndex: 12,
    },
    formSection: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        marginTop: 0,
        paddingHorizontal: 32,
        paddingTop: 32,
        paddingBottom: 24,
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
        top: -325,
        left: 0,
        paddingTop: 32,
        paddingBottom: 100,
        width: 400,
        height: 1000,
        zIndex: -1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#1A237E',
        marginBottom: 24,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1.5,
        borderBottomColor: '#3571B8',
        marginBottom: 18,
        width: '100%',
    },
    icon: {
        width: 18,
        height: 18,
        marginRight: 8,
        tintColor: '#3571B8',
        resizeMode: 'contain',
    },
    input: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: '#3571B8',
    },
    forgotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 18,
    },
    forgotText: {
        fontSize: 12,
        color: '#757575',
    },
    forgotLink: {
        fontSize: 12,
        color: '#3571B8',
        marginLeft: 6,
        textDecorationLine: 'underline',
    },
    loginButton: {
        backgroundColor: '#1A237E',
        borderRadius: 24,
        paddingVertical: 12,
        paddingHorizontal: 32,
        alignItems: 'center',
        width: '100%',
        marginTop: 8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});