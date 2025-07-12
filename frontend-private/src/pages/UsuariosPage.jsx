import React, { useState } from 'react';
import { useEmpleados } from '../hooks/useEmpleados';
import { useClientes } from '../hooks/useClientes';
import EmpleadoForm from '../components/EmpleadoForm';
import EmpleadoCard from '../components/EmpleadoCard';
import ClienteForm from '../components/ClienteForm';
import ClienteCard from '../components/ClienteCard';
import { Plus, User, Menu, X } from 'lucide-react';
import './UsuariosPage.css';

const UsuariosPage = () => {
  const [activeTab, setActiveTab] = useState('empleados');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showForm, setShowForm] = useState(false);

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
    }
    return result;
  };

  const handleUpdateEmpleado = async (empleadoData) => {
    const result = await updateEmpleado(selectedUser._id, empleadoData);
    if (result.success) {
      setShowForm(false);
      setSelectedUser(null);
    }
    return result;
  };

  const handleCreateCliente = async (clienteData) => {
    const result = await createCliente(clienteData);
    if (result.success) {
      setShowForm(false);
    }
    return result;
  };

  const handleUpdateCliente = async (clienteData) => {
    const result = await updateCliente(selectedUser._id, clienteData);
    if (result.success) {
      setShowForm(false);
      setSelectedUser(null);
    }
    return result;
  };

  const handleDelete = async (id) => {
    if (activeTab === 'empleados') {
      const result = await deleteEmpleado(id);
      if (result.success) {
        setShowForm(false);
        setSelectedUser(null);
      }
      return result;
    } else {
      const result = await deleteCliente(id);
      if (result.success) {
        setShowForm(false);
        setSelectedUser(null);
      }
      return result;
    }
  };

  const currentUsers = activeTab === 'empleados' ? empleados : clientes;
  const loading = empleadosLoading || clientesLoading;
  const error = empleadosError || clientesError;

  return (
    <div className="usuarios-fullscreen">
      <div className="usuarios-header">
        <div className="usuarios-header-left">
          <Menu className="usuarios-menu-icon" />
          <span className="usuarios-title">Usuarios</span>
        </div>
      </div>

      <div className="usuarios-tabs-container">
        <div className="usuarios-tabs">
          <button
            onClick={() => {
              setActiveTab('empleados');
              setShowForm(false);
              setSelectedUser(null);
            }}
            className={`usuarios-tab ${activeTab === 'empleados' ? 'active' : ''}`}
          >
            Empleados ({empleados.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('clientes');
              setShowForm(false);
              setSelectedUser(null);
            }}
            className={`usuarios-tab ${activeTab === 'clientes' ? 'active' : ''}`}
          >
            Clientes ({clientes.length})
          </button>
        </div>
      </div>

      <div className="usuarios-add-container">
        <button className="usuarios-add-btn" onClick={handleAddNew}>
          <Plus className="usuarios-add-icon" />
          <span>Agregar nuevo {activeTab === 'empleados' ? 'Empleado' : 'Cliente'}</span>
        </button>
      </div>

      <div className="usuarios-content">
        {error && (
          <div className="usuarios-error">
            <p>Error: {error}</p>
          </div>
        )}

        {activeTab === 'empleados' ? (
          <div className="usuarios-grid">
            {empleados.map((empleado) => (
              <EmpleadoCard
                key={empleado._id}
                empleado={empleado}
                onEdit={handleUserSelect}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="usuarios-grid">
            {clientes.map((cliente) => (
              <ClienteCard
                key={cliente._id}
                cliente={cliente}
                onEdit={handleUserSelect}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {currentUsers.length === 0 && !loading && !error && (
          <div className="usuarios-empty">
            <div className="usuarios-empty-icon">
              <User className="usuarios-empty-icon-svg" />
            </div>
            <h3 className="usuarios-empty-title">
              No hay {activeTab === 'empleados' ? 'empleados' : 'clientes'} registrados
            </h3>
            <p className="usuarios-empty-message">
              {activeTab === 'empleados' 
                ? 'Comienza agregando tu primer empleado al sistema'
                : 'Comienza agregando tu primer cliente al sistema'
              }
            </p>
            <button className="usuarios-empty-btn" onClick={handleAddNew}>
              <Plus className="usuarios-empty-btn-icon" />
              Agregar Primer {activeTab === 'empleados' ? 'Empleado' : 'Cliente'}
            </button>
          </div>
        )}

        {loading && (
          <div className="usuarios-empty">
            <div className="usuarios-empty-icon">
              <User className="usuarios-empty-icon-svg" />
            </div>
            <h3 className="usuarios-empty-title">Cargando...</h3>
            <p className="usuarios-empty-message">
              Obteniendo {activeTab === 'empleados' ? 'empleados' : 'clientes'}...
            </p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="usuarios-modal-overlay" onClick={handleCloseForm}>
          <div className="usuarios-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="usuarios-modal-header">
              <h2 className="usuarios-modal-title">
                {selectedUser 
                  ? `Editar ${activeTab === 'empleados' ? 'Empleado' : 'Cliente'}`
                  : `Agregar ${activeTab === 'empleados' ? 'Empleado' : 'Cliente'}`
                }
              </h2>
              <button onClick={handleCloseForm} className="usuarios-modal-close">
                <X className="usuarios-modal-close-icon" />
              </button>
            </div>
            {activeTab === 'empleados' ? (
              <EmpleadoForm
                empleado={selectedUser}
                onSubmit={selectedUser ? handleUpdateEmpleado : handleCreateEmpleado}
                onClose={handleCloseForm}
                onDelete={handleDelete}
                loading={loading}
              />
            ) : (
              <ClienteForm
                cliente={selectedUser}
                onSubmit={selectedUser ? handleUpdateCliente : handleCreateCliente}
                onClose={handleCloseForm}
                onDelete={handleDelete}
                loading={loading}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPage;