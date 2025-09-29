import React, { useState } from 'react';
import { AuthProvider } from '../appMovil/src/Context/AuthContext';
import SplashScreen from './src/screens/SplashScreen/SplashScreen';
import AppNavigationContainer from './src/navigation/NavigatorContainer';

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashEnd = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onAnimationEnd={handleSplashEnd} />;
  }

  // AppNavigationContainer maneja su propia lógica de autenticación usando useAuth
  return <AppNavigationContainer />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}