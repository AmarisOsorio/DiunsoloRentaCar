import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SuccessVehicle from './Components/SuccessVehicle';
import useNewVehicle from './Hooks/useNewVehicle';
function NewVehicle({ navigation }) {
	const form = useNewVehicle();
	const { brands, vehicleTypes, statusOptions, mainViewImage, setMainViewImage, sideImage, setSideImage, galleryImages, setGalleryImages, vehicleName, setVehicleName, dailyPrice, setDailyPrice, plate, setPlate, brandId, setBrandId, vehicleClass, setVehicleClass, color, setColor, year, setYear, capacity, setCapacity, model, setModel, engineNumber, setEngineNumber, chassisNumber, setChassisNumber, vinNumber, setVinNumber, status, setStatus, loading, error, success, pickImage, handleSubmit } = form;

	const handleGoBack = () => {
		if (navigation && navigation.goBack) {
			navigation.goBack();
		}
	};

	return (
		<View style={{ flex: 1, backgroundColor: '#f5f6fa' }}>
			<View style={styles.headerContainer}>
				<View style={styles.headerCurve}>
					<TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
						<Ionicons name="chevron-back" size={28} color="#fff" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Añadir vehículo</Text>
				</View>
			</View>
			<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
				{/* Imagen principal y lateral */}
				<View style={styles.imageBox}>
					<View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
						<TouchableOpacity onPress={() => pickImage(setMainViewImage)} style={styles.imagePickerBtn}>
							{mainViewImage ? (
								<Image source={{ uri: mainViewImage.uri || mainViewImage }} style={styles.mainImage} resizeMode="cover" />
							) : (
								<Ionicons name="image-outline" size={70} color="#b3d6fa" />
							)}
							<Text style={styles.imageLabel}>Principal</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={() => pickImage(setSideImage)} style={styles.imagePickerBtn}>
							{sideImage ? (
								<Image source={{ uri: sideImage.uri || sideImage }} style={styles.mainImage} resizeMode="cover" />
							) : (
								<Ionicons name="image-outline" size={70} color="#b3d6fa" />
							)}
							<Text style={styles.imageLabel}>Lateral</Text>
						</TouchableOpacity>
					</View>
					<TouchableOpacity style={styles.uploadBtn} onPress={() => pickImage(setGalleryImages, true)}>
						<Text style={styles.uploadBtnText}>Subir fotos galería</Text>
						<Ionicons name="add" size={20} color="#fff" style={{ marginLeft: 6 }} />
					</TouchableOpacity>
					<ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
						{galleryImages.map((img, idx) => (
							<Image key={idx} source={{ uri: img.uri || img }} style={styles.galleryImage} />
						))}
					</ScrollView>
				</View>

				{/* Formulario */}
				<TextInput style={styles.input} placeholder="Nombre" placeholderTextColor="#7bb0f6" value={vehicleName} onChangeText={setVehicleName} />
				<Text style={styles.sectionTitle}>Información del automóvil</Text>
				<TextInput style={styles.input} placeholder="Precio por día" placeholderTextColor="#7bb0f6" value={dailyPrice} onChangeText={setDailyPrice} keyboardType="numeric" />
				<TextInput style={styles.input} placeholder="Placa" placeholderTextColor="#7bb0f6" value={plate} onChangeText={setPlate} />
				<View style={styles.row}>
					<View style={[styles.input, { flex: 1, marginRight: 6, padding: 0 }]}> 
						<Text style={styles.label}>Marca</Text>
						<Picker selectedValue={brandId} onValueChange={setBrandId} style={styles.picker} dropdownIconColor="#3D83D2">
							<Picker.Item label="Selecciona una marca..." value="" />
							{brands.map(b => (
								<Picker.Item key={b.value} label={b.label} value={b.value} />
							))}
						</Picker>
					</View>
					<View style={[styles.input, { flex: 1, marginLeft: 6, padding: 0 }]}> 
						<Text style={styles.label}>Tipo</Text>
						<Picker selectedValue={vehicleClass} onValueChange={setVehicleClass} style={styles.picker} dropdownIconColor="#3D83D2">
							<Picker.Item label="Selecciona un tipo..." value="" />
							{vehicleTypes.map(t => (
								<Picker.Item key={t.value} label={t.label} value={t.value} />
							))}
						</Picker>
					</View>
				</View>
				<TextInput style={styles.input} placeholder="Modelo" placeholderTextColor="#7bb0f6" value={model} onChangeText={setModel} />
				<View style={styles.row}>
					<TextInput style={[styles.input, { flex: 1, marginRight: 6 }]} placeholder="Año" placeholderTextColor="#7bb0f6" value={year} onChangeText={setYear} keyboardType="numeric" />
					<TextInput style={[styles.input, { flex: 1, marginLeft: 6 }]} placeholder="Color" placeholderTextColor="#7bb0f6" value={color} onChangeText={setColor} />
				</View>
				<View style={styles.row}>
					<TextInput style={[styles.input, { flex: 1, marginRight: 6 }]} placeholder="Capacidad" placeholderTextColor="#7bb0f6" value={capacity} onChangeText={setCapacity} keyboardType="numeric" />
					<TextInput style={[styles.input, { flex: 1, marginLeft: 6 }]} placeholder="Estado" placeholderTextColor="#7bb0f6" value={status} editable={false} />
				</View>
				<View style={styles.row}>
					<TextInput style={[styles.input, { flex: 1, marginRight: 6 }]} placeholder="Motor" placeholderTextColor="#7bb0f6" value={engineNumber} onChangeText={setEngineNumber} />
					<TextInput style={[styles.input, { flex: 1, marginLeft: 6 }]} placeholder="Chasis" placeholderTextColor="#7bb0f6" value={chassisNumber} onChangeText={setChassisNumber} />
				</View>
				<TextInput style={styles.input} placeholder="VIN" placeholderTextColor="#7bb0f6" value={vinNumber} onChangeText={setVinNumber} />
				<View style={styles.row}>
					<Text style={styles.label}>Estado</Text>
					<Picker selectedValue={status} onValueChange={setStatus} style={[styles.picker, { flex: 1 }]} dropdownIconColor="#3D83D2">
						{statusOptions.map(opt => (
							<Picker.Item key={opt.value} label={opt.label} value={opt.value} />
						))}
					</Picker>
				</View>
				<TouchableOpacity style={styles.saveBtn} onPress={handleSubmit} disabled={loading}>
					{loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Guardar vehículo</Text>}
				</TouchableOpacity>
				{error ? <Text style={{ color: 'red', textAlign: 'center', marginBottom: 10 }}>{error}</Text> : null}
			</ScrollView>
			<SuccessVehicle visible={success} />
		</View>
	);
}

export default NewVehicle;

const styles = StyleSheet.create({
	headerContainer: {
		backgroundColor: 'transparent',
	},
	headerCurve: {
		backgroundColor: '#3D83D2',
		height: 80,
		borderBottomLeftRadius: 32,
		borderBottomRightRadius: 32,
		flexDirection: 'row',
		alignItems: 'center',
		paddingTop: Platform.OS === 'ios' ? 44 : 20,
		paddingBottom: 18,
		paddingHorizontal: 12,
		marginBottom: 8,
	},
	backButton: {
		padding: 4,
		marginRight: 8,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 24,
		fontWeight: 'bold',
		letterSpacing: 0.5,
		textAlign: 'center',
		flex: 1,
	},
	scrollContent: {
		padding: 18,
		paddingBottom: 40,
	},
	imageBox: {
		backgroundColor: '#eaf4ff',
		borderRadius: 18,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 18,
		padding: 18,
		minHeight: 180,
	},
	imagePickerBtn: {
		alignItems: 'center',
		marginHorizontal: 10,
	},
	mainImage: {
		width: 90,
		height: 90,
		borderRadius: 12,
		marginBottom: 4,
		backgroundColor: '#fff',
	},
	imageLabel: {
		color: '#3D83D2',
		fontWeight: 'bold',
		fontSize: 13,
		marginTop: 2,
	},
	galleryImage: {
		width: 60,
		height: 60,
		borderRadius: 8,
		marginRight: 8,
		backgroundColor: '#fff',
	},
	uploadBtn: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#3D83D2',
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 18,
		marginTop: 8,
	},
	uploadBtnText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 16,
	},
	input: {
		backgroundColor: '#eaf4ff',
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 10,
		fontSize: 16,
		color: '#3D83D2',
		marginBottom: 12,
		borderWidth: 0,
	},
	sectionTitle: {
		fontSize: 18,
		color: '#3D83D2',
		fontWeight: 'bold',
		marginBottom: 8,
		marginTop: 8,
		textAlign: 'left',
	},
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12,
	},
	label: {
		color: '#3D83D2',
		fontWeight: 'bold',
		fontSize: 14,
		marginBottom: 2,
		marginLeft: 2,
	},
	picker: {
		backgroundColor: 'transparent',
		color: '#3D83D2',
		height: 40,
		width: '100%',
	},
	saveBtn: {
		backgroundColor: '#3D83D2',
		borderRadius: 12,
		paddingVertical: 14,
		alignItems: 'center',
		marginTop: 10,
		marginBottom: 20,
	},
	saveBtnText: {
		color: '#fff',
		fontWeight: 'bold',
		fontSize: 18,
	},
});
