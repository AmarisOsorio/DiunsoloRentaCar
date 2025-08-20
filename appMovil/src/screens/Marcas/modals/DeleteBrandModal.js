import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function DeleteBrandModal({ visible, brand, onClose, onConfirm }) {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleClose = () => {
    onClose();
  }
};