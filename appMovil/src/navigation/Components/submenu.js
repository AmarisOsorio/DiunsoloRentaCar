import React from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function MorePopout({ visible, onClose, navigation }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity style={styles.popoutOverlay} activeOpacity={1} onPress={onClose}>
        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
          <View style={styles.popoutWrapper}>
            <View style={styles.popoutContent}>
              <TouchableOpacity style={styles.popoutRow} onPress={() => { onClose(); navigation.navigate('Clients'); }}>
                <Ionicons name="people" size={36} color="#153A8B" style={styles.popoutIcon} />
                <Text style={styles.popoutItem}>Usuarios</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popoutRow} onPress={() => { onClose(); navigation.navigate('Maintenance'); }}>
                <Ionicons name="build" size={36} color="#153A8B" style={styles.popoutIcon} />
                <Text style={styles.popoutItem}>Mantenimientos</Text>
              </TouchableOpacity>
            </View>
            <View pointerEvents="none" style={styles.popoutArrow} />
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  popoutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.08)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  popoutWrapper: {
    position: 'absolute',
    right: 12,
    bottom: 80,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  popoutContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 2,
    paddingHorizontal: 6,
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
    alignItems: 'flex-start',
  },
  popoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    width: '100%',
  },
  popoutIcon: {
    marginRight: 8,
    alignSelf: 'flex-start',
  },
  popoutItem: {
    fontSize: 14,
    color: '#153A8B',
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  popoutArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginRight: 8,
    marginTop: -8,
    alignSelf: 'flex-end',
  },
});
