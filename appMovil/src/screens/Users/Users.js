import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StatusBar,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../Context/AuthContext'; // Importar el contexto de autenticación
import EmployeeCard from './Employees/components/EmployeeCard';
import ClientCard from './Clients/components/ClientCard';
import AddEmployeeModal from './Employees/modals/AddEmployeeModal';
import AddClientModal from './Clients/modals/AddClientModal';
import EmployeeDetailsModal from './Employees/modals/EmployeeDetailsModal';
import ClientDetailsModal from './Clients/modals/ClientDetailsModal';
// Importar los hooks
import { useFetchEmpleados } from './Employees/hooks/useFetchEmpleados';
import { useFetchClientes } from './Clients/hooks/useFetchClientes';

const { width, height } = Dimensions.get('window');

export default function Usuarios() {
  // Obtener el tipo de usuario del contexto de autenticación
  const { userType } = useAuth();
  
  // Usar solo los hooks useFetch
  const { empleados, addEmpleado, updateEmpleado, loading, error, setError } = useFetchEmpleados();
  const { clientes, addCliente, updateCliente, loading: clientesLoading, error: clientesError, setError: setClientesError } = useFetchClientes();
  
  // Determinar la pestaña inicial basada en el rol del usuario
  const getInitialTab = () => {
    if (userType === 'Empleado') {
      return 'clientes'; // Los empleados solo ven clientes
    }
    return 'empleados'; // Administradores y Gestores ven empleados por defecto
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [modalType, setModalType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleFilter, setShowRoleFilter] = useState(false);
  const [selectedRole, setSelectedRole] = useState('Todos');

  // Lista de roles disponibles para filtrar
  const availableRoles = ['Todos', 'Administrador', 'Gestor', 'Empleado'];

  // Actualizar la pestaña activa cuando cambie el userType
  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [userType]);

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    // Limpiar errores al abrir un modal
    if (type.includes('employee') || type.includes('Employee')) {
      setError && setError(null);
    } else {
      setClientesError && setClientesError(null);
    }
  };

  const closeModal = () => {
    setModalType(null);
    setSelectedUser(null);
    // Limpiar errores al cerrar modales
    setError && setError(null);
    setClientesError && setClientesError(null);
  };

  const handleAddEmployee = async (employeeData) => {
    try {
      await addEmpleado(employeeData);
      closeModal();
    } catch (error) {
      console.error('Error al agregar empleado:', error);
      // El error ya se maneja en el modal AddEmployeeModal
      // No cerramos el modal para que el usuario pueda corregir e intentar de nuevo
    }
  };

  const handleAddClient = async (clientData) => {
    try {
      await addCliente(clientData);
      closeModal();
    } catch (error) {
      console.error('Error al agregar cliente:', error);
      // El error ya se maneja en el modal AddClientModal
      // No cerramos el modal para que el usuario pueda corregir e intentar de nuevo
    }
  };

  const handleUpdateEmployee = async (userData) => {
    try {
      await updateEmpleado(selectedUser.id, userData);
      closeModal();
    } catch (error) {
      console.error('Error al actualizar empleado:', error);
      // El error ya se maneja en el modal EmployeeDetailsModal
    }
  };

  const handleUpdateClient = async (userData) => {
    try {
      await updateCliente(selectedUser.id, userData);
      closeModal();
    } catch (error) {
      console.error('Error al actualizar cliente:', error);
      // El error ya se maneja en el modal ClientDetailsModal
    }
  };

  const filteredUsers = () => {
    let users = activeTab === 'empleados' ? empleados : clientes;
    
    // Aplicar filtro de búsqueda
    if (searchQuery.trim()) {
      users = users.filter(user => {
        if (activeTab === 'empleados') {
          return user.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 (user.rol && user.rol.toLowerCase().includes(searchQuery.toLowerCase()));
        } else {
          // Para clientes, buscar en name, lastName y email
          const fullName = `${user.name || ''} ${user.lastName || ''}`.toLowerCase();
          return fullName.includes(searchQuery.toLowerCase()) ||
                 user.email?.toLowerCase().includes(searchQuery.toLowerCase());
        }
      });
    }

    // Aplicar filtro de rol solo para empleados
    if (activeTab === 'empleados' && selectedRole !== 'Todos') {
      users = users.filter(user => user.rol === selectedRole);
    }
    
    return users;
  };

  const renderUserCards = () => {
    const users = filteredUsers();
    const cards = [];
    
    for (let i = 0; i < users.length; i += 2) {
      cards.push(
        <View key={`row-${i}`} style={styles.cardRow}>
          {activeTab === 'empleados' ? (
            <EmployeeCard
              empleado={users[i]}
              onDetails={() => openModal('employeeDetails', users[i])}
            />
          ) : (
            <ClientCard
              cliente={users[i]}
              onDetails={() => openModal('clientDetails', users[i])}
            />
          )}
          {users[i + 1] && (
            activeTab === 'empleados' ? (
              <EmployeeCard
                empleado={users[i + 1]}
                onDetails={() => openModal('employeeDetails', users[i + 1])}
              />
            ) : (
              <ClientCard
                cliente={users[i + 1]}
                onDetails={() => openModal('clientDetails', users[i + 1])}
              />
            )
          )}
        </View>
      );
    }

    return cards;
  };

  const handleAddUser = () => {
    if (activeTab === 'empleados') {
      openModal('addEmployee');
    } else {
      openModal('addClient');
    }
  };

  const handleRetry = () => {
    // Función para reintentar la carga
    if (activeTab === 'empleados') {
      setError && setError(null);
    } else {
      setClientesError && setClientesError(null);
    }
  };

  const renderError = (errorMessage, isEmployees = true) => {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="warning" size={48} color="#E74C3C" />
        <Text style={styles.errorTitle}>Error de conexión</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.retryButtonText}>Intentar de nuevo</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Función para determinar si se debe mostrar las pestañas
  const shouldShowTabs = () => {
    return userType === 'Administrador' || userType === 'Gestor';
  };

  // Función para renderizar las pestañas solo si corresponde
  const renderTabs = () => {
    if (!shouldShowTabs()) {
      // Si es empleado, no mostrar pestañas ya que solo puede ver clientes
      return null;
    }

    return (
      <View style={styles.tabContainer}>
        <View style={styles.tabWrapper}>
          <TouchableOpacity
            style={[
              styles.tab, 
              activeTab === 'empleados' ? styles.activeTab : styles.inactiveTab
            ]}
            onPress={() => {
              setActiveTab('empleados');
              setSelectedRole('Todos'); // Reset role filter when changing tabs
            }}
          >
            <Text style={[styles.tabText, activeTab === 'empleados' && styles.activeTabText]}>
              Empleados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab, 
              activeTab === 'clientes' ? styles.activeTab : styles.inactiveTab
            ]}
            onPress={() => setActiveTab('clientes')}
          >
            <Text style={[styles.tabText, activeTab === 'clientes' && styles.activeTabText]}>
              Clientes
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Función para renderizar el botón de agregar solo si tiene permisos
  const renderAddButton = () => {
    // Los empleados solo pueden agregar clientes
    const canAddEmployees = userType === 'Administrador' || userType === 'Gestor';
    const canAddClients = userType === 'Administrador' || userType === 'Empleado';
    
    // Si está en la pestaña de empleados pero no puede agregarlos, no mostrar botón
    if (activeTab === 'empleados' && !canAddEmployees) {
      return null;
    }
    
    // Si está en la pestaña de clientes pero no puede agregarlos, no mostrar botón
    if (activeTab === 'clientes' && !canAddClients) {
      return null;
    }

    return (
      <View style={styles.addButtonContainer}>
        <TouchableOpacity
          style={styles.addEmployeeButton}
          onPress={handleAddUser}
        >
          <Text style={styles.addEmployeeText}>
            {activeTab === 'empleados' ? 'Agregar empleado' : 'Agregar cliente'}
          </Text>
          <Ionicons name="add" size={20} color="#5B9BD5" />
        </TouchableOpacity>
      </View>
    );
  };

  // Modal para filtro de roles
  const RoleFilterModal = () => (
    <Modal
      visible={showRoleFilter}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowRoleFilter(false)}
    >
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPress={() => setShowRoleFilter(false)}
      >
        <View style={styles.filterModal}>
          <Text style={styles.filterModalTitle}>Filtrar por rol</Text>
          {availableRoles.map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleOption,
                selectedRole === role && styles.selectedRoleOption
              ]}
              onPress={() => {
                setSelectedRole(role);
                setShowRoleFilter(false);
              }}
            >
              <Text style={[
                styles.roleOptionText,
                selectedRole === role && styles.selectedRoleOptionText
              ]}>
                {role}
              </Text>
              {selectedRole === role && (
                <Ionicons name="checkmark" size={20} color="#5B9BD5" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  if (loading || clientesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#5B9BD5" />
        
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.backButton}>
                <Ionicons name="chevron-back" size={24} color="white" />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>
                {userType === 'Empleado' ? 'Clientes' : 
                 shouldShowTabs() ? (activeTab === 'empleados' ? 'Empleados' : 'Clientes') : 'Clientes'}
              </Text>
            </View>
            <TouchableOpacity style={styles.profileButton}>
              <Ionicons name="person-circle" size={28} color="white" />
            </TouchableOpacity>
          </View>
          <View style={styles.headerCurve} />
        </View>

        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={48} color="#5B9BD5" />
          <Text style={styles.loadingText}>
            {userType === 'Empleado' ? 'Cargando clientes...' : 
             shouldShowTabs() ? (activeTab === 'empleados' ? 'Cargando empleados...' : 'Cargando clientes...') : 'Cargando clientes...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Mostrar error solo si ambos tienen error o si el tab activo tiene error
  const shouldShowError = (activeTab === 'empleados' && error) || (activeTab === 'clientes' && clientesError);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B9BD5" />
      
      <View style={styles.headerContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {userType === 'Empleado' ? 'Clientes' : 
               shouldShowTabs() ? (activeTab === 'empleados' ? 'Empleados' : 'Clientes') : 'Clientes'}
            </Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={28} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerCurve} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Solo mostrar el botón de filtro cuando esté en empleados */}
        {activeTab === 'empleados' && (
          <TouchableOpacity 
            style={[
              styles.menuSearchButton,
              selectedRole !== 'Todos' && styles.filterActiveButton
            ]}
            onPress={() => setShowRoleFilter(true)}
          >
            <Ionicons name="funnel" size={24} color={selectedRole !== 'Todos' ? "#5B9BD5" : "#666"} />
            {selectedRole !== 'Todos' && <View style={styles.filterIndicator} />}
          </TouchableOpacity>
        )}
      </View>

      {/* Mostrar filtro activo para empleados */}
      {activeTab === 'empleados' && selectedRole !== 'Todos' && (
        <View style={styles.activeFilterContainer}>
          <Text style={styles.activeFilterText}>Filtrado por: {selectedRole}</Text>
          <TouchableOpacity 
            style={styles.clearFilterButton}
            onPress={() => setSelectedRole('Todos')}
          >
            <Ionicons name="close" size={16} color="#5B9BD5" />
          </TouchableOpacity>
        </View>
      )}

      {/* Renderizar las pestañas solo si corresponde al rol */}
      {renderTabs()}

      {/* Renderizar el botón de agregar solo si tiene permisos */}
      {renderAddButton()}

      {shouldShowError ? (
        renderError(activeTab === 'empleados' ? error : clientesError, activeTab === 'empleados')
      ) : (
        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.cardsContainer}>
            {filteredUsers().length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons 
                  name={activeTab === 'empleados' ? 'people' : 'person'} 
                  size={64} 
                  color="#CCC" 
                />
                <Text style={styles.emptyTitle}>
                  {searchQuery || selectedRole !== 'Todos' ? 'No se encontraron resultados' : `No hay ${activeTab} registrados`}
                </Text>
                <Text style={styles.emptyText}>
                  {searchQuery || selectedRole !== 'Todos'
                    ? 'Intenta con otros términos de búsqueda o filtros' 
                    : `Agrega tu primer ${activeTab === 'empleados' ? 'empleado' : 'cliente'} usando el botón de arriba`
                  }
                </Text>
              </View>
            ) : (
              renderUserCards()
            )}
          </View>
        </ScrollView>
      )}

      {/* Modal de filtro de roles */}
      <RoleFilterModal />

      {/* Modales - Solo mostrar los modales que corresponden al rol del usuario */}
      {modalType === 'addEmployee' && (userType === 'Administrador' || userType === 'Gestor') && (
        <AddEmployeeModal
          visible={true}
          onClose={closeModal}
          onConfirm={handleAddEmployee}
        />
      )}

      {modalType === 'addClient' && (userType === 'Administrador' || userType === 'Empleado') && (
        <AddClientModal
          visible={true}
          onClose={closeModal}
          onConfirm={handleAddClient}
        />
      )}

      {modalType === 'employeeDetails' && (userType === 'Administrador' || userType === 'Gestor') && (
        <EmployeeDetailsModal
          visible={true}
          empleado={selectedUser}
          onClose={closeModal}
          onUpdate={handleUpdateEmployee}
          isEditing={true}
        />
      )}

      {modalType === 'clientDetails' && (
        <ClientDetailsModal
          visible={true}
          cliente={selectedUser}
          onClose={closeModal}
          onUpdate={handleUpdateClient}
          isEditing={true}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5B9BD5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  headerContainer: {
    position: 'relative',
  },
  header: {
    backgroundColor: '#5B9BD5',
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    zIndex: 1,
  },
  headerCurve: {
    height: 20,
    backgroundColor: '#5B9BD5',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginTop: -1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  profileButton: {
    padding: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  menuSearchButton: {
    padding: 4,
    position: 'relative',
  },
  filterActiveButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 8,
  },
  filterIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#5B9BD5',
  },
  activeFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  activeFilterText: {
    fontSize: 14,
    color: '#5B9BD5',
    fontWeight: '500',
  },
  clearFilterButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    borderRadius: 25,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 22,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  inactiveTab: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#5B9BD5',
    fontWeight: '600',
  },
  addButtonContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  addEmployeeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#5B9BD5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  addEmployeeText: {
    color: '#5B9BD5',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  cardsContainer: {
    paddingVertical: 16,
    paddingBottom: 32,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 0,
    gap: 8, // Espacio entre cards como en los bocetos
  },
  // Estilos para el modal de filtro
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterModal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 40,
    minWidth: 250,
    maxHeight: '80%',
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedRoleOption: {
    backgroundColor: '#E3F2FD',
  },
  roleOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedRoleOptionText: {
    color: '#5B9BD5',
    fontWeight: '500',
  },
});