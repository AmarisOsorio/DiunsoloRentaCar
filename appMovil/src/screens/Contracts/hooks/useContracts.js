import { useState, useEffect, useCallback } from 'react';

// Para emulador Android usa 10.0.2.2 en lugar de localhost
const API_BASE_URL = 'http://10.0.2.2:4000/api';

const useContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Obtener todos los contratos
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('useContracts: Obteniendo contratos...');

      const response = await fetch(`${API_BASE_URL}/contracts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        timeout: 15000,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contractsData = await response.json();

      if (Array.isArray(contractsData)) {
        const validContracts = contractsData.filter(contract =>
          contract._id && contract.reservationId
        );

        setContracts(validContracts);
        console.log('useContracts: Contratos obtenidos:', validContracts.length);
      } else {
        throw new Error('La respuesta del servidor no es un array válido');
      }
    } catch (err) {
      console.error('useContracts: Error fetching contracts:', err);
      let errorMessage = 'Error desconocido';

      if (err.message.includes('Network request failed') || err.message.includes('fetch')) {
        errorMessage = 'No se puede conectar al servidor. Verifica que el backend esté corriendo en ' + API_BASE_URL;
      } else if (err.message.includes('timeout')) {
        errorMessage = 'Tiempo de espera agotado. El servidor tardó demasiado en responder.';
      } else if (err.message.includes('JSON')) {
        errorMessage = 'Error al procesar la respuesta del servidor.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Endpoint no encontrado. Verifica que la ruta /api/contracts esté disponible.';
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setContracts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 🔹 Crear contrato
  const createContract = useCallback(async (contractData) => {
    try {
      setError(null);
      console.log('useContracts: Creando contrato:', contractData);

      if (!contractData.reservationId) {
        throw new Error('ID de reservación es requerido');
      }

      const formattedData = {
        reservationId: contractData.reservationId,
        status: contractData.status || 'Active',
        statusSheetData: contractData.statusSheetData || {},
        leaseData: contractData.leaseData || {},
      };

      const response = await fetch(`${API_BASE_URL}/contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorText = errorData.message || await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.contract) {
        // 🔹 POBLAR LA RESERVA ACTUALIZADA ANTES DE AGREGAR AL STATE
        const populatedContractResponse = await fetch(`${API_BASE_URL}/contracts/${result.contract._id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });

        if (!populatedContractResponse.ok) {
          throw new Error('No se pudo obtener el contrato poblado con la reserva actualizada');
        }

        const populatedContract = await populatedContractResponse.json();

        // 🔹 Agregar al state
        setContracts(prev => [populatedContract, ...prev]);

        console.log('useContracts: Contrato creado con reserva activada:', populatedContract._id);
        return populatedContract;
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('useContracts: Error creating contract:', err);
      setError(err.message);
      throw err;
    }
  }, [fetchContracts]);


  // 🔹 Actualizar contrato
  const updateContract = useCallback(async (id, updateData) => {
    try {
      setError(null);
      console.log('useContracts: Actualizando contrato:', id);

      const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorText = errorData.message || await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.contract) {
        const updatedContract = result.contract;
        setContracts(prev =>
          prev.map(c => (c._id === id ? updatedContract : c))
        );
        console.log('useContracts: Contrato actualizado:', updatedContract._id);
        return updatedContract;
      } else {
        throw new Error(result.message || 'Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('useContracts: Error updating contract:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // 🔹 Eliminar contrato
  const deleteContract = useCallback(async (id) => {
    try {
      setError(null);
      console.log('useContracts: Eliminando contrato:', id);

      const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorText = errorData.message || await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.message) {
        setContracts(prev => prev.filter(c => c._id !== id));
        console.log('useContracts: Contrato eliminado:', id);
        return result;
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('useContracts: Error deleting contract:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // 🔹 Generar PDF
  const generateContractPdf = useCallback(async (id) => {
    try {
      setError(null);
      console.log('useContracts: Generando PDF para contrato:', id);

      const response = await fetch(`${API_BASE_URL}/contracts/${id}/pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorText = errorData.message || await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.message) {
        console.log('useContracts: PDF generado:', result.pdfUrl);
        return result;
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (err) {
      console.error('useContracts: Error generating PDF:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // 🔹 Obtener contratos por estado
  const getContractsByStatus = useCallback((status) => {
    return contracts.filter(contract => contract.status === status);
  }, [contracts]);

  // 🔹 Buscar contratos
  const searchContracts = useCallback((searchTerm) => {
    if (!searchTerm.trim()) return contracts;

    const term = searchTerm.toLowerCase();
    return contracts.filter(contract => {
      // Buscar en datos del cliente
      const clientName = `${contract.reservationId?.clientId?.name || ''} ${contract.reservationId?.clientId?.lastName || ''}`.toLowerCase();

      // Buscar en datos del vehículo
      const vehicleInfo = `${contract.reservationId?.vehicleId?.brand || ''} ${contract.reservationId?.vehicleId?.model || ''} ${contract.reservationId?.vehicleId?.plate || ''}`.toLowerCase();

      // Buscar en ID del contrato
      const contractId = contract._id.toLowerCase();

      return clientName.includes(term) ||
        vehicleInfo.includes(term) ||
        contractId.includes(term);
    });
  }, [contracts]);

  // 🔹 Estadísticas de contratos
  const getContractStats = useCallback(() => {
    const stats = {
      total: contracts.length,
      active: contracts.filter(c => c.status === 'Active').length,
      finished: contracts.filter(c => c.status === 'Finished').length,
      canceled: contracts.filter(c => c.status === 'Canceled').length,
    };

    return stats;
  }, [contracts]);

  // 🔹 Refresh (pull to refresh)
  const refreshContracts = useCallback(() => {
    console.log('useContracts: Pull to refresh');
    setRefreshing(true);
    fetchContracts();
  }, [fetchContracts]);

  // 🔹 Obtener un contrato específico
  const getContract = useCallback(async (id) => {
    try {
      setError(null);
      console.log('useContracts: Obteniendo contrato:', id);

      const response = await fetch(`${API_BASE_URL}/contracts/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorText = errorData.message || await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const contract = await response.json();
      console.log('useContracts: Contrato obtenido:', contract._id);
      return contract;
    } catch (err) {
      console.error('useContracts: Error getting contract:', err);
      setError(err.message);
      throw err;
    }
  }, []);

  // 🔹 Cargar contratos al inicializar el hook
  useEffect(() => {
    fetchContracts();
  }, [fetchContracts]);

  return {
    // Estado
    contracts,
    loading,
    refreshing,
    error,

    // Acciones CRUD
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    getContract,

    // Acciones adicionales
    generateContractPdf,
    refreshContracts,

    // Utilidades
    getContractsByStatus,
    searchContracts,
    getContractStats,
  };
};

export default useContracts;