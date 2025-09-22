// Hook personalizado para la lógica de gestión de vehículos
import { useState, useEffect } from 'react';
import { Platform, Alert } from 'react-native';

// URL base de la API del backend
const BASE_URL = 'https://diunsolorentacar.onrender.com';

// Debug logs
console.log('Using BASE_URL:', BASE_URL);

// Hook principal que maneja el estado y lógica de la pantalla de vehículos
export default function useVehicles() {
	// Lista de marcas obtenidas del backend
	const [brands, setBrands] = useState([]);
	// Lista filtrada de vehículos según búsqueda, marca y estado
	const [filteredVehicles, setFilteredVehicles] = useState([]);
	// Marcas seleccionadas para filtrar (array para selección múltiple)
	const [selectedBrands, setSelectedBrands] = useState([]);
	// Texto de búsqueda
	const [search, setSearch] = useState('');
	// Estado del filtro de estado ("Todos", "Disponible", etc)
	const [statusFilter, setStatusFilter] = useState('Todos');
	// Lista completa de vehículos obtenidos del backend (solo uso interno)
	const [vehicles, setVehicles] = useState([]);
	// Estado de carga
	const [loading, setLoading] = useState(true);

	// Al montar el hook, obtener marcas y vehículos del backend
	useEffect(() => {
		setLoading(true);
		Promise.all([fetchBrands(), fetchVehicles()]).finally(() => {
			setTimeout(() => setLoading(false), 400); // Pequeño delay para UX
		});
	}, []);

	// Cada vez que cambian los vehículos, las marcas, la búsqueda o el filtro de estado, recalcular la lista filtrada
	useEffect(() => {
		filterVehicles();
	}, [vehicles, selectedBrands, search, statusFilter]);

	// Obtener marcas desde el backend
	const fetchBrands = async () => {
		try {
			console.log('Fetching brands from:', `${BASE_URL}/api/brands`);
			const res = await fetch(`${BASE_URL}/api/brands`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
			});
			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}
			const data = await res.json();
			console.log('Brands fetched:', data.length);
			setBrands(data);
		} catch (e) {
			console.error('Error loading brands:', e);
			setBrands([]);
			Alert.alert(
				'Error',
				'No se pudieron cargar las marcas. Por favor, intenta de nuevo.'
			);
			throw e;
		}
	};

	// Obtener vehículos desde el backend
	const fetchVehicles = async () => {
		try {
			console.log('Fetching vehicles from:', `${BASE_URL}/api/vehicles`);
			const res = await fetch(`${BASE_URL}/api/vehicles`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
			});
			if (!res.ok) {
				throw new Error(`HTTP error! status: ${res.status}`);
			}
			const data = await res.json();
			console.log('Vehicles fetched:', data.length);
			setVehicles(data);
		} catch (e) {
			console.error('Error loading vehicles:', e);
			setVehicles([]);
			Alert.alert(
				'Error',
				'No se pudieron cargar los vehículos. Por favor, intenta de nuevo.'
			);
		}
	};

	// Filtra la lista de vehículos según las marcas seleccionadas, el texto de búsqueda y el estado
	const filterVehicles = () => {
		let filtered = vehicles;
		// Filtrar por marcas (selección múltiple)
		if (selectedBrands.length > 0) {
			filtered = filtered.filter(v => v.brandId && selectedBrands.includes(v.brandId._id || v.brandId));
		}
		// Filtrar por texto de búsqueda
		if (search) {
			filtered = filtered.filter(v => v.vehicleName.toLowerCase().includes(search.toLowerCase()));
		}
		// Filtrar por estado
		if (statusFilter && statusFilter !== 'Todos') {
			filtered = filtered.filter(v => v.status === statusFilter);
		}
		setFilteredVehicles(filtered);
	};

	// Selecciona o deselecciona una marca para filtrar (selección múltiple)
	const handleBrandSelect = (brandId) => {
		setSelectedBrands(prev =>
			prev.includes(brandId)
				? prev.filter(id => id !== brandId)
				: [...prev, brandId]
		);
	};



       // Estado para animación inicial (debe ser controlado por el componente principal)
       const [hasAnimated, setHasAnimated] = useState(false);

       // Retornar todo lo necesario para la UI: marcas, vehículos filtrados, filtros y handlers
       return {
	       brands,
	       filteredVehicles,
	       selectedBrands,
	       search,
	       setSearch,
	       handleBrandSelect,
	       statusFilter,
	       setStatusFilter,
	       loading,
	       hasAnimated,
	       setHasAnimated
       };
}
