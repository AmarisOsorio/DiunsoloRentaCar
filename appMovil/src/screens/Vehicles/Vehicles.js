// Importaciones principales de React y componentes de React Native
import React, { useRef, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { Animated, ActivityIndicator, StatusBar } from 'react-native';
import { View, Text, TextInput, ScrollView, Image, TouchableOpacity, FlatList, StyleSheet, Platform } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
// Hook personalizado para lógica de vehículos
import useVehicles from './Hooks/useVehicles';
// Componentes de Vehicles
import FilterState from './Components/FilterState';
import BrandLogo from './Components/BrandLogo';
import MemoizedVehicleCard from './Components/MemoizedVehicleCard';

// Componente principal de la pantalla de gestión de vehículos
export default function Vehicles() {
	const navigation = useNavigation();
	// Extrae datos y funciones del hook personalizado
	const {
		brands, // Lista de marcas
		filteredVehicles, // Lista filtrada según búsqueda, marca y estado
		selectedBrands, // Marcas seleccionadas
		search, // Texto de búsqueda
		setSearch, // Setter para búsqueda
		handleBrandSelect, // Función para seleccionar marca
		statusFilter, // Estado actual del filtro de estado
		setStatusFilter, // Setter para filtro de estado
		loading // Estado de carga (debe estar en el hook useVehicles)
	} = useVehicles();

	// Estado local para el input de búsqueda
	const [searchInput, setSearchInput] = useState(search || "");

	// Estado para mostrar/ocultar el submenú de filtro y su posición
	const [submenuVisible, setSubmenuVisible] = useState(false);
	const [submenuPos] = useState({ x: 250, y: 80 }); // posición fija para todos

	// Handler para agregar vehículo (navega a NewVehicle)
	const handleAddVehicle = () => {
		navigation.navigate('NewVehicle');
	};

	const handleVehiclePress = (vehicle) => {
		navigation.navigate('VehicleDetails', { vehicleId: vehicle._id });
	};

	// Render principal de la pantalla
	return (
		<View style={styles.screen}>
			<StatusBar 
				backgroundColor="#3D83D2" 
				barStyle="light-content" 
				translucent={false}
				animated={true}
			/>
			{/* Cabecera azul con título y buscador */}
			<View style={styles.headerContainer}>
				<Text style={styles.header}>Gestiona tu flota.</Text>
				{/* Buscador y botón de filtro (estilo moderno) */}
				<View style={styles.searchBarRow}>
					<View style={styles.searchInputContainer}>
						<View style={{flex:1, flexDirection:'row', alignItems:'center'}}>
							<TextInput
								style={[
									styles.searchInputModern,
									Platform.OS === 'web' && { outlineStyle: 'none', boxShadow: 'none', background: 'none' }
								]}
								placeholder="Buscar..."
								value={searchInput}
								onChangeText={setSearchInput}
								placeholderTextColor="#7bb0f6"
								selectionColor="#3D83D2"
								underlineColorAndroid="transparent"
								onSubmitEditing={() => setSearch(searchInput)}
								onFocus={e => {
									if (Platform.OS === 'web') {
										e.target.style.outline = 'none';
										e.target.style.boxShadow = 'none';
										e.target.style.background = 'none';
										e.target.style.borderColor = '#7bb0f6';
									}
								}}
								onBlur={e => {
									if (Platform.OS === 'web') {
										e.target.style.borderColor = 'transparent';
									}
								}}
							/>
							<TouchableOpacity
								style={{marginLeft:8, marginRight:8}}
								onPress={() => setSearch(searchInput)}
							>
								<Ionicons name="search" size={26} color="#7bb0f6" />
							</TouchableOpacity>
						</View>
					</View>
					<TouchableOpacity
						style={styles.filterButtonModern}
						onPress={() => setSubmenuVisible(v => !v)}
					>
						<View style={{ width: 38, height: 38, justifyContent: 'center', alignItems: 'center' }}>
							<Ionicons name="filter-outline" size={28} color="#3D83D2" />
						</View>
					</TouchableOpacity>
				</View>
				{/* Carrusel de marcas */}
				   <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.brandScroll} contentContainerStyle={styles.brandScrollContent}>
					   {brands.map(brand => (
						   <BrandLogo
							   key={brand._id}
							   brand={brand}
							   isSelected={selectedBrands.includes(brand._id)}
							   onPress={() => handleBrandSelect(brand._id)}
							   style={styles.brandLogoWrapper}
						   />
					   ))}
					   {/* Botón de tres puntos para ir a Brands */}
					   <TouchableOpacity
						   style={{
							   width: 54,
							   height: 54,
							   borderRadius: 8, // cuadrado con bordes ligeramente redondeados
							   backgroundColor: '#eaf4ff',
							   justifyContent: 'center',
							   alignItems: 'center',
							   marginLeft: 2, // más a la izquierda
							   marginRight: 8, // separa del borde derecho
							   borderWidth: 1.5,
							   borderColor: '#7bb0f6',
						   }}
						   onPress={() => navigation.navigate('Brands')}
					   >
						   <Ionicons name="ellipsis-horizontal" size={32} color="#3D83D2" />
					   </TouchableOpacity>
				   </ScrollView>
			</View>

			{/* Submenú de filtro de estado*/}
			{submenuVisible && (
				<View style={styles.filterAbsoluteContainer} pointerEvents="box-none">
					<FilterState
						visible={submenuVisible}
						onClose={() => setSubmenuVisible(false)}
						current={statusFilter}
						onSelect={value => {
							setStatusFilter(value);
							setSubmenuVisible(false);
						}}
						anchorPosition={submenuPos}
						filters={['Disponible', 'Reservado', 'Mantenimiento']}
					/>
				</View>
			)}

			{/* Cuerpo blanco con lista de vehículos */}
			<View style={styles.bodyContainer}>
				{/* Botón para agregar vehículo */}
				<View style={styles.addButtonRow}>
					<TouchableOpacity style={styles.addButton} onPress={handleAddVehicle}>
						<Text style={styles.addButtonText}>Agregar vehículo  ＋</Text>
					</TouchableOpacity>
				</View>
				{/* Animación de carga o mensaje de no resultados */}
				{loading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color="#3D83D2" />
						<Text style={styles.loadingText}>Cargando vehículos...</Text>
					</View>
				) : filteredVehicles.length === 0 ? (
					<View style={styles.noVehiclesContainer}>
						<View style={styles.noVehiclesIconWrapper}>
							<Ionicons name="car-outline" size={48} color="#7bb0f6" style={{marginBottom: 8}} />
						</View>
						<Text style={styles.noVehiclesTitle}>¡Sin resultados!</Text>
						<Text style={styles.noVehiclesText}>No se encontraron vehículos que coincidan con tu búsqueda o filtros seleccionados.</Text>
					</View>
				) : null}
				{/* Lista de vehículos filtrados */}
				<FlatList
					data={filteredVehicles}
					renderItem={({ item, index }) => (
						<MemoizedVehicleCard 
							item={item} 
							index={index} 
							onPress={() => handleVehiclePress(item)}
						/>
					)}
					keyExtractor={item => item._id}
					contentContainerStyle={styles.vehicleList}
					showsVerticalScrollIndicator={false}
					maxToRenderPerBatch={10}
					windowSize={5}
					removeClippedSubviews={true}
					initialNumToRender={8}
				/>
			</View>
		</View>
	);
}


