import React, { useState, useEffect, useCallback } from 'react';
// import { useAdminAuth } from '../../hooks/admin/useAdminAuth';
// import { useVehicles } from '../../hooks/admin/useVehicles';
import VehicleCard from '../../components/admin/VehicleCard';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import VehicleFormModal from '../../components/admin/VehicleFormModal';
import VehicleDetailsModal from '../../components/admin/VehicleDetailsModal';
import './styles/AdminPage.css';
import './styles/AdminVehicles.css';
import { FaCar, FaPlus, FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

const AdminVehicles = () => {
  // Comentado temporalmente para testing
  // const isAuthorized = useAdminAuth();
  const isAuthorized = true; // Temporal para debug
  
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
      console.log('Updating vehicle status:', id, newStatus);
      const response = await fetch(`/api/vehicles/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: newStatus })
      });

      if (!response.ok) {
        throw new Error('Error al actualizar el estado del vehículo');
      }

      const updatedVehicle = await response.json();
      console.log('Vehicle status updated:', updatedVehicle);
      
      // Actualizar la lista local
      setVehicles(prev => prev.map(v => 
        v._id === id ? { ...v, estado: newStatus } : v
      ));
      
      return { success: true };
    } catch (error) {
      console.error('Error updating vehicle status:', error);
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

  const handleEditVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowFormModal(true);
  };

  const handleViewVehicle = (vehicle) => {
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
        setShowDeleteModal(false);
        setVehicleToDelete(null);
      } else {
        alert(result.error || 'Error al eliminar el vehículo');
      }
    }
  };

  const handleVehicleSuccess = useCallback((savedVehicle) => {
    fetchVehicles();
    alert(`Vehículo ${savedVehicle.nombreVehiculo} ${selectedVehicle ? 'actualizado' : 'creado'} exitosamente`);
  }, [fetchVehicles, selectedVehicle]);

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
      </div>
    </div>
  );
};

export default AdminVehicles;
