import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';

export default function LoginScreen({ navigation }) {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Selecciona tu tipo de usuario</Text>
			<Button title="Administrador" onPress={() => navigation.replace('AdminTabs')} />
			<View style={{ height: 16 }} />
			<Button title="Gestor" onPress={() => navigation.replace('ManagerTabs')} />
			<View style={{ height: 16 }} />
			<Button title="Empleado" onPress={() => navigation.replace('EmployeeTabs')} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: '#fff',
	},
	title: {
		fontSize: 24,
		marginBottom: 32,
		color: '#1A237E',
		fontWeight: 'bold',
	},
});
