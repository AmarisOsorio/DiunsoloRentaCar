import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EmployeeCard from './Empleados/components/EmployeeCard';
import ClientCard from './Clientes/components/ClientCard';
import AddEmployeeModal from './Empleados/modals/AddEmployeeModal';
import AddClientModal from './Clientes/modals/AddClientModal';
import EmployeeDetailsModal from './Empleados/modals/EmployeeDetailsModal';
import ClientDetailsModal from './Clientes/modals/ClientDetailsModal';
// Importar los hooks
import { useFetchEmpleados } from './Empleados/hooks/useFetchEmpleados';
import { useFetchClientes } from './Clientes/hooks/useFetchClientes';

const { width, height } = Dimensions.get('window');

export default function Usuarios() {
  // Usar solo los hooks useFetch
  const { empleados, addEmpleado, updateEmpleado, loading, error, setError } = useFetchEmpleados();
  const { clientes, addCliente, updateCliente, loading: clientesLoading, error: clientesError, setError: setClientesError } = useFetchClientes();
  
  const [activeTab, setActiveTab] = useState('empleados');
  const [modalType, setModalType] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

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

  if (loading || clientesLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#5B9BD5" />
        
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Usuarios</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={28} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitle}>Conoce a tu equipo.</Text>
        </View>

        <View style={styles.loadingContainer}>
          <Ionicons name="hourglass" size={48} color="#5B9BD5" />
          <Text style={styles.loadingText}>Cargando usuarios...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Mostrar error solo si ambos tienen error o si el tab activo tiene error
  const shouldShowError = (activeTab === 'empleados' && error) || (activeTab === 'clientes' && clientesError);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#5B9BD5" />
      
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Usuarios</Text>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <Ionicons name="person-circle" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.subtitleContainer}>
        <Text style={styles.subtitle}>Conoce a tu equipo.</Text>
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
        <TouchableOpacity style={styles.menuSearchButton}>
          <Ionicons name="menu" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'empleados' && styles.activeTab]}
          onPress={() => setActiveTab('empleados')}
        >
          <Text style={[styles.tabText, activeTab === 'empleados' && styles.activeTabText]}>
            Empleados
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'clientes' && styles.activeTab]}
          onPress={() => setActiveTab('clientes')}
        >
          <Text style={[styles.tabText, activeTab === 'clientes' && styles.activeTabText]}>
            Clientes
          </Text>
        </TouchableOpacity>
      </View>

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
                  {searchQuery ? 'No se encontraron resultados' : `No hay ${activeTab} registrados`}
                </Text>
                <Text style={styles.emptyText}>
                  {searchQuery 
                    ? 'Intenta con otros términos de búsqueda' 
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

      {modalType === 'addEmployee' && (
        <AddEmployeeModal
          visible={true}
          onClose={closeModal}
          onConfirm={handleAddEmployee}
        />
      )}

      {modalType === 'addClient' && (
        <AddClientModal
          visible={true}
          onClose={closeModal}
          onConfirm={handleAddClient}
        />
      )}

      {modalType === 'employeeDetails' && (
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
  header: {
    backgroundColor: '#5B9BD5',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
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
  subtitleContainer: {
    backgroundColor: '#5B9BD5',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subtitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '300',
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
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#5B9BD5',
  },
  tabText: {
    fontSize: 16,
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
  },
});