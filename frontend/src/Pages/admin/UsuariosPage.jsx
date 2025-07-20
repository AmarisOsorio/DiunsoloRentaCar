import React, { useState } from 'react';
import { useEmpleados } from '../../hooks/admin/useEmpleados';
import { useClientes } from '../../hooks/admin/useClientes';
import EmpleadoForm from '../../components/admin/EmpleadoForm';
import EmpleadoCard from '../../components/admin/EmpleadoCard';
import ClienteForm from '../../components/admin/ClienteForm';
import ClienteCard from '../../components/admin/ClienteCard';
import DeleteConfirmModal from '../../components/admin/DeleteConfirmModal';
import SuccessCheckAnimation from '../../components/modals/SuccessCheckAnimation';
import { FaUsers, FaPlus, FaSearch, FaFilter, FaTimes, FaUserTie, FaUser } from 'react-icons/fa';
import './styles/AdminPage.css';
import './UsuariosPage.css';

const UsuariosPage = () => {
  const [activeTab, setActiveTab] = useState('empleados');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [successType, setSuccessType] = useState('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { 
    empleados, 
    loading: empleadosLoading, 
    error: empleadosError, 
    createEmpleado, 
    updateEmpleado, 
    deleteEmpleado 
  } = useEmpleados();

  const { 
    clientes, 
    loading: clientesLoading, 
    error: clientesError, 
    createCliente,
    updateCliente, 
    deleteCliente 
  } = useClientes();

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setShowForm(true);
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedUser(null);
  };

  const handleCreateEmpleado = async (empleadoData) => {
    const result = await createEmpleado(empleadoData);
    if (result.success) {
      setShowForm(false);
      setSuccessMessage('Empleado creado exitosamente');
      setShowSuccessModal(true);
    }
    return result;
  };

  const handleUpdateEmpleado = async (empleadoData) => {
    const result = await updateEmpleado(selectedUser._id, empleadoData);
    if (result.success) {
      setShowForm(false);
      setSelectedUser(null);
      setSuccessMessage('Empleado actualizado exitosamente');
      setSuccessType('edit');
      setShowSuccessAnimation(true);
    }
    return result;
  };

  const handleCreateCliente = async (clienteData) => {
    const result = await createCliente(clienteData);
    if (result.success) {
      setShowForm(false);
      setSuccessMessage('Cliente creado exitosamente');
      setSuccessType('create');
      setShowSuccessAnimation(true);
    }
    return result;
  };

  const handleUpdateCliente = async (clienteData) => {
    const result = await updateCliente(selectedUser._id, clienteData);
    if (result.success) {
      setShowForm(false);
      setSelectedUser(null);
      setSuccessMessage('Cliente actualizado exitosamente');
      setSuccessType('edit');
      setShowSuccessAnimation(true);
    }
    return result;
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    const result = activeTab === 'empleados' 
      ? await deleteEmpleado(userToDelete._id)
      : await deleteCliente(userToDelete._id);

    if (result.success) {
      setShowDeleteModal(false);
      setUserToDelete(null);
      setShowForm(false);
      setSelectedUser(null);
      setSuccessMessage(`${activeTab === 'empleados' ? 'Empleado' : 'Cliente'} eliminado exitosamente`);
      setSuccessType('delete');
      setShowSuccessAnimation(true);
    }
    return result;
  };

  // Filtros y búsqueda
  const currentUsers = activeTab === 'empleados' ? empleados : clientes;
  
  const filteredUsers = currentUsers.filter(user => {
    const matchesSearch = 
      user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.telefono?.includes(searchTerm);

    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'verified' && user.isVerified) ||
      (filterStatus === 'unverified' && !user.isVerified);

    return matchesSearch && matchesFilter;
  });

  // Estadísticas
  const stats = {
    total: currentUsers.length,
    verified: currentUsers.filter(user => user.isVerified).length,
    unverified: currentUsers.filter(user => !user.isVerified).length
  };

  const loading = empleadosLoading || clientesLoading;
  const error = empleadosError || clientesError;

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-page-container">
          <div className="admin-usuarios-loading">
            <p>Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-usuarios-container">
        <header className="admin-usuarios-header">
          <div className="admin-usuarios-title-section">
            <FaUsers className="admin-usuarios-icon" />
            <div>
              <h1>Gestión de Usuarios</h1>
              <p>Administra empleados y clientes del sistema</p>
            </div>
          </div>
          <button className="admin-btn-add" onClick={handleAddNew}>
            <FaPlus />
            Añadir {activeTab === 'empleados' ? 'Empleado' : 'Cliente'}
          </button>
        </header>

        {error && (
          <div className="admin-usuarios-error">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="admin-usuarios-tabs">
          <button
            onClick={() => {
              setActiveTab('empleados');
              setShowForm(false);
              setSelectedUser(null);
              setSearchTerm('');
              setFilterStatus('all');
            }}
            className={`admin-usuarios-tab ${activeTab === 'empleados' ? 'active' : ''}`}
          >
            <FaUserTie />
            Empleados ({empleados.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('clientes');
              setShowForm(false);
              setSelectedUser(null);
              setSearchTerm('');
              setFilterStatus('all');
            }}
            className={`admin-usuarios-tab ${activeTab === 'clientes' ? 'active' : ''}`}
          >
            <FaUser />
            Clientes ({clientes.length})
          </button>
        </div>

        {/* Estadísticas */}
        <div className="admin-usuarios-stats">
          <div className="admin-usuarios-stat">
            <div className="admin-usuarios-stat-number">{stats.total}</div>
            <div className="admin-usuarios-stat-label">Total {activeTab === 'empleados' ? 'Empleados' : 'Clientes'}</div>
          </div>
          <div className="admin-usuarios-stat">
            <div className="admin-usuarios-stat-number">{stats.verified}</div>
            <div className="admin-usuarios-stat-label">Verificados</div>
          </div>
          <div className="admin-usuarios-stat">
            <div className="admin-usuarios-stat-number">{stats.unverified}</div>
            <div className="admin-usuarios-stat-label">Sin Verificar</div>
          </div>
        </div>

        {/* Controles de búsqueda y filtros */}
        <div className="admin-usuarios-controls">
          <div className="admin-usuarios-search">
            <FaSearch className="admin-usuarios-search-icon" />
            <input
              type="text"
              placeholder="Buscar por nombre, apellido, correo o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="admin-usuarios-search-clear"
                onClick={() => setSearchTerm('')}
                title="Limpiar búsqueda"
              >
                <FaTimes />
              </button>
            )}
          </div>
          <div className="admin-usuarios-filter">
            <FaFilter />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">Todos los usuarios</option>
              <option value="verified">Solo verificados</option>
              <option value="unverified">Sin verificar</option>
            </select>
          </div>
        </div>

        {/* Lista de usuarios */}
        {filteredUsers.length === 0 ? (
          <div className="admin-usuarios-empty">
            {activeTab === 'empleados' ? <FaUserTie /> : <FaUser />}
            <h3>No se encontraron {activeTab === 'empleados' ? 'empleados' : 'clientes'}</h3>
            <p>
              {searchTerm || filterStatus !== 'all' 
                ? `No hay ${activeTab === 'empleados' ? 'empleados' : 'clientes'} que coincidan con los filtros aplicados.` 
                : `Aún no tienes ${activeTab === 'empleados' ? 'empleados' : 'clientes'} registrados. ¡Añade el primero!`
              }
            </p>
          </div>
        ) : (
          <div className="admin-usuarios-grid">
            {filteredUsers.map((user) => 
              activeTab === 'empleados' ? (
                <EmpleadoCard
                  key={user._id}
                  empleado={user}
                  onEdit={handleUserSelect}
                  onDelete={handleDeleteClick}
                />
              ) : (
                <ClienteCard
                  key={user._id}
                  cliente={user}
                  onEdit={handleUserSelect}
                  onDelete={handleDeleteClick}
                />
              )
            )}
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          title={`Eliminar ${activeTab === 'empleados' ? 'Empleado' : 'Cliente'}`}
          message={`¿Estás seguro de que deseas eliminar a ${userToDelete?.nombre} ${userToDelete?.apellido}? Esta acción no se puede deshacer.`}
        />

        {/* Animación de éxito */}
        {showSuccessAnimation && (
          <SuccessCheckAnimation
            operation={successType}
            onClose={() => setShowSuccessAnimation(false)}
            entityType={activeTab === 'empleados' ? 'empleado' : 'cliente'}
          />
        )}

        {/* Modal de formulario - Estructura idéntica al de vehículos */}
        {showForm && (
          <div className="modal-overlay" onClick={handleCloseForm}>
            <div className="usuarios-modal-container" onClick={(e) => e.stopPropagation()}>
              <div className="usuarios-modal-header">
                <h2 className="usuarios-modal-title">
                  {activeTab === 'empleados' ? <FaUser /> : <FaUserTie />}
                  {selectedUser 
                    ? `Editar ${activeTab === 'empleados' ? 'Empleado' : 'Cliente'}`
                    : `Crear Nuevo ${activeTab === 'empleados' ? 'Empleado' : 'Cliente'}`
                  }
                </h2>
                <button className="usuarios-modal-close" onClick={handleCloseForm}>
                  <FaTimes className="usuarios-modal-close-icon" />
                </button>
              </div>
              <div className="usuarios-modal-content">
                {activeTab === 'empleados' ? (
                  <EmpleadoForm
                    empleado={selectedUser}
                    onSubmit={selectedUser ? handleUpdateEmpleado : handleCreateEmpleado}
                    onClose={handleCloseForm}
                    onDelete={handleDeleteClick}
                    loading={loading}
                  />
                ) : (
                  <ClienteForm
                    cliente={selectedUser}
                    onSubmit={selectedUser ? handleUpdateCliente : handleCreateCliente}
                    onClose={handleCloseForm}
                    onDelete={handleDeleteClick}
                    loading={loading}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsuariosPage;
