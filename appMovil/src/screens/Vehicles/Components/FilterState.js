
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Pressable, Platform } from 'react-native';

export default function FilterState({ visible, onClose, current, onSelect, filters, anchorPosition }) {
   const fadeAnim = useRef(new Animated.Value(0)).current;
   const [shouldRender, setShouldRender] = useState(visible);

   useEffect(() => {
	   if (visible) {
		   setShouldRender(true);
		   Animated.timing(fadeAnim, {
			   toValue: 1,
			   duration: 180,
			   useNativeDriver: true,
		   }).start();
	   } else {
		   Animated.timing(fadeAnim, {
			   toValue: 0,
			   duration: 120,
			   useNativeDriver: true,
		   }).start(() => setShouldRender(false));
	   }
   }, [visible]);

   if (!shouldRender) return null;

	// Calcular la posición del menú: siempre debajo del botón, usando anchorPosition si existe
	let menuStyle;
	   if (anchorPosition && typeof anchorPosition.x === 'number' && typeof anchorPosition.y === 'number') {
		   menuStyle = [
			   styles.menuFixedModern,
			   {
				   // Ajusta estos valores para que el menú quede justo debajo y alineado al botón de filtro
				   top: anchorPosition.y + 28, // más arriba, más cerca del botón
				   left: anchorPosition.x - 20, // alineado al borde izquierdo del botón
				   right: undefined,
				   marginTop: 0,
				   marginRight: 0,
				   position: 'absolute',
				   zIndex: 99999
			   }
		   ];
	   } else {
		   // fallback: centrado arriba
		   menuStyle = [
			   styles.menuFixedModern,
			   { top: 90, left: 40, right: 40, position: 'absolute', zIndex: 99999 }
		   ];
	   }

   // Captura toques fuera del menú para cerrar, sin overlay visual
   return (
	   <Pressable style={styles.pressableBg} onPress={onClose} pointerEvents={visible ? 'auto' : 'none'}>
		   <Animated.View
			   style={[...menuStyle, { opacity: fadeAnim }]}
			   onStartShouldSetResponder={evt => true}
			   onTouchEnd={evt => evt.stopPropagation()}
		   >
			   {["Todos", ...(filters || ['Disponible', 'Reservado', 'Mantenimiento'])].map(status => (
				   <TouchableOpacity
					   key={status}
					   style={[styles.optionModern, (current === status || (status === "Todos" && !current)) && styles.selectedModern]}
					   onPress={() => {
						   if (status === "Todos") {
							   onSelect("");
						   } else if (current === status) {
							   onSelect("");
						   } else {
							   onSelect(status);
						   }
					   }}
				   >
					   <Text style={[styles.optionTextModern, (current === status || (status === "Todos" && !current)) && styles.selectedTextModern]}>{status}</Text>
				   </TouchableOpacity>
			   ))}
		   </Animated.View>
	   </Pressable>
	);
}

const styles = StyleSheet.create({
	   pressableBg: {
		   position: 'absolute',
		   top: 0,
		   left: 0,
		   right: 0,
		   bottom: 0,
		   zIndex: 99999,
		   justifyContent: 'flex-start',
		   alignItems: 'flex-start',
	   },
	menuFixedModern: {
		backgroundColor: '#fff',
		borderRadius: 14,
		borderWidth: 2,
		borderColor: '#7bb0f6',
		paddingVertical: 4,
		paddingHorizontal: 0,
		minWidth: 140,
		maxWidth: 200,
		shadowColor: '#7bb0f6',
		shadowOpacity: 0.13,
		shadowRadius: 16,
		elevation: 12,
		zIndex: 99999,
		position: 'absolute',
	},
	optionModern: {
		paddingVertical: 10,
		paddingHorizontal: 18,
		borderRadius: 10,
	},
	selectedModern: {
		backgroundColor: '#e6f1fa',
	},
	optionTextModern: {
		fontSize: 16,
		color: '#3D83D2',
	},
	selectedTextModern: {
		fontWeight: 'bold',
		color: '#2366a8',
	},
});
