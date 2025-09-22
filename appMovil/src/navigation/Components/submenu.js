import React from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function MorePopout({ visible, onClose, navigation }) {
  if (!visible) return null;
  
  return (
    <View style={styles.popoutOverlay}>
      <TouchableOpacity 
        style={StyleSheet.absoluteFill} 
        activeOpacity={1} 
        onPress={onClose}
      />
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
  );
}

const styles = StyleSheet.create({
  popoutOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  popoutWrapper: {
    position: 'absolute',
    right: 12,
    bottom: 90,
    alignItems: 'flex-end',
    zIndex: 100,
  },
  popoutContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 6,
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginRight: 18,
    marginTop: -1,
    alignSelf: 'flex-end',
  },
});
