import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

const StatusSelector = ({ selectedStatus, onSelectStatus }) => {
  const statuses = [
    { key: 'disponible', label: 'Disponible', color: '#9CA3AF' },
    { key: 'reservado', label: 'Reservado', color: '#3B82F6' },
    { key: 'mantenimiento', label: 'Mantenimiento', color: '#F59E0B' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.statusTabs}>
        {statuses.map((status) => (
          <TouchableOpacity
            key={status.key}
            style={[
              styles.statusTab,
              selectedStatus === status.key && styles.activeTab,
              selectedStatus === status.key && { borderBottomColor: status.color }
            ]}
            onPress={() => onSelectStatus(status.key)}
          >
            <Text
              style={[
                styles.statusTabText,
                selectedStatus === status.key && styles.activeTabText,
                selectedStatus === status.key && { color: status.color }
              ]}
            >
              {status.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  statusTabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
  },
  statusTab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  statusTabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
});

export default StatusSelector;