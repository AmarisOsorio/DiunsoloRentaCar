import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SuccessVehicle from './Components/SuccessVehicle';
import useNewVehicle from './Hooks/useNewVehicle';

function NewVehicle({ navigation }) {
	const form = useNewVehicle();
	const { 
		brands, 
		vehicleTypes, 
		statusOptions, 
		mainViewImage, 
		setMainViewImage, 
		sideImage, 
		setSideImage, 
		galleryImages, 
		setGalleryImages, 
		vehicleName, 
		setVehicleName, 
		dailyPrice, 
		setDailyPrice, 
		plate, 
		setPlate, 
		brandId, 
		setBrandId, 
		vehicleClass, 
		setVehicleClass, 
		color, 
		setColor, 
		year, 
		setYear, 
		capacity, 
		setCapacity, 
		model, 
		setModel, 
		engineNumber, 
		setEngineNumber, 
		chassisNumber, 
		setChassisNumber, 
		vinNumber, 
		setVinNumber, 
		status, 
		setStatus, 
		loading, 
		error, 
		success, 
		pickImage, 
		handleSubmit 
	} = form;

	const handleGoBack = () => {
		if (navigation && navigation.goBack) {
			navigation.goBack();
		}
	};

	return (
		<View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
			{/* Header moderno */}
			<View style={styles.headerContainer}>
				<View style={styles.headerCurve}>
					<TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
						<Ionicons name="chevron-back" size={28} color="#fff" />
					</TouchableOpacity>
					<View style={styles.headerTextContainer}>
						<Text style={styles.headerTitle}>Nuevo Vehículo</Text>
						<Text style={styles.headerSubtitle}>Completa la información</Text>
					</View>
				</View>
			</View>

			<ScrollView 
				contentContainerStyle={styles.scrollContent} 
				showsVerticalScrollIndicator={false}
			>
				{/* Sección de imágenes */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Ionicons name="images" size={24} color="#4A90E2" />
						<Text style={styles.sectionTitle}>Imágenes del vehículo</Text>
					</View>
					
					<View style={styles.imageBox}>
						<View style={styles.mainImagesRow}>
							<TouchableOpacity 
								onPress={() => pickImage(setMainViewImage)} 
								style={styles.imagePickerCard}
							>
								{mainViewImage ? (
									<Image 
										source={{ uri: mainViewImage.uri || mainViewImage }} 
										style={styles.mainImage} 
										resizeMode="cover" 
									/>
								) : (
									<View style={styles.imagePlaceholder}>
										<Ionicons name="camera" size={40} color="#CBD5E1" />
										<Text style={styles.imagePlaceholderText}>Vista Principal</Text>
									</View>
								)}
							</TouchableOpacity>

							<TouchableOpacity 
								onPress={() => pickImage(setSideImage)} 
								style={styles.imagePickerCard}
							>
								{sideImage ? (
									<Image 
										source={{ uri: sideImage.uri || sideImage }} 
										style={styles.mainImage} 
										resizeMode="cover" 
									/>
								) : (
									<View style={styles.imagePlaceholder}>
										<Ionicons name="camera" size={40} color="#CBD5E1" />
										<Text style={styles.imagePlaceholderText}>Vista Lateral</Text>
									</View>
								)}
							</TouchableOpacity>
						</View>

						<TouchableOpacity 
							style={styles.galleryButton} 
							onPress={() => pickImage(setGalleryImages, true)}
						>
							<Ionicons name="add-circle" size={24} color="#fff" />
							<Text style={styles.galleryButtonText}>Agregar fotos a galería</Text>
						</TouchableOpacity>

						{galleryImages.length > 0 && (
							<ScrollView 
								horizontal 
								showsHorizontalScrollIndicator={false} 
								style={styles.galleryScroll}
							>
								{galleryImages.map((img, idx) => (
									<Image 
										key={idx} 
										source={{ uri: img.uri || img }} 
										style={styles.galleryImage} 
									/>
								))}
							</ScrollView>
						)}
					</View>
				</View>

				{/* Información básica */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Ionicons name="information-circle" size={24} color="#4A90E2" />
						<Text style={styles.sectionTitle}>Información básica</Text>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.inputLabel}>Nombre del vehículo</Text>
						<TextInput 
							style={styles.input} 
							placeholder="Ej: Toyota Corolla 2024" 
							placeholderTextColor="#94A3B8" 
							value={vehicleName} 
							onChangeText={setVehicleName} 
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.inputLabel}>Precio por día ($)</Text>
						<TextInput 
							style={styles.input} 
							placeholder="0.00" 
							placeholderTextColor="#94A3B8" 
							value={dailyPrice} 
							onChangeText={setDailyPrice} 
							keyboardType="numeric" 
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.inputLabel}>Placa</Text>
						<TextInput 
							style={styles.input} 
							placeholder="ABC-123" 
							placeholderTextColor="#94A3B8" 
							value={plate} 
							onChangeText={setPlate} 
						/>
					</View>

					<View style={styles.row}>
						<View style={styles.halfInput}>
							<Text style={styles.inputLabel}>Marca</Text>
							<View style={styles.pickerContainer}>
								<Picker 
									selectedValue={brandId} 
									onValueChange={setBrandId} 
									style={styles.picker}
								>
									<Picker.Item label="Selecciona..." value="" />
									{brands.map(b => (
										<Picker.Item key={b.value} label={b.label} value={b.value} />
									))}
								</Picker>
							</View>
						</View>

						<View style={styles.halfInput}>
							<Text style={styles.inputLabel}>Tipo</Text>
							<View style={styles.pickerContainer}>
								<Picker 
									selectedValue={vehicleClass} 
									onValueChange={setVehicleClass} 
									style={styles.picker}
								>
									<Picker.Item label="Selecciona..." value="" />
									{vehicleTypes.map(t => (
										<Picker.Item key={t.value} label={t.label} value={t.value} />
									))}
								</Picker>
							</View>
						</View>
					</View>
				</View>

				{/* Especificaciones */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Ionicons name="car-sport" size={24} color="#4A90E2" />
						<Text style={styles.sectionTitle}>Especificaciones</Text>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.inputLabel}>Modelo</Text>
						<TextInput 
							style={styles.input} 
							placeholder="Ej: Corolla XLE" 
							placeholderTextColor="#94A3B8" 
							value={model} 
							onChangeText={setModel} 
						/>
					</View>

					<View style={styles.row}>
						<View style={styles.halfInput}>
							<Text style={styles.inputLabel}>Año</Text>
							<TextInput 
								style={styles.input} 
								placeholder="2024" 
								placeholderTextColor="#94A3B8" 
								value={year} 
								onChangeText={setYear} 
								keyboardType="numeric" 
							/>
						</View>

						<View style={styles.halfInput}>
							<Text style={styles.inputLabel}>Color</Text>
							<TextInput 
								style={styles.input} 
								placeholder="Blanco" 
								placeholderTextColor="#94A3B8" 
								value={color} 
								onChangeText={setColor} 
							/>
						</View>
					</View>

					<View style={styles.row}>
						<View style={styles.halfInput}>
							<Text style={styles.inputLabel}>Capacidad (personas)</Text>
							<TextInput 
								style={styles.input} 
								placeholder="5" 
								placeholderTextColor="#94A3B8" 
								value={capacity} 
								onChangeText={setCapacity} 
								keyboardType="numeric" 
							/>
						</View>

						<View style={styles.halfInput}>
							<Text style={styles.inputLabel}>Estado</Text>
							<View style={styles.pickerContainer}>
								<Picker 
									selectedValue={status} 
									onValueChange={setStatus} 
									style={styles.picker}
								>
									{statusOptions.map(opt => (
										<Picker.Item key={opt.value} label={opt.label} value={opt.value} />
									))}
								</Picker>
							</View>
						</View>
					</View>
				</View>

				{/* Información técnica */}
				<View style={styles.section}>
					<View style={styles.sectionHeader}>
						<Ionicons name="settings" size={24} color="#4A90E2" />
						<Text style={styles.sectionTitle}>Información técnica</Text>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.inputLabel}>Número de motor</Text>
						<TextInput 
							style={styles.input} 
							placeholder="123456789" 
							placeholderTextColor="#94A3B8" 
							value={engineNumber} 
							onChangeText={setEngineNumber} 
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.inputLabel}>Número de chasis</Text>
						<TextInput 
							style={styles.input} 
							placeholder="987654321" 
							placeholderTextColor="#94A3B8" 
							value={chassisNumber} 
							onChangeText={setChassisNumber} 
						/>
					</View>

					<View style={styles.inputGroup}>
						<Text style={styles.inputLabel}>VIN</Text>
						<TextInput 
							style={styles.input} 
							placeholder="1HGBH41JXMN109186" 
							placeholderTextColor="#94A3B8" 
							value={vinNumber} 
							onChangeText={setVinNumber} 
						/>
					</View>
				</View>

				{/* Botón de guardar */}
				<TouchableOpacity 
					style={[styles.saveBtn, loading && styles.saveBtnDisabled]} 
					onPress={handleSubmit} 
					disabled={loading}
				>
					{loading ? (
						<ActivityIndicator color="#fff" size="small" />
					) : (
						<>
							<Ionicons name="checkmark-circle" size={24} color="#fff" />
							<Text style={styles.saveBtnText}>Guardar vehículo</Text>
						</>
					)}
				</TouchableOpacity>

				{error ? (
					<View style={styles.errorContainer}>
						<Ionicons name="alert-circle" size={20} color="#DC2626" />
						<Text style={styles.errorText}>{error}</Text>
					</View>
				) : null}

				<View style={{ height: 40 }} />
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
		backgroundColor: '#4A90E2',
		paddingTop: Platform.OS === 'ios' ? 50 : 30,
		paddingBottom: 30,
		paddingHorizontal: 20,
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
	},
	backButton: {
		marginRight: 16,
		padding: 4,
	},
	headerTextContainer: {
		flex: 1,
	},
	headerTitle: {
		color: '#fff',
		fontSize: 26,
		fontWeight: 'bold',
		letterSpacing: 0.5,
	},
	headerSubtitle: {
		color: 'rgba(255, 255, 255, 0.9)',
		fontSize: 14,
		marginTop: 4,
	},
	scrollContent: {
		padding: 20,
		paddingBottom: 40,
	},
	section: {
		marginBottom: 24,
	},
	sectionHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 16,
	},
	sectionTitle: {
		fontSize: 20,
		fontWeight: '700',
		color: '#1F2937',
		marginLeft: 12,
	},
	imageBox: {
		backgroundColor: '#fff',
		borderRadius: 20,
		padding: 20,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.05,
		shadowRadius: 8,
		elevation: 2,
	},
	mainImagesRow: {
		flexDirection: 'row',
		gap: 16,
		marginBottom: 16,
	},
	imagePickerCard: {
		flex: 1,
		aspectRatio: 1,
		borderRadius: 16,
		overflow: 'hidden',
		backgroundColor: '#F8FAFC',
		borderWidth: 2,
		borderColor: '#E2E8F0',
		borderStyle: 'dashed',
	},
	mainImage: {
		width: '100%',
		height: '100%',
	},
	imagePlaceholder: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	imagePlaceholderText: {
		marginTop: 8,
		fontSize: 14,
		color: '#94A3B8',
		fontWeight: '600',
	},
	galleryButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#4A90E2',
		borderRadius: 12,
		paddingVertical: 14,
		gap: 8,
		shadowColor: '#4A90E2',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 3,
	},
	galleryButtonText: {
		color: '#fff',
		fontWeight: '600',
		fontSize: 16,
	},
	galleryScroll: {
		marginTop: 16,
	},
	galleryImage: {
		width: 80,
		height: 80,
		borderRadius: 12,
		marginRight: 12,
		backgroundColor: '#F8FAFC',
		borderWidth: 1,
		borderColor: '#E2E8F0',
	},
	inputGroup: {
		marginBottom: 16,
	},
	inputLabel: {
		fontSize: 15,
		fontWeight: '600',
		color: '#475569',
		marginBottom: 8,
	},
	input: {
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: 16,
		color: '#1F2937',
		borderWidth: 1,
		borderColor: '#E2E8F0',
	},
	row: {
		flexDirection: 'row',
		gap: 16,
		marginBottom: 16,
	},
	halfInput: {
		flex: 1,
	},
	pickerContainer: {
		backgroundColor: '#fff',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#E2E8F0',
		overflow: 'hidden',
	},
	picker: {
		height: 50,
		color: '#1F2937',
	},
	saveBtn: {
		flexDirection: 'row',
		backgroundColor: '#10B981',
		borderRadius: 16,
		paddingVertical: 18,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 8,
		gap: 12,
		shadowColor: '#10B981',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	saveBtnDisabled: {
		backgroundColor: '#94A3B8',
		shadowOpacity: 0.1,
	},
	saveBtnText: {
		color: '#fff',
		fontWeight: '700',
		fontSize: 18,
	},
	errorContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FEE2E2',
		borderRadius: 12,
		padding: 16,
		marginTop: 16,
		gap: 12,
		borderWidth: 1,
		borderColor: '#FCA5A5',
	},
	errorText: {
		flex: 1,
		color: '#DC2626',
		fontSize: 14,
		fontWeight: '500',
	},
});