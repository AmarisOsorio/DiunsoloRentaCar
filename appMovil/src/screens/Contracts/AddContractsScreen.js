import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReservationSelector from './components/ReservationSelector';
import FuelGauge from './components/FuelGaugeComponent';
import SignatureCanvas from './components/SignatureCanvas';
import ChecklistSection from './components/ChecklistSection';
import ContractForm from './components/ContractForm';
import ConfirmationModal from './modals/ConfirmationModalContracts';
import SuccessModal from './modals/SuccessModalContracts';
import useContracts from './hooks/useContracts';

// Para emulador Android usa 10.0.2.2 en lugar de localhost
const API_BASE_URL = 'http://10.0.2.2:4000/api';

const AddContractScreen = ({ navigation }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const [reservations, setReservations] = useState([]);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [reservationsLoading, setReservationsLoading] = useState(true);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);

    const { createContract } = useContracts();

    // Datos del formulario
    const [formData, setFormData] = useState({
        // Paso 1 - Datos de entrega
        reservationId: '',
        deliveryDate: '',
        returnDate: '',
        unitNumber: '',
        brandModel: '',
        plate: '',
        clientName: '',
        notes: '',

        // Documentación de entrega
        deliveryKeys: false,
        deliveryCirculationCard: false,
        deliveryConsumerInvoice: false,

        // Inspección física exterior - entrega
        deliveryExteriorCondition: '',
        deliveryHood: false,
        deliveryAntenna: false,
        deliveryMirrors: false,
        deliveryTrunk: false,
        deliveryWindows: false,
        deliveryToolKit: false,
        deliveryDoorHandles: false,
        deliveryFuelCap: false,
        deliveryWheelCoversPresent: false,
        deliveryWheelCoversQuantity: 0,

        // Inspección física interior - entrega
        deliveryStartSwitch: false,
        deliveryIgnitionKey: false,
        deliveryLights: false,
        deliveryRadio: false,
        deliveryAC: false,
        deliveryDashboard: '',
        deliveryGearShift: false,
        deliveryDoorLocks: false,
        deliveryMats: false,
        deliverySpareTire: false,

        // Combustible
        deliveryFuelLevel: 50,
        returnFuelLevel: 50,

        // Firma de entrega
        deliverySignature: null,

        // Paso 2 - Datos de arrendamiento
        tenantName: '',
        tenantProfession: '',
        tenantAddress: '',
        passportCountry: '',
        passportNumber: '',
        licenseCountry: '',
        licenseNumber: '',

        extraDriverName: '',
        extraDriverPassportCountry: '',
        extraDriverPassportNumber: '',
        extraDriverLicenseCountry: '',
        extraDriverLicenseNumber: '',

        deliveryCity: '',
        deliveryHour: '',

        dailyPrice: 0,
        totalAmount: 0,
        rentalDays: 0,
        depositAmount: 0,
        termDays: 0,
        misusePenalty: 0,

        signatureCity: '',
        signatureHour: '',
        signatureDate: '',

        landlordSignature: null,
        tenantSignature: null,

        finalObservations: ''
    });

    // Cargar reservaciones disponibles
    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        try {
            setReservationsLoading(true);
            console.log('🔍 Obteniendo reservaciones para crear contratos...');

            const response = await fetch(`${API_BASE_URL}/reservations`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: Error al cargar reservaciones`);
            }

            const reservationsData = await response.json();
            console.log('📊 Reservaciones recibidas del backend:', reservationsData);

            // 🔹 Ahora accedemos correctamente al array dentro de 'data'
            const reservationsArray = Array.isArray(reservationsData.data)
                ? reservationsData.data
                : [];

            console.log('📋 Total de reservaciones:', reservationsArray.length);

            // 🔹 FILTROS MEJORADOS - Incluir más estados válidos para crear contratos
            const availableReservations = reservationsArray.filter(reservation => {
                const isValidStatus = ['Active', 'Confirmed', 'Approved', 'Pending'].includes(reservation.status);
                const hasRequiredData = reservation.clientId && reservation.vehicleId;

                console.log(`📝 Reservación ${reservation._id?.slice(-6)}: Status=${reservation.status}, Valid=${isValidStatus}, HasData=${hasRequiredData}`);

                return isValidStatus && hasRequiredData;
            });

            console.log(`✅ Reservaciones disponibles para contrato: ${availableReservations.length} de ${reservationsArray.length}`);

            setReservations(availableReservations);

            if (availableReservations.length === 0) {
                Alert.alert(
                    'Sin reservaciones disponibles',
                    'No hay reservaciones válidas para crear contratos. Las reservaciones deben estar en estado "Confirmada" o "Activa" y tener datos completos de cliente y vehículo.',
                    [{ text: 'Entendido', onPress: () => navigation.goBack() }]
                );
            }

        } catch (error) {
            console.error('❌ Error al cargar reservaciones:', error);
            Alert.alert(
                'Error de conexión',
                `No se pudieron cargar las reservaciones. Verifica que el servidor esté corriendo en ${API_BASE_URL}\n\nError: ${error.message}`,
                [
                    { text: 'Reintentar', onPress: fetchReservations },
                    { text: 'Cancelar', onPress: () => navigation.goBack() }
                ]
            );
        } finally {
            setReservationsLoading(false);
        }
    };



    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        } else {
            navigation.goBack();
        }
    };

    const handleCancel = () => {
        if (selectedReservation || Object.values(formData).some(value =>
            typeof value === 'string' ? value.trim() : value
        )) {
            setShowConfirmationModal(true);
        } else {
            navigation.goBack();
        }
    };

    const handleConfirmCancel = () => {
        setShowConfirmationModal(false);
        navigation.goBack();
    };

    const handleCancelModal = () => {
        setShowConfirmationModal(false);
    };

    const updateFormData = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
    };

    const handleReservationSelect = (reservation) => {
        console.log('🎯 Seleccionando reservación:', {
            id: reservation._id,
            status: reservation.status,
            client: `${reservation.clientId?.name || ''} ${reservation.clientId?.lastName || ''}`,
            vehicle: `${reservation.vehicleId?.brand || ''} ${reservation.vehicleId?.model || ''}`
        });

        setSelectedReservation(reservation);

        // Auto-llenar datos desde la reservación
        const clientName = `${reservation.clientId?.name || ''} ${reservation.clientId?.lastName || ''}`.trim();
        const vehicleName = `${reservation.vehicleId?.brand || ''} ${reservation.vehicleId?.model || ''}`.trim();

        // Actualizar form data con datos de la reservación
        const updates = {
            reservationId: reservation._id,
            clientName: clientName,
            brandModel: vehicleName,
            plate: reservation.vehicleId?.plate || '',
            dailyPrice: reservation.pricePerDay || 0,
            deliveryDate: new Date().toISOString().split('T')[0],
            returnDate: reservation.returnDate ? new Date(reservation.returnDate).toISOString().split('T')[0] : '',

            // Datos del arrendatario
            tenantName: clientName,
            passportNumber: reservation.clientId?.passportNumber || '',
            licenseNumber: reservation.clientId?.licenseNumber || '',
            tenantAddress: reservation.clientId?.address || '',
            passportCountry: reservation.clientId?.passportCountry || '',
            licenseCountry: reservation.clientId?.licenseCountry || ''
        };

        // Calcular días y total
        if (reservation.startDate && reservation.returnDate) {
            const startDate = new Date(reservation.startDate);
            const endDate = new Date(reservation.returnDate);
            const diffTime = Math.abs(endDate - startDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const total = diffDays * (reservation.pricePerDay || 0);

            updates.rentalDays = diffDays;
            updates.totalAmount = total;
        }

        console.log('📝 Actualizando formulario con datos:', updates);

        // Aplicar todas las actualizaciones
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const validateStep1 = () => {
        if (!selectedReservation) {
            Alert.alert('Error', 'Por favor selecciona una reservación');
            return false;
        }

        if (!formData.deliverySignature) {
            Alert.alert('Error', 'La firma de entrega es requerida');
            return false;
        }

        return true;
    };

    const validateStep2 = () => {
        const required = [
            'tenantName', 'tenantAddress', 'passportNumber', 'licenseNumber',
            'deliveryCity', 'dailyPrice', 'totalAmount'
        ];

        for (let field of required) {
            if (!formData[field]) {
                Alert.alert('Error', `El campo ${field} es requerido`);
                return false;
            }
        }

        if (!formData.landlordSignature || !formData.tenantSignature) {
            Alert.alert('Error', 'Ambas firmas son requeridas');
            return false;
        }

        return true;
    };

    const handleNext = () => {
        if (currentStep === 1 && validateStep1()) {
            setCurrentStep(2);
        }
    };

    const handleSave = async () => {
        if (!validateStep2()) return;

        try {
            setLoading(true);
            console.log('💾 Guardando contrato...');

            const contractData = {
                reservationId: selectedReservation._id,
                status: 'Active',
                statusSheetData: {
                    deliveryDate: formData.deliveryDate,
                    returnDate: formData.returnDate,
                    unitNumber: formData.unitNumber,
                    brandModel: formData.brandModel,
                    plate: formData.plate,
                    clientName: formData.clientName,
                    notes: formData.notes,

                    vehicleDocumentation: {
                        delivery: {
                            keys: formData.deliveryKeys,
                            circulationCard: formData.deliveryCirculationCard,
                            consumerInvoice: formData.deliveryConsumerInvoice
                        }
                    },

                    physicalInspection: {
                        delivery: {
                            external: {
                                generalExteriorCondition: formData.deliveryExteriorCondition,
                                hood: formData.deliveryHood,
                                antenna: formData.deliveryAntenna,
                                mirrors: formData.deliveryMirrors,
                                trunk: formData.deliveryTrunk,
                                windowsGoodCondition: formData.deliveryWindows,
                                toolKit: formData.deliveryToolKit,
                                doorHandles: formData.deliveryDoorHandles,
                                fuelCap: formData.deliveryFuelCap,
                                wheelCovers: {
                                    present: formData.deliveryWheelCoversPresent,
                                    quantity: formData.deliveryWheelCoversQuantity
                                }
                            },
                            internal: {
                                startSwitch: formData.deliveryStartSwitch,
                                ignitionKey: formData.deliveryIgnitionKey,
                                lights: formData.deliveryLights,
                                originalRadio: formData.deliveryRadio,
                                acHeatingVentilation: formData.deliveryAC,
                                dashboard: formData.deliveryDashboard,
                                gearShift: formData.deliveryGearShift,
                                doorLocks: formData.deliveryDoorLocks,
                                mats: formData.deliveryMats,
                                spareTire: formData.deliverySpareTire
                            }
                        }
                    },

                    fuelStatus: {
                        delivery: formData.deliveryFuelLevel.toString(),
                        return: formData.returnFuelLevel.toString()
                    },

                    deliverySignature: formData.deliverySignature
                },

                leaseData: {
                    tenantName: formData.tenantName,
                    tenantProfession: formData.tenantProfession,
                    tenantAddress: formData.tenantAddress,
                    passportCountry: formData.passportCountry,
                    passportNumber: formData.passportNumber,
                    licenseCountry: formData.licenseCountry,
                    licenseNumber: formData.licenseNumber,

                    extraDriverName: formData.extraDriverName,
                    extraDriverPassportCountry: formData.extraDriverPassportCountry,
                    extraDriverPassportNumber: formData.extraDriverPassportNumber,
                    extraDriverLicenseCountry: formData.extraDriverLicenseCountry,
                    extraDriverLicenseNumber: formData.extraDriverLicenseNumber,

                    deliveryCity: formData.deliveryCity,
                    deliveryHour: formData.deliveryHour,
                    deliveryDate: new Date(formData.deliveryDate),

                    dailyPrice: formData.dailyPrice,
                    totalAmount: formData.totalAmount,
                    rentalDays: formData.rentalDays,
                    depositAmount: formData.depositAmount,
                    termDays: formData.termDays,
                    misusePenalty: formData.misusePenalty,

                    signatureCity: formData.signatureCity,
                    signatureHour: formData.signatureHour,
                    signatureDate: new Date(),

                    landlordSignature: formData.landlordSignature,
                    tenantSignature: formData.tenantSignature,

                    finalObservations: formData.finalObservations
                }
            };

            console.log('📤 Enviando datos del contrato al backend...');
            await createContract(contractData);
            console.log('✅ Contrato creado exitosamente');
            setShowSuccessModal(true);

        } catch (error) {
            console.error('❌ Error al crear contrato:', error);
            Alert.alert('Error', error.message || 'No se pudo crear el contrato');
        } finally {
            setLoading(false);
        }
    };

    const handleSuccessOk = () => {
        setShowSuccessModal(false);
        navigation.goBack();
    };

    if (reservationsLoading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={24} color="white" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Añadir contrato</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#4285F4" />
                    <Text style={styles.loadingText}>Cargando reservaciones...</Text>
                    <Text style={styles.loadingSubtext}>Conectando a {API_BASE_URL}</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Añadir contrato</Text>
            </View>

            {/* Progress indicator */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={styles.stepIndicator}>
                        <View style={[styles.stepCircle, currentStep >= 1 && styles.stepCircleActive]}>
                            <Text style={[styles.stepNumber, currentStep >= 1 && styles.stepNumberActive]}>1</Text>
                        </View>
                        <Text style={styles.stepLabel}>Datos de entrega</Text>
                    </View>
                    <View style={styles.progressLine} />
                    <View style={styles.stepIndicator}>
                        <View style={[styles.stepCircle, currentStep >= 2 && styles.stepCircleActive]}>
                            <Text style={[styles.stepNumber, currentStep >= 2 && styles.stepNumberActive]}>2</Text>
                        </View>
                        <Text style={styles.stepLabel}>Arrendamiento</Text>
                    </View>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {currentStep === 1 ? (
                    <>
                        {/* Reservation Selector */}
                        <ReservationSelector
                            reservations={reservations}
                            selectedReservation={selectedReservation}
                            onSelectReservation={handleReservationSelect}
                        />

                        {selectedReservation && (
                            <>
                                {/* Documentation Checklist */}
                                <ChecklistSection
                                    title="Documentación de entrega"
                                    items={[
                                        { key: 'deliveryKeys', label: 'Entrega de llaves' },
                                        { key: 'deliveryCirculationCard', label: 'Tarjeta de circulación' },
                                        { key: 'deliveryConsumerInvoice', label: 'Factura de consumidor' }
                                    ]}
                                    values={formData}
                                    onValueChange={updateFormData}
                                />

                                {/* Physical Inspection */}
                                <ChecklistSection
                                    title="Inspección física - Exterior"
                                    items={[
                                        { key: 'deliveryHood', label: 'Capó' },
                                        { key: 'deliveryAntenna', label: 'Antena' },
                                        { key: 'deliveryMirrors', label: 'Espejos' },
                                        { key: 'deliveryTrunk', label: 'Baúl' },
                                        { key: 'deliveryWindows', label: 'Ventanas en buen estado' },
                                        { key: 'deliveryToolKit', label: 'Kit de herramientas' },
                                        { key: 'deliveryDoorHandles', label: 'Manijas de puertas' },
                                        { key: 'deliveryFuelCap', label: 'Tapón de combustible' }
                                    ]}
                                    values={formData}
                                    onValueChange={updateFormData}
                                />

                                <ChecklistSection
                                    title="Inspección física - Interior"
                                    items={[
                                        { key: 'deliveryStartSwitch', label: 'Interruptor de encendido' },
                                        { key: 'deliveryIgnitionKey', label: 'Llave de encendido' },
                                        { key: 'deliveryLights', label: 'Luces' },
                                        { key: 'deliveryRadio', label: 'Radio original' },
                                        { key: 'deliveryAC', label: 'A/C - Calefacción - Ventilación' },
                                        { key: 'deliveryGearShift', label: 'Palanca de cambios' },
                                        { key: 'deliveryDoorLocks', label: 'Seguros de puertas' },
                                        { key: 'deliveryMats', label: 'Alfombras' },
                                        { key: 'deliverySpareTire', label: 'Llanta de respuesto' }
                                    ]}
                                    values={formData}
                                    onValueChange={updateFormData}
                                />

                                {/* Fuel Gauges */}
                                <View style={styles.fuelSection}>
                                    <Text style={styles.sectionTitle}>Estado de combustible</Text>
                                    <View style={styles.fuelGauges}>
                                        <FuelGauge
                                            title="Entrega"
                                            level={formData.deliveryFuelLevel}
                                            onLevelChange={(level) => updateFormData('deliveryFuelLevel', level)}
                                        />
                                        <FuelGauge
                                            title="Devolución"
                                            level={formData.returnFuelLevel}
                                            onLevelChange={(level) => updateFormData('returnFuelLevel', level)}
                                        />
                                    </View>
                                </View>

                                {/* Delivery Signature */}
                                <View style={styles.signatureSection}>
                                    <Text style={styles.sectionTitle}>Firma de entrega</Text>
                                    <SignatureCanvas
                                        signature={formData.deliverySignature}
                                        onSignature={(signature) => updateFormData('deliverySignature', signature)}
                                        placeholder="Firma del cliente en la entrega"
                                    />
                                </View>
                            </>
                        )}
                    </>
                ) : (
                    <ContractForm
                        formData={formData}
                        onFormDataChange={updateFormData}
                        selectedReservation={selectedReservation}
                    />
                )}
            </ScrollView>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancel}
                    disabled={loading}
                >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.primaryButton, loading && styles.disabledButton]}
                    onPress={currentStep === 1 ? handleNext : handleSave}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="white" />
                    ) : (
                        <Text style={styles.primaryButtonText}>
                            {currentStep === 1 ? 'Siguiente' : 'Crear contrato'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            {/* Modals */}
            <ConfirmationModal
                visible={showConfirmationModal}
                onCancel={handleCancelModal}
                onConfirm={handleConfirmCancel}
                title="¿Cancelar creación de contrato?"
                message="Perderás todos los datos ingresados"
                loading={loading}
            />

            <SuccessModal
                visible={showSuccessModal}
                onOk={handleSuccessOk}
                title="¡Contrato creado!"
                message="El contrato ha sido creado exitosamente"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        backgroundColor: '#4285F4',
        paddingHorizontal: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#6B7280',
    },
    loadingSubtext: {
        marginTop: 5,
        fontSize: 12,
        color: '#9CA3AF',
    },
    progressContainer: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    progressBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepIndicator: {
        alignItems: 'center',
        flex: 1,
    },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#E8EAED',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    stepCircleActive: {
        backgroundColor: '#4285F4',
    },
    stepNumber: {
        fontSize: 14,
        fontWeight: '600',
        color: '#9AA0A6',
    },
    stepNumberActive: {
        color: '#FFFFFF',
    },
    stepLabel: {
        fontSize: 12,
        color: '#5F6368',
        textAlign: 'center',
        maxWidth: 80,
    },
    progressLine: {
        height: 2,
        flex: 1,
        backgroundColor: '#E8EAED',
        marginHorizontal: 16,
        marginBottom: 24,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    fuelSection: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4285F4',
        marginBottom: 16,
    },
    fuelGauges: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    signatureSection: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionButtons: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E8EAED',
        gap: 12,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#DC2626',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    primaryButton: {
        flex: 1,
        backgroundColor: '#4285F4',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#4285F4',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 4,
    },
    disabledButton: {
        backgroundColor: '#9CA3AF',
        shadowOpacity: 0,
        elevation: 0,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AddContractScreen;