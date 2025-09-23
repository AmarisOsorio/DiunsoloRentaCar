/**
 * SuccesLogout Component
 * 
 * Modal que muestra una animación y mensaje de confirmación
 * cuando el usuario ha cerrado sesión exitosamente.
 * Utiliza una animación Lottie para mejorar la experiencia visual.
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del modal
 */

import React from 'react';
<<<<<<< HEAD
import { Modal, View, Text, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';

export default function SuccesLogout({ visible }) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
        >
            <View style={styles.modalOverlay}>
                <View style={styles.logoutAnimContainer}>
                    <LottieView
                        source={require('../../../assets/Animations/Logout.json')}
                        autoPlay
                        loop={false}
                        style={{ width: 220, height: 220, marginBottom: 10 }}
                    />
                    <Text style={styles.logoutAnimTitle}>¡Hasta pronto!</Text>
                    <Text style={styles.logoutAnimText}>Tu sesión se ha cerrado</Text>
                </View>
            </View>
        </Modal>
    );
=======
import { Modal, View, Text, StyleSheet, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import WebLottie from 'lottie-react';

export default function SuccesLogout({ visible }) {
	return (
		<Modal
			visible={visible}
			transparent
			animationType="fade"
		>
			<View style={styles.overlay}>
				<View style={styles.logoutAnimContainer}>
					{Platform.OS === 'web' ? (
						<WebLottie
							animationData={require('../../../assets/Animations/Logout.json')}
							autoPlay
							loop={false}
							style={{ width: 220, height: 220, marginBottom: 10 }}
						/>
					) : (
						<LottieView
							source={require('../../../assets/Animations/Logout.json')}
							autoPlay
							loop={false}
							style={{ width: 220, height: 220, marginBottom: 10 }}
						/>
					)}
					<Text style={styles.logoutAnimTitle}>¡Hasta pronto!</Text>
					<Text style={styles.logoutAnimText}>Tu sesión se ha cerrado</Text>
				</View>
			</View>
		</Modal>
	);
>>>>>>> 2c830f7d0232ead70791aff6968a0e95ce850767
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(21, 58, 139, 0.25)', // Fondo azul oscuro semi-transparente
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoutAnimContainer: {
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingVertical: 32,
        paddingHorizontal: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    logoutAnimTitle: {
        color: '#153A8B',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 4,
        textAlign: 'center',
    },
    logoutAnimText: {
        color: '#153A8B',
        fontSize: 16,
        textAlign: 'center',
    },
});