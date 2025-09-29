import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReservationSelector = ({ reservations, selectedReservation, onSelectReservation }) => {

    // Filtrar reservas válidas para crear contratos
    const filteredReservations = useMemo(() => {
        if (!reservations || !Array.isArray(reservations)) {
            console.log('ReservationSelector: No hay reservations o no es un array');
            return [];
        }

        console.log('ReservationSelector: Procesando', reservations.length, 'reservaciones');

        // Estados válidos para crear contratos
        const validStatuses = ['Active', 'Confirmed', 'Approved', 'Pending'];

        const filtered = reservations.filter((reservation, index) => {
            // Debug de cada reserva
            if (index < 3) {
                console.log(`ReservationSelector: Reserva ${index + 1}:`, {
                    id: reservation._id?.slice(-6),
                    status: reservation.status,
                    hasClientId: !!reservation.clientId,
                    hasVehicleId: !!reservation.vehicleId,
                    clientName: reservation.clientId ? `${reservation.clientId.name} ${reservation.clientId.lastName}` : 'N/A',
                    vehicleName: reservation.vehicleId ? `${reservation.vehicleId.brand} ${reservation.vehicleId.model}` : 'N/A'
                });
            }

            const isValidStatus = validStatuses.includes(reservation.status);
            const hasClientData = reservation.clientId && (reservation.clientId.name || reservation.clientId.lastName);
            const hasVehicleData = reservation.vehicleId && reservation.vehicleId.vehicleName;

            return isValidStatus && hasClientData && hasVehicleData;
        });

        console.log('ReservationSelector: Reservas válidas:', filtered.length, 'de', reservations.length);

        return filtered;
    }, [reservations]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active':
                return { backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10B981' };
            case 'Confirmed':
                return { backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6' };
            case 'Approved':
                return { backgroundColor: 'rgba(34, 197, 94, 0.15)', color: '#22C55E' };
            case 'Pending':
                return { backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B' };
            default:
                return { backgroundColor: 'rgba(156, 163, 175, 0.15)', color: '#9CA3AF' };
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'Active':
                return 'Activa';
            case 'Confirmed':
                return 'Confirmada';
            case 'Approved':
                return 'Aprobada';
            case 'Pending':
                return 'Pendiente';
            default:
                return status;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch {
            return 'Fecha inválida';
        }
    };

    const calculateDays = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        try {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        } catch {
            return 0;
        }
    };

    const getClientName = (reservation) => {
        if (!reservation.clientId) return 'Cliente N/A';

        const firstName = reservation.clientId.name || '';
        const lastName = reservation.clientId.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();

        return fullName || 'Cliente N/A';
    };

    const getVehicleName = (reservation) => {
        // Si existe vehicleName, úsalo
        if (reservation.vehicleId?.vehicleName) {
            return reservation.vehicleId.vehicleName;
        }

        // Si por alguna razón quisieras usar brand y model
        const brand = reservation.vehicleId?.brand || '';
        const model = reservation.vehicleId?.model || '';
        const fullName = `${brand} ${model}`.trim();

        return fullName || 'Vehículo N/A';
    };


    // Loading state
    if (!reservations) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Seleccionar reservación</Text>
                <View style={styles.loadingContainer}>
                    <Ionicons name="hourglass-outline" size={64} color="#E8EAED" />
                    <Text style={styles.emptyTitle}>Cargando reservaciones...</Text>
                    <Text style={styles.emptyText}>Por favor espere</Text>
                </View>
            </View>
        );
    }

    // Empty state
    if (filteredReservations.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>Seleccionar reservación</Text>
                <View style={styles.emptyContainer}>
                    <Ionicons name="calendar-outline" size={64} color="#E8EAED" />
                    <Text style={styles.emptyTitle}>No hay reservaciones disponibles</Text>
                    <Text style={styles.emptyText}>
                        {reservations.length === 0
                            ? 'No hay reservaciones en el sistema'
                            : 'Las reservaciones deben estar en estado "Activa", "Confirmada" o "Aprobada" y tener datos completos de cliente y vehículo para crear un contrato'
                        }
                    </Text>
                    {reservations.length > 0 && (
                        <View style={styles.debugInfo}>
                            <Text style={styles.debugText}>
                                Debug: Se encontraron {reservations.length} reservaciones, pero ninguna es válida para contratos
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Seleccionar reservación</Text>
            <Text style={styles.subtitle}>
                Elige la reservación para la cual deseas crear el contrato ({filteredReservations.length} disponibles)
            </Text>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.reservationScrollContainer}
            >
                {filteredReservations.map((reservation) => {
                    const statusStyle = getStatusColor(reservation.status);
                    const isSelected = selectedReservation?._id === reservation._id;
                    const clientName = getClientName(reservation);
                    const vehicleName = getVehicleName(reservation);
                    const days = calculateDays(reservation.startDate, reservation.returnDate);
                    const totalAmount = days * (reservation.pricePerDay || 0);

                    return (
                        <TouchableOpacity
                            key={reservation._id}
                            style={[styles.reservationCard, isSelected && styles.selectedCard]}
                            onPress={() => onSelectReservation(reservation)}
                            activeOpacity={0.8}
                        >
                            {/* Header con estado y checkbox */}
                            <View style={styles.cardHeader}>
                                <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                                    <View style={[styles.statusDot, { backgroundColor: statusStyle.color }]} />
                                    <Text style={[styles.statusText, { color: statusStyle.color }]}>
                                        {getStatusLabel(reservation.status)}
                                    </Text>
                                </View>
                                <View style={styles.checkboxContainer}>
                                    <Text style={styles.checkboxLabel}>Seleccionar</Text>
                                    <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                        {isSelected && <Ionicons name="checkmark" size={16} color="white" />}
                                    </View>
                                </View>
                            </View>

                            {/* Información principal */}
                            <View style={styles.reservationInfo}>
                                <Text style={styles.reservationId}>#{reservation._id.slice(-8)}</Text>
                                <Text style={styles.clientName} numberOfLines={1}>
                                    {clientName}
                                </Text>
                                <Text style={styles.vehicleName} numberOfLines={1}>
                                    {vehicleName}
                                </Text>
                                {reservation.vehicleId?.plate && (
                                    <View style={styles.plateContainer}>
                                        <Ionicons name="car-outline" size={16} color="#6B7280" />
                                        <Text style={styles.plateText}>{reservation.vehicleId.plate}</Text>
                                    </View>
                                )}
                            </View>

                            {/* Fechas */}
                            <View style={styles.dateSection}>
                                <View style={styles.dateRow}>
                                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                                    <Text style={styles.dateLabel}>Inicio:</Text>
                                    <Text style={styles.dateValue}>{formatDate(reservation.startDate)}</Text>
                                </View>
                                <View style={styles.dateRow}>
                                    <Ionicons name="calendar-outline" size={14} color="#6B7280" />
                                    <Text style={styles.dateLabel}>Fin:</Text>
                                    <Text style={styles.dateValue}>{formatDate(reservation.returnDate)}</Text>
                                </View>
                                <View style={styles.dateRow}>
                                    <Ionicons name="time-outline" size={14} color="#6B7280" />
                                    <Text style={styles.dateLabel}>Días:</Text>
                                    <Text style={[styles.daysValue, days > 0 ? styles.validDays : styles.invalidDays]}>
                                        {days > 0 ? `${days} días` : 'N/A'}
                                    </Text>
                                </View>
                            </View>

                            {/* Precio */}
                            <View style={styles.priceSection}>
                                <View style={styles.priceRow}>
                                    <Text style={styles.priceLabel}>Precio/día:</Text>
                                    <Text style={styles.priceValue}>Q {(reservation.pricePerDay || 0).toFixed(2)}</Text>
                                </View>
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Total estimado:</Text>
                                    <Text style={styles.totalValue}>Q {totalAmount.toFixed(2)}</Text>
                                </View>
                            </View>

                            {/* Indicador de selección */}
                            {isSelected && (
                                <View style={styles.selectionIndicator}>
                                    <Ionicons name="checkmark-circle" size={24} color="#4285F4" />
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

// ================== ESTILOS ==================
const styles = StyleSheet.create({
    container: {
        marginBottom: 24
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 16,
        lineHeight: 20
    },
    reservationScrollContainer: {
        paddingRight: 20
    },
    reservationCard: {
        width: 320,
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 16,
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        position: 'relative'
    },
    selectedCard: {
        borderColor: '#4285F4',
        borderWidth: 2,
        shadowColor: '#4285F4',
        shadowOpacity: 0.15,
        transform: [{ scale: 1.02 }]
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600'
    },
    checkboxContainer: {
        alignItems: 'center'
    },
    checkboxLabel: {
        fontSize: 10,
        color: '#9CA3AF',
        marginBottom: 4
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    checkboxSelected: {
        backgroundColor: '#4285F4',
        borderColor: '#4285F4'
    },
    reservationInfo: {
        marginBottom: 12
    },
    reservationId: {
        fontSize: 12,
        color: '#9CA3AF',
        marginBottom: 4,
        fontFamily: 'monospace'
    },
    clientName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
        lineHeight: 20
    },
    vehicleName: {
        fontSize: 14,
        color: '#4285F4',
        fontWeight: '500',
        marginBottom: 8,
        lineHeight: 18
    },
    plateContainer: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    plateText: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 4,
        fontWeight: '500'
    },
    dateSection: {
        paddingVertical: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#F3F4F6',
        marginBottom: 12
    },
    dateRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6
    },
    dateLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 6,
        marginRight: 4,
        minWidth: 35
    },
    dateValue: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '500'
    },
    daysValue: {
        fontSize: 12,
        fontWeight: '600'
    },
    validDays: {
        color: '#4285F4'
    },
    invalidDays: {
        color: '#DC2626'
    },
    priceSection: {},
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4
    },
    priceLabel: {
        fontSize: 12,
        color: '#6B7280'
    },
    priceValue: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '500'
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 4,
        borderTopWidth: 1,
        borderColor: '#F3F4F6'
    },
    totalLabel: {
        fontSize: 14,
        color: '#1F2937',
        fontWeight: '600'
    },
    totalValue: {
        fontSize: 14,
        color: '#10B981',
        fontWeight: '700'
    },
    selectionIndicator: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3
    },
    loadingContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    emptyContainer: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB'
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8
    },
    emptyText: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20
    },
    debugInfo: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6'
    },
    debugText: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        fontStyle: 'italic'
    }
});

export default ReservationSelector;