import React, { useState, useEffect, useCallback } from 'react';
import { useAdminAuth } from '../../hooks/admin/useAdminAuth';
// import { useVehicles } from '../../hooks/admin/useVehicles';
import VehicleCard from '../../components/admin/VehicleCard';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import VehicleFormModal from '../../components/admin/VehicleFormModal';
import VehicleDetailsModal from '../../components/admin/VehicleDetailsModal';
import SuccessCheckAnimation from '../../components/modals/SuccessCheckAnimation';
import './styles/AdminPage.css';
import './styles/AdminVehicles.css';
import { FaCar, FaPlus, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const AdminVehicles = () => {
  // Protección de rutas para administradores
  const isAuthorized = useAdminAuth();
  // const isAuthorized = true; // Temporal para debug
  
  // Hook temporal directo para debug
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVehicles = useCallback(async () => {
    try {
      console.log('Direct fetchVehicles - Starting...');
      setLoading(true);
      setError(null);
      const response = await fetch('/api/vehicles', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Direct fetchVehicles - Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Error al cargar los vehículos');
      }
      
      const data = await response.json();
      console.log('Direct fetchVehicles - Data received:', data);
      console.log('First vehicle marca:', data[0]?.marca);
      setVehicles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      setError('Error al cargar los vehículos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Detectar si viene de un login exitoso (comentado para evitar errores)
  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem('adminJustLoggedIn');
    if (justLoggedIn) {
      // setShowLoginSuccess(true); // Comentado porque la variable no existe
      sessionStorage.removeItem('adminJustLoggedIn');
    }
  }, []);

  const getVehicleById = useCallback(async (id) => {
    try {
      console.log('Getting vehicle by ID:', id);
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al cargar los datos del vehículo');
      }
      
      const vehicleData = await response.json();
      console.log('Vehicle data received:', vehicleData);
      return { success: true, data: vehicleData };
    } catch (err) {
      console.error('Error fetching vehicle by ID:', err);
      return { success: false, error: err.message };
    }
  }, []);

  const deleteVehicle = useCallback(async (id) => {
    try {
      console.log('Deleting vehicle:', id);
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el vehículo');
      }

      console.log('Vehicle deleted successfully');
      
      // Actualizar la lista local
      setVehicles(prev => prev.filter(v => v._id !== id));
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const updateVehicleStatus = useCallback(async (id, newStatus) => {
    try {
      console.log('🔄 Iniciando actualización de estado frontend');
      console.log('📝 Vehicle ID:', id);
      console.log('📝 Tipo de ID:', typeof id);
      console.log('📝 Longitud del ID:', id?.length);
      console.log('📝 Nuevo estado:', newStatus);
      console.log('📝 Tipo de estado:', typeof newStatus);
      
      // Validar que el nuevo estado sea válido
      const validStates = ['Disponible', 'Reservado', 'Mantenimiento'];
      if (!validStates.includes(newStatus)) {
        throw new Error(`Estado inválido: ${newStatus}`);
      }
      
      const url = `/api/vehicles/${id}/status`;
      console.log('📝 URL a llamar:', url);
      
      const requestBody = { estado: newStatus };
      console.log('📝 Body a enviar:', JSON.stringify(requestBody, null, 2));
      
      const response = await fetch(url, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      console.log('📝 Response status:', response.status);
      console.log('📝 Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ Response error data:', errorData);
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Vehicle status updated successfully:', result);
      
      // Actualizar la lista local
      setVehicles(prev => prev.map(v => 
        v._id === id ? { ...v, estado: newStatus } : v
      ));
      
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating vehicle status:', error);
      return { success: false, error: error.message };
    }
  }, []);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [statusLoading, setStatusLoading] = useState(false);
  
  // Estados para el modal de éxito
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successOperation, setSuccessOperation] = useState(null);
  const [successVehicleName, setSuccessVehicleName] = useState('');
  const [successContractsInfo, setSuccessContractsInfo] = useState('');
  
  // Estado para la carga de datos del vehículo en edición
  const [loadingVehicleId, setLoadingVehicleId] = useState(null);

  // Función helper para mostrar animación de éxito
  const showSuccess = useCallback((operation, vehicleName, contractsInfo = '') => {
    setSuccessOperation(operation);
    setSuccessVehicleName(vehicleName);
    setSuccessContractsInfo(contractsInfo);
    setShowSuccessAnimation(true);
  }, []);

  if (!isAuthorized) {
    return (
      <div className="admin-page">
        <div className="admin-page-container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Verificando permisos...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (vehicle.nombreVehiculo || '').toLowerCase().includes(searchTermLower) ||
      (vehicle.marca || '').toLowerCase().includes(searchTermLower) ||
      (vehicle.modelo || '').toLowerCase().includes(searchTermLower) ||
      (vehicle.placa || '').toLowerCase().includes(searchTermLower);

    const isAvailable = vehicle.estado === "Disponible";
    const matchesFilter = 
      filterStatus === 'all' ||
      (filterStatus === 'available' && isAvailable) ||
      (filterStatus === 'unavailable' && !isAvailable);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: vehicles.length,
    available: vehicles.filter(v => v.estado === "Disponible").length,
    unavailable: vehicles.filter(v => v.estado !== "Disponible").length
  };

  const handleCreateVehicle = () => {
    setSelectedVehicle(null);
    setShowFormModal(true);
  };

  const handleEditVehicle = async (vehicle) => {
    setLoadingVehicleId(vehicle._id);
    
    try {
      // Obtener los datos más actualizados del vehículo
      const result = await getVehicleById(vehicle._id);
      
      if (result.success) {
        console.log('Setting vehicle data for edit:', result.data);
        console.log('Vehicle keys:', Object.keys(result.data));
        console.log('Vehicle idMarca:', result.data.idMarca);
        console.log('Vehicle marca:', result.data.marca);
        setSelectedVehicle(result.data);
        setShowFormModal(true);
      } else {
        console.error('Error loading vehicle data:', result.error);
        // Si falla, usar los datos que ya tenemos
        setSelectedVehicle(vehicle);
        setShowFormModal(true);
        alert('No se pudieron cargar los datos más recientes del vehículo, usando datos en caché');
      }
    } catch (error) {
      console.error('Error in handleEditVehicle:', error);
      // Fallback: usar los datos que ya tenemos
      setSelectedVehicle(vehicle);
      setShowFormModal(true);
      alert('Error al cargar los datos del vehículo');
    } finally {
      setLoadingVehicleId(null);
    }
  };

  const handleViewVehicle = (vehicle) => {
    console.log('handleViewVehicle called with:', vehicle);
    console.log('Vehicle keys:', Object.keys(vehicle));
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  const handleDeleteVehicle = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (vehicleToDelete) {
      const result = await deleteVehicle(vehicleToDelete._id);
      if (result.success) {
        const vehicleName = vehicleToDelete.nombreVehiculo;
        setShowDeleteModal(false);
        setVehicleToDelete(null);
        // Mostrar modal de éxito
        showSuccess('delete', vehicleName);
      } else {
        alert(result.error || 'Error al eliminar el vehículo');
      }
    }
  };

  const handleVehicleSuccess = useCallback((savedVehicle, additionalInfo = {}) => {
    fetchVehicles();
    const operation = selectedVehicle ? 'edit' : 'create';
    const vehicleName = savedVehicle.nombreVehiculo;
    
    // Cerrar modal del formulario
    setShowFormModal(false);
    setSelectedVehicle(null);
    
    // Crear mensaje informativo sobre contratos actualizados
    let contractsInfo = '';
    if (additionalInfo.contractsUpdated && additionalInfo.contractsUpdated > 0) {
      contractsInfo = `Se actualizaron ${additionalInfo.contractsUpdated} contrato(s) relacionado(s)`;
      console.log(`ℹ️ Contratos actualizados: ${additionalInfo.contractsUpdated}`);
    }
    
    if (additionalInfo.contractErrors && additionalInfo.contractErrors.length > 0) {
      if (contractsInfo) {
        contractsInfo += `. Errores en ${additionalInfo.contractErrors.length} contrato(s)`;
      } else {
        contractsInfo = `Errores al actualizar ${additionalInfo.contractErrors.length} contrato(s)`;
      }
      console.warn('⚠️ Errores en contratos:', additionalInfo.contractErrors);
    }
    
    // Mostrar modal de éxito con información de contratos
    showSuccess(operation, vehicleName, contractsInfo);
  }, [fetchVehicles, selectedVehicle, showSuccess]);

  const handleToggleStatus = async (vehicleId, newStatus) => {
    setStatusLoading(true);
    const result = await updateVehicleStatus(vehicleId, newStatus);
    setStatusLoading(false);
    
    if (!result.success) {
      alert(result.error || 'Error al actualizar el estado del vehículo');
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-container">
          <div className="admin-vehicles-loading">
            <p>Cargando vehículos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-vehicles-container">
        <header className="admin-vehicles-header">
          <div className="admin-vehicles-title-section">
            <FaCar className="admin-vehicles-icon" />
            <div>
              <h1>Gestión de Vehículos</h1>
              <p>Administra el catálogo de vehículos disponibles</p>
            </div>
          </div>
          <button className="admin-btn-add" onClick={handleCreateVehicle}>
            <FaPlus />
            Añadir Vehículo
          </button>
        </header>

        {error && (
          <div className="admin-vehicles-error">
            {error}
          </div>
        )}

        <div className="admin-vehicles-stats">
          <div className="admin-vehicles-stat">
            <div className="admin-vehicles-stat-number">{stats.total}</div>
            <div className="admin-vehicles-stat-label">Total Vehículos</div>
          </div>
          <div className="admin-vehicles-stat">
            <div className="admin-vehicles-stat-number">{stats.available}</div>
            <div className="admin-vehicles-stat-label">Disponibles</div>
          </div>
          <div className="admin-vehicles-stat">
            <div className="admin-vehicles-stat-number">{stats.unavailable}</div>
            <div className="admin-vehicles-stat-label">No Disponibles</div>
          </div>
        </div>

        <div className="admin-vehicles-controls">
          <div className="admin-vehicles-search">
            <FaSearch className="admin-vehicles-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, marca, modelo o placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="admin-vehicles-search-clear"
                onClick={() => setSearchTerm('')}
                title="Limpiar búsqueda"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <div className="admin-vehicles-filter">
            <FaFilter />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los vehículos</option>
              <option value="available">Solo disponibles</option>
              <option value="unavailable">Solo no disponibles</option>
            </select>
          </div>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="admin-vehicles-empty">
            <FaCar />
            <h3>No se encontraron vehículos</h3>
            <p>
              {searchTerm || filterStatus !== 'all' 
                ? 'No hay vehículos que coincidan con los filtros aplicados.' 
                : 'Aún no tienes vehículos registrados. ¡Añade el primero!'
              }
            </p>
          </div>
        ) : (
          <div className="admin-vehicles-grid">
            {filteredVehicles.map((vehicle) => (
              <VehicleCard
                key={vehicle._id}
                vehicle={vehicle}
                onEdit={handleEditVehicle}
                onDelete={handleDeleteVehicle}
                onView={handleViewVehicle}
                onToggleStatus={handleToggleStatus}
                loading={statusLoading}
                loadingEdit={loadingVehicleId === vehicle._id}
              />
            ))}
          </div>
        )}

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setVehicleToDelete(null);
          }}
          vehicleName={vehicleToDelete?.nombreVehiculo}
        />

        <VehicleFormModal
          isOpen={showFormModal}
          onClose={() => {
            setShowFormModal(false);
            setSelectedVehicle(null);
          }}
          vehicle={selectedVehicle}
          onSuccess={handleVehicleSuccess}
        />

        <VehicleDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedVehicle(null);
          }}
          vehicle={selectedVehicle}
        />

        {showSuccessAnimation && (
          <SuccessCheckAnimation
            operation={successOperation}
            itemName={successVehicleName}
            entityType="vehículo"
            subtitle={successContractsInfo}
            onClose={() => setShowSuccessAnimation(false)}
            duration={4000}
            showClose={true}
          />
        )}
      </div>
    </div>
  );
};

export default AdminVehicles;