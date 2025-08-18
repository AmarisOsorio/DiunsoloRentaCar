import React, { useRef, useEffect } from 'react';
import { Animated, TouchableOpacity, Image, StyleSheet } from 'react-native';


// Recibe props: brand, isSelected, onPress
export default function BrandLogo({ brand, isSelected, onPress, style }) {
       // Solo animar en el primer render
       const hasAnimated = useRef(false);
       const scaleAnim = useRef(new Animated.Value(isSelected ? 1.08 : 1)).current;
       useEffect(() => {
       if (!hasAnimated.current) {
	       if (isSelected) {
		       Animated.sequence([
			       Animated.timing(scaleAnim, {
				       toValue: 1.18,
				       duration: 120,
				       useNativeDriver: true,
			       }),
			       Animated.spring(scaleAnim, {
				       toValue: 1.08,
				       friction: 5,
				       useNativeDriver: true,
			       })
		       ]).start(() => { hasAnimated.current = true; });
	       } else {
		       Animated.sequence([
			       Animated.timing(scaleAnim, {
				       toValue: 0.92,
				       duration: 120,
				       useNativeDriver: true,
			       }),
			       Animated.spring(scaleAnim, {
				       toValue: 1,
				       friction: 5,
				       useNativeDriver: true,
			       })
		       ]).start(() => { hasAnimated.current = true; });
	       }
       } else {
	       scaleAnim.setValue(isSelected ? 1.08 : 1);
       }
       // eslint-disable-next-line react-hooks/exhaustive-deps
       }, []);
       return (
	       <Animated.View
		       style={[
			       localStyles.brandLogoWrapper,
			       isSelected && localStyles.brandLogoSelected,
			       style,
			       { transform: [{ scale: scaleAnim }] }
		       ]}
	       >
		       <TouchableOpacity
			       onPress={onPress}
			       activeOpacity={0.8}
			       style={[
				       localStyles.brandLogoContainer,
				       isSelected && localStyles.brandLogoContainerSelected
			       ]}
		       >
			       <Image
				       source={{ uri: brand.logo }}
				       style={localStyles.brandLogoFull}
				       resizeMode="cover"
			       />
		       </TouchableOpacity>
	       </Animated.View>
       );  
}
const localStyles = StyleSheet.create({
       brandLogoWrapper: {
	       marginRight: 16,
	       borderRadius: 18,
	       borderWidth: 0,
	       borderColor: 'transparent',
	       padding: 0,
       },
       brandLogoSelected: {
	       borderColor: '#3b6da6ff',
	       borderWidth: 4,
	       borderRadius: 18,
	       shadowColor: '#3b6da6ff',
	       shadowOpacity: 0.18,
	       shadowRadius: 8,
	       elevation: 6,
	       backgroundColor: '#eaf2fb',
       },
       brandLogoContainer: {
	       width: 54,
	       height: 54,
	       borderRadius: 14,
	       backgroundColor: '#fff',
	       borderWidth: 1,
	       borderColor: '#e0e0e0',
	       shadowColor: '#000',
	       shadowOpacity: 0.04,
	       shadowRadius: 4,
	       elevation: 1,
	       overflow: 'hidden',
	       justifyContent: 'center',
	       alignItems: 'center',
	       padding: 0,
	       transitionDuration: '200ms',
       },
       brandLogoContainerSelected: {
	       backgroundColor: '#eaf2fb',
       },
       brandLogoFull: {
	       width: '100%',
	       height: '100%',
	       borderRadius: 14,
       },
});

