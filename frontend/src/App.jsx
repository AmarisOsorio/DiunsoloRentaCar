import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './components/styles/Navbar.css';
import './components/styles/Footer.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './Pages/Home';
import Catalogo from './Pages/Catalogo';
import Contacto from './Pages/Contacto';
import TerminosCondiciones from './Pages/TerminosCondiciones';
import Perfil from './Pages/Perfil';
import './App.css';
import LoginModal from './components/modals/LoginModal';
import RegisterModal from './components/modals/RegisterModal';
import ForgotPasswordModal from './components/modals/ForgotPasswordModal';
import { AuthProvider } from './context/AuthContext';

/**
 * Componente interno que maneja las rutas y la visibilidad condicional del footer
 */
const AppContent = () => {
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Cuando se cierra el modal de registro, también limpia el estado de éxito
  const handleCloseRegister = () => {
    setShowRegisterModal(false);
    // No es necesario limpiar aquí, el RegisterModal ya lo hace con useEffect
  };

  // Rutas donde no se debe mostrar el footer
  const routesWithoutFooter = ['/perfil'];
  const shouldShowFooter = !routesWithoutFooter.includes(location.pathname);

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/terminos" element={<TerminosCondiciones />} />
          <Route path="/perfil" element={<Perfil />} />
        </Routes>
        <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} onOpenRegister={() => { setShowLoginModal(false); setShowRegisterModal(true); }} onOpenForgot={() => { setShowLoginModal(false); setShowForgotModal(true); }} />
        <RegisterModal open={showRegisterModal} onClose={handleCloseRegister} onSwitchToLogin={() => { setShowRegisterModal(false); setShowLoginModal(true); }} />
        <ForgotPasswordModal open={showForgotModal} onClose={() => { setShowForgotModal(false); setShowLoginModal(true); }} />
      </main>
      {shouldShowFooter && <Footer />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;