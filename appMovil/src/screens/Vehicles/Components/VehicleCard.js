import React, { useRef, useEffect } from 'react';
import { Animated, View, Text, Image, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function VehicleCard({ item, index }) {
	// Solo animar en el primer render
	const hasAnimated = useRef(false);
	const translateY = useRef(new Animated.Value(40)).current;
	const opacity = useRef(new Animated.Value(0)).current;
	useEffect(() => {
		if (!hasAnimated.current) {
			Animated.parallel([
				Animated.timing(translateY, {
					toValue: 0,
					duration: 420,
					delay: index * 80,
					useNativeDriver: true,
				}),
				Animated.timing(opacity, {
					toValue: 1,
					duration: 420,
					delay: index * 80,
					useNativeDriver: true,
				})
			]).start(() => {
				hasAnimated.current = true;
			});
		} else {
			translateY.setValue(0);
			opacity.setValue(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);
	// Determinar color de fondo del badge según estado
	const badgeBg =
		item.status === 'Disponible' ? { backgroundColor: 'rgba(46,204,113,0.18)' } :
		item.status === 'Reservado' ? { backgroundColor: 'rgba(231,76,60,0.18)' } :
		item.status === 'Mantenimiento' ? { backgroundColor: 'rgba(241,196,15,0.18)' } :
		{};
	return (
		<Animated.View style={[styles.vehicleCardNew, { opacity, transform: [{ translateY }] }]}> 
			{/* Estado en la esquina superior izquierda */}
			<View style={[styles.statusBadgeContainer, badgeBg]}>
				<View style={[styles.statusDotNew, styles[item.status]]} />
				<Text style={[styles.statusBadgeText, styles[item.status+"Text"]]}>{item.status === 'Disponible' ? 'Disponible' : item.status}</Text>
			</View>
			{/* Imagen lateral grande y centrada (sideImage, fallback a mainViewImage) */}
			<View style={styles.vehicleImageContainer}>
				<Image source={{ uri: item.sideImage || item.mainViewImage }} style={styles.vehicleImageFull} resizeMode="cover" />
			</View>
			{/* Info principal */}
			<View style={styles.vehicleInfoRow}>
				<View style={{flex:1}}>
					<Text style={styles.vehicleNameNew}>{item.vehicleName} <Text style={styles.vehicleModelNew}>({item.model})</Text></Text>
					<Text style={styles.vehicleYearNew}>{item.year}</Text>
					<View style={styles.vehicleDetailsRowNew}>
						<Ionicons name="person" size={17} color="#3977ce" style={{marginRight:3}} />
						<Text style={styles.vehicleDetailsNew}>{item.capacity} personas</Text>
						<Ionicons name="car-sport" size={17} color="#3977ce" style={{marginLeft:12, marginRight:3}} />
						<Text style={styles.vehicleDetailsNew}>{item.vehicleClass}</Text>
					</View>
				</View>
				{/* Precio destacado en burbuja */}
				<View style={styles.priceBubble}>
					<Text style={styles.priceLabelNew}>Precio por día</Text>
					<Text style={styles.priceValueNew}>$ {item.dailyPrice?.toFixed(2)}</Text>
				</View>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	vehicleCardNew: {
		backgroundColor: '#fff',
		borderRadius: 24,
		paddingVertical: 18,
		paddingHorizontal: 18,
		marginBottom: 24,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 16,
		elevation: 4,
		position: 'relative',
	},
	statusBadgeContainer: {
		position: 'absolute',
		top: 18,
		left: 18,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#f7f7f7',
		borderRadius: 16,
		paddingHorizontal: 10,
		paddingVertical: 3,
		zIndex: 2,
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowRadius: 2,
		elevation: 1,
	},
	statusDotNew: {
		width: 10,
		height: 10,
		borderRadius: 5,
		marginRight: 6,
	},
	statusBadgeText: {
		fontWeight: 'bold',
		fontSize: 15,
	},
	vehicleImageContainer: {
		width: '100%',
		height: 150,
		borderRadius: 16,
		overflow: 'hidden',
		marginBottom: 10,
	},
	vehicleImageFull: {
		width: '100%',
		height: '100%',
	},
	vehicleInfoRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginTop: 6,
	},
	vehicleNameNew: {
		fontSize: 19,
		fontWeight: 'bold',
		color: '#2d2d2d',
	},
	vehicleModelNew: {
		fontSize: 16,
		color: '#888',
		fontWeight: 'normal',
	},
	vehicleYearNew: {
		fontSize: 15,
		color: '#888',
		marginBottom: 2,
	},
	vehicleDetailsRowNew: {
		flexDirection: 'row',
		gap: 10,
		marginTop: 2,
	},
	vehicleDetailsNew: {
		fontSize: 14,
		color: '#555',
	},
	priceBubble: {
		backgroundColor: '#f7fbff',
		borderColor: '#3D83D2',
		borderWidth: 1.5,
		borderRadius: 16,
		paddingVertical: 8,
		paddingHorizontal: 16,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 10,
		minWidth: 90,
		shadowColor: '#3D83D2',
		shadowOpacity: 0.08,
		shadowRadius: 4,
		elevation: 2,
	},
	priceLabelNew: {
		fontSize: 13,
		color: '#3D83D2',
		fontWeight: 'bold',
	},
	priceValueNew: {
		fontSize: 20,
		color: '#3D83D2',
		fontWeight: 'bold',
	},
	Disponible: { backgroundColor: '#2ecc71' },
	Reservado: { backgroundColor: '#e74c3c' },
	Mantenimiento: { backgroundColor: '#f1c40f' },
	DisponibleText: { color: '#2ecc71' },
	ReservadoText: { color: '#e74c3c' },
	MantenimientoText: { color: '#f1c40f' },
});
