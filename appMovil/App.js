import React, { useState } from 'react';
import Navigation from './src/navigation/Navigation.js';
import { AuthProvider } from './src/Context/AuthContext';
import SplashScreen from './src/screens/Components/SplashScreen';

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