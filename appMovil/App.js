import React, { useState } from 'react';
import { AuthProvider, useAuth } from '../appMovil/src/Context/AuthContext';
import SplashScreen from './src/screens/SplashScreen/SplashScreen';
import AppNavigationContainer from './src/navigation/NavigatorContainer';

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const { isAuthenticated } = useAuth();

  const handleSplashEnd = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onAnimationEnd={handleSplashEnd} />;
  }

  // Navigation handles auth logic
  return <AppNavigationContainer isAuthenticated={isAuthenticated} />;
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}