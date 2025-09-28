import { useState, useCallback } from 'react';

const useContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // URL base de tu API - ajústala según tu configuración
  const API_BASE_URL = 'http://10.0.2.2:4000/api'; // CAMBIAR POR TU URL

  // Función para obtener todos los contratos
  const fetchContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('useContracts: Obteniendo contratos...');

      const response = await fetch(`${API_BASE_URL}/contracts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Agregar headers de autenticación si es necesario
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('useContracts: Contratos obtenidos:', data.length);
      setContracts(data);
    } catch (err) {
      console.error('useContracts: Error fetching contracts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Función para crear un nuevo contrato
  const createContract = useCallback(async (contractData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('useContracts: Creando contrato...', contractData);

      // Preparar los datos del contrato según el schema de MongoDB
      const formattedData = {
        reservationId: contractData.reservationId,
        status: 'Active',
        startDate: new Date(),
        
        statusSheetData: {
          deliveryDate: contractData.deliveryDate ? new Date(contractData.deliveryDate) : new Date(),
          returnDate: contractData.returnDate ? new Date(contractData.returnDate) : null,
          unitNumber: contractData.unitNumber,
          brandModel: contractData.brandModel,
          plate: contractData.plate,
          clientName: contractData.clientName,
          notes: contractData.notes,

          vehicleDocumentation: {
            delivery: {
              keys: contractData.deliveryKeys || false,
              circulationCard: contractData.deliveryCirculationCard || false,
              consumerInvoice: contractData.deliveryConsumerInvoice || false
            },
            return: {
              keys: false,
              circulationCard: false,
              consumerInvoice: false
            }
          },

          physicalInspection: {
            delivery: {
              external: {
                generalExteriorCondition: contractData.deliveryExteriorCondition || '',
                hood: contractData.deliveryHood || false,
                antenna: contractData.deliveryAntenna || false,
                mirrors: contractData.deliveryMirrors || false,
                trunk: contractData.deliveryTrunk || false,
                windowsGoodCondition: contractData.deliveryWindows || false,
                toolKit: contractData.deliveryToolKit || false,
                doorHandles: contractData.deliveryDoorHandles || false,
                fuelCap: contractData.deliveryFuelCap || false,
                wheelCovers: {
                  present: contractData.deliveryWheelCoversPresent || false,
                  quantity: contractData.deliveryWheelCoversQuantity || 0
                }
              },
              internal: {
                startSwitch: contractData.deliveryStartSwitch || false,
                ignitionKey: contractData.deliveryIgnitionKey || false,
                lights: contractData.deliveryLights || false,
                originalRadio: contractData.deliveryRadio || false,
                acHeatingVentilation: contractData.deliveryAC || false,
                dashboard: contractData.deliveryDashboard || '',
                gearShift: contractData.deliveryGearShift || false,
                doorLocks: contractData.deliveryDoorLocks || false,
                mats: contractData.deliveryMats || false,
                spareTire: contractData.deliverySpareTire || false
              }
            },
            return: {
              external: {
                generalExteriorCondition: '',
                hood: false,
                antenna: false,
                mirrors: false,
                trunk: false,
                windowsGoodCondition: false,
                toolKit: false,
                doorHandles: false,
                fuelCap: false,
                wheelCovers: { present: false, quantity: 0 }
              },
              internal: {
                startSwitch: false,
                ignitionKey: false,
                lights: false,
                originalRadio: false,
                acHeatingVentilation: false,
                dashboard: '',
                gearShift: false,
                doorLocks: false,
                mats: false,
                spareTire: false
              }
            }
          },

          fuelStatus: {
            delivery: `${contractData.deliveryFuelLevel || 0}%`,
            return: `${contractData.returnFuelLevel || 0}%`
          },

          conditionPhotos: [], // Se pueden agregar más tarde
          deliverySignature: contractData.deliverySignature || ''
        },

        leaseData: {
          tenantName: contractData.tenantName || '',
          tenantProfession: contractData.tenantProfession || '',
          tenantAddress: contractData.tenantAddress || '',
          passportCountry: contractData.passportCountry || '',
          passportNumber: contractData.passportNumber || '',
          licenseCountry: contractData.licenseCountry || '',
          licenseNumber: contractData.licenseNumber || '',

          extraDriverName: contractData.extraDriverName || '',
          extraDriverPassportCountry: contractData.extraDriverPassportCountry || '',
          extraDriverPassportNumber: contractData.extraDriverPassportNumber || '',
          extraDriverLicenseCountry: contractData.extraDriverLicenseCountry || '',
          extraDriverLicenseNumber: contractData.extraDriverLicenseNumber || '',

          deliveryCity: contractData.deliveryCity || '',
          deliveryHour: contractData.deliveryHour || '',
          deliveryDate: contractData.deliveryDate ? new Date(contractData.deliveryDate) : new Date(),

          dailyPrice: contractData.dailyPrice || 0,
          totalAmount: contractData.totalAmount || 0,
          rentalDays: contractData.rentalDays || 0,
          depositAmount: contractData.depositAmount || 0,
          termDays: contractData.termDays || 0,
          misusePenalty: contractData.misusePenalty || 0,

          signatureCity: contractData.signatureCity || '',
          signatureHour: contractData.signatureHour || '',
          signatureDate: contractData.signatureDate ? new Date(contractData.signatureDate) : new Date(),

          landlordSignature: contractData.landlordSignature || '',
          tenantSignature: contractData.tenantSignature || ''
        },

        documents: {
          statusSheetPdf: '',
          leasePdf: ''
        }
      };

      const response = await fetch(`${API_BASE_URL}/contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Agregar headers de autenticación si es necesario
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error HTTP: ${response.status}`);
      }

      const newContract = await response.json();
      console.log('useContracts: Contrato creado:', newContract._id);
      
      // Agregar el nuevo contrato a la lista local
      setContracts(prevContracts => [newContract, ...prevContracts]);
      
      return newContract;
    } catch (err) {
      console.error('useContracts: Error creating contract:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para actualizar un contrato
  const updateContract = useCallback(async (contractId, updateData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('useContracts: Actualizando contrato:', contractId);

      const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const updatedContract = await response.json();
      console.log('useContracts: Contrato actualizado:', updatedContract._id);
      
      // Actualizar el contrato en la lista local
      setContracts(prevContracts =>
        prevContracts.map(contract =>
          contract._id === contractId ? updatedContract : contract
        )
      );
      
      return updatedContract;
    } catch (err) {
      console.error('useContracts: Error updating contract:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para eliminar un contrato
  const deleteContract = useCallback(async (contractId) => {
    try {
      setLoading(true);
      setError(null);
      console.log('useContracts: Eliminando contrato:', contractId);

      const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      console.log('useContracts: Contrato eliminado:', contractId);
      
      // Remover el contrato de la lista local
      setContracts(prevContracts =>
        prevContracts.filter(contract => contract._id !== contractId)
      );
    } catch (err) {
      console.error('useContracts: Error deleting contract:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para generar PDF del contrato
  const generateContractPdf = useCallback(async (contractId) => {
    try {
      setLoading(true);
      setError(null);
      console.log('useContracts: Generando PDF para contrato:', contractId);

      const response = await fetch(`${API_BASE_URL}/contracts/${contractId}/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log('useContracts: PDF generado:', result.pdfUrl);
      
      return result;
    } catch (err) {
      console.error('useContracts: Error generating PDF:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para refrescar la lista (pull to refresh)
  const refreshContracts = useCallback(() => {
    setRefreshing(true);
    fetchContracts();
  }, [fetchContracts]);

  // Función para obtener un contrato específico
  const getContract = useCallback(async (contractId) => {
    try {
      setError(null);
      console.log('useContracts: Obteniendo contrato:', contractId);

      const response = await fetch(`${API_BASE_URL}/contracts/${contractId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
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

  return {
    contracts,
    loading,
    refreshing,
    error,
    fetchContracts,
    createContract,
    updateContract,
    deleteContract,
    generateContractPdf,
    refreshContracts,
    getContract,
  };
};

export default useContracts;