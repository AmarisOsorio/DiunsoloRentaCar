import React from 'react';
import { Modal, View, Text, StyleSheet, Platform } from 'react-native';
let LottieView;
if (Platform.OS === 'web') {
	LottieView = require('lottie-react').default;
} else {
	LottieView = require('lottie-react-native');
}

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
						<LottieView
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
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.25)',
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
