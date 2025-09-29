/**
 * ConfirmLogout Component
 * 
 * Modal de confirmación que se muestra cuando el usuario intenta cerrar sesión.
 * Proporciona opciones para confirmar o cancelar la acción de cierre de sesión.
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.visible - Controla la visibilidad del modal
 * @param {Function} props.onCancel - Función que se ejecuta al cancelar
 * @param {Function} props.onConfirm - Función que se ejecuta al confirmar el cierre de sesión
 */

import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';

export default function ConfirmLogout({ visible, onCancel, onConfirm }) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <TouchableWithoutFeedback onPress={onCancel}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback>
                        <View style={styles.confirmModalBox}>
                            <Text style={styles.confirmTitle}>¿Cerrar sesión?</Text>
                            <Text style={styles.confirmText}>¿Estás seguro de que quieres cerrar sesión?</Text>
                            <View style={styles.confirmButtonRow}>
                                <TouchableOpacity style={[styles.confirmButton, styles.cancelButton]} onPress={onCancel}>
                                    <Text style={[styles.confirmButtonText, styles.cancelButtonText]}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.confirmButton, styles.acceptButton]} onPress={onConfirm}>
                                    <Text style={[styles.confirmButtonText, styles.acceptButtonText]}>Sí, cerrar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(21, 58, 139, 0.25)', // Fondo azul oscuro semi-transparente
        justifyContent: 'center',
        alignItems: 'center',
    },
    confirmModalBox: {
        width: 300,
        backgroundColor: '#fff',
        borderRadius: 18,
        paddingVertical: 28,
        paddingHorizontal: 22,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    confirmTitle: {
        color: '#153A8B',
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    confirmText: {
        color: '#153A8B',
        fontSize: 16,
        marginBottom: 28,
        textAlign: 'center',
    },
    confirmButtonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    },
    confirmButton: {
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 24,
        minWidth: 110,
        alignItems: 'center',
        marginHorizontal: 4,
    },
    cancelButton: {
        backgroundColor: '#B1D0FF',
    },
    acceptButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#153A8B',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    cancelButtonText: {
        color: '#153A8B',
    },
    acceptButtonText: {
        color: '#153A8B',
    },
});