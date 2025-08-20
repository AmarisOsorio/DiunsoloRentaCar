import React, { useState } from 'react';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import SplashScreen from './src/screens/SplashScreen/SplashScreen';
import LoginScreen from './src/screens/Login/LoginScreen';
import AppNavigationContainer from './src/navigation/NavigatorContainer';

// Componente interno que tiene acceso al contexto de autenticación
const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated } = useAuth();

  const handleSplashEnd = () => {
    setShowSplash(false);
  };

  // Si aún se está mostrando el splash, renderizarlo
  if (showSplash) {
    return <SplashScreen onAnimationEnd={handleSplashEnd} />;
  }

  // Una vez terminado el splash, mostrar login o app principal según autenticación
  return isAuthenticated ? <AppNavigationContainer /> : <LoginScreen />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}