import React from 'react';
import { View, Text } from 'react-native';

export default function Brands() {
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f6fa' }}>
			<Text style={{ fontSize: 24, color: '#3D83D2', fontWeight: 'bold' }}>Pantalla de Marcas</Text>
			<Text style={{ fontSize: 16, color: '#3977ce', marginTop: 10 }}>Aquí irá la gestión de marcas.</Text>
		</View>
	);
}


