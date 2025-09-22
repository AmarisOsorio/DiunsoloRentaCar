import React, { useState } from 'react';
import { AuthProvider } from '../appMovil/src/Context/AuthContext';
import SplashScreen from './src/screens/SplashScreen/SplashScreen';
import AppNavigationContainer from './src/navigation/NavigatorContainer';

// Componente interno que tiene acceso al contexto de autenticación
const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashEnd = () => {
    setShowSplash(false);
  };

  // Si aún se está mostrando el splash, renderizarlo
  if (showSplash) {
    return <SplashScreen onAnimationEnd={handleSplashEnd} />;
  }

  // Una vez terminado el splash, mostrar la navegación principal que maneja la autenticación
  return <AppNavigationContainer />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}