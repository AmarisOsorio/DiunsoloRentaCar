import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
//import './components/styles/Navbar.css';
//import './components/styles/Footer.css';

/*********** C O M P O N E N T S ***************/

import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import ProtectedClientRoute from './components/protectedRoutes/ProtectedClientRoute';
import ProtectedRoute from './components/protectedRoutes/ProtectedRoute';

/*********** M O D A L S ***************/
import LoginModal from './components/modals/login/LoginModal';
import RegisterModal from './components/modals/register/RegisterModal';
import ForgotPasswordModal from './components/modals/forgotPassword/ForgotPasswordModal';

/*********** P A G E S ***************/
import Home from './Pages/home/Home';
import Catalogo from './Pages/catalog/Catalogo';
import Contacto from './Pages/contact/Contacto';
import TerminosCondiciones from './Pages/termsAndConditions/TerminosCondiciones';
import PerfilWrapper from './Pages/profile/PerfilWrapper';
import './App.css';

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
  const shouldShowFooter = !routesWithoutFooter.some(route =>
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  return (
    <>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={
            <ProtectedClientRoute>
              <Home />
            </ProtectedClientRoute>
          } />
          <Route path="/catalogo" element={
            <ProtectedClientRoute>
              <Catalogo />
            </ProtectedClientRoute>
          } />
          <Route path="/contacto" element={
            <ProtectedClientRoute>
              <Contacto />
            </ProtectedClientRoute>
          } />
          <Route path="/terminos" element={
            <ProtectedClientRoute>
              <TerminosCondiciones />
            </ProtectedClientRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedClientRoute>
              <PerfilWrapper />
            </ProtectedClientRoute>
          } />
          {/**
           * <Route path="/admin" element={<AdminDashboard />} />
           * <Route path="/admin/vehiculos" element={<AdminVehicles />} />
           * <Route path="/admin/usuarios" element={<AdminUsers />} />
           */}

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