const styles = StyleSheet.create({
 filterAbsoluteContainer: {
	 position: 'absolute',
	 top: 0,
	 left: 0,
	 right: 0,
	 bottom: 0,
	 zIndex: 102,
	 justifyContent: 'flex-start',
	 alignItems: 'center',
 },

	loadingContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		marginVertical: 40,
		padding: 24,
		backgroundColor: '#f3f8fd',
		borderRadius: 18,
		borderWidth: 1.5,
		borderColor: '#7bb0f6',
		marginHorizontal: 16,
		shadowColor: '#7bb0f6',
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
	},
	loadingText: {
		fontSize: 16,
		color: '#3977ce',
		marginTop: 12,
	},
	noVehiclesContainer: {
		alignItems: 'center',
		justifyContent: 'center',
		marginVertical: 40,
		padding: 24,
		backgroundColor: '#f3f8fd',
		borderRadius: 18,
		borderWidth: 1.5,
		borderColor: '#7bb0f6',
		marginHorizontal: 16,
		shadowColor: '#7bb0f6',
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
	},
	noVehiclesIconWrapper: {
		backgroundColor: '#eaf4ff',
		borderRadius: 32,
		padding: 12,
		marginBottom: 6,
	},
	noVehiclesTitle: {
		fontSize: 22,
		fontWeight: 'bold',
		color: '#3D83D2',
		marginBottom: 4,
	},
	noVehiclesText: {
		fontSize: 15,
		color: '#3977ce',
		textAlign: 'center',
		marginHorizontal: 8,
	},
	searchInputContainer: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 16,
		borderWidth: 2,
		borderColor: '#7bb0f6',
		paddingLeft: 14,
		height: 40,
		marginRight: 10,
	},
	searchIconWrapper: {
		width: 60,
		height: '100%',
		justifyContent: 'center',
		alignItems: 'center',
	},
	divider: {
		width: 1,
		height: 38,
		borderLeftWidth: 1,
		borderLeftColor: '#7bb0f6',
		borderStyle: 'dotted',
		marginHorizontal: 10,
	},
	screen: { flex: 1, backgroundColor: '#3D83D2' },
	headerContainer: {
		backgroundColor: '#3D83D2',
		paddingHorizontal: 0,
		paddingBottom: 20,
		borderBottomLeftRadius: 30,
		borderBottomRightRadius: 30,
		shadowColor: '#000',
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
	},
	header: {
		fontSize: 28,
		fontWeight: 'bold',
		color: '#fff',
		marginLeft: 15,
		marginBottom: 18,
	},
	searchBarRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: 10,
		marginBottom: 8,
	},
	searchInputWrapper: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#fff',
		borderRadius: 14,
		paddingHorizontal: 14,
		height: 48,
		shadowColor: '#000',
		shadowOpacity: 0.04,
		shadowRadius: 4,
		elevation: 1,
	},
	searchIcon: {
		marginRight: 8,
	},
	searchInputModern: {
		flex: 1,
		backgroundColor: 'transparent',
		borderRadius: 8,
		paddingVertical: 0,
		paddingHorizontal: 0,
		fontSize: 22,
		color: '#7bb0f6',
		borderWidth: 0,
		fontWeight: '400',
	},
	filterButtonModern: {
		backgroundColor: '#fff',
		borderRadius: 16,
		borderWidth: 2,
		borderColor: '#7bb0f6',
		width: 40,
		height: 40,
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 0,
	},
	brandScroll: {
		marginTop: 2,
		marginBottom: 2,
		minHeight: 70,
		maxHeight: 70,
		paddingLeft: 10,
	},
	brandScrollContent: {
		alignItems: 'center',
		paddingRight: 20,
	},
	bodyContainer: {
		flex: 1,
		backgroundColor: '#f5f6fa',
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		marginTop: -20,
		paddingHorizontal: 10,
		paddingTop: 18,
	},
	addButtonRow: {
		alignItems: 'flex-end',
		marginBottom: 10,
		marginRight: 6,
	},
	addButton: {
		borderWidth: 2,
		borderColor: '#3977ce',
		backgroundColor: '#fff',
		borderRadius: 12,
		paddingVertical: 6,
		paddingHorizontal: 18,
	},
	addButtonText: {
		color: '#3977ce',
		fontWeight: 'bold',
		fontSize: 16,
	},
	vehicleList: {
		paddingBottom: 20,
	},
	// Los estilos de la card de vehículo han sido eliminados de aquí
});
