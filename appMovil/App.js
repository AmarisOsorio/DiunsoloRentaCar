import React, { useState } from 'react';
import { AuthProvider } from './src/Context/AuthContext';
import SplashScreen from './src/screens/SplashScreen/SplashScreen';
import Navigation from './src/navigation/Navigation';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <AuthProvider>
      {showSplash ? (
        <SplashScreen onAnimationEnd={() => setShowSplash(false)} />
      ) : (
        <Navigation />
      )}
    </AuthProvider>
  );
}