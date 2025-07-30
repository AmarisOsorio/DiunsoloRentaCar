import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

/*********** C O M P O N E N T S ***************/
import Navbar from './components/navegation/navbar/Navbar';
import Footer from './components/navegation/footer/Footer';
import ProtectedRoute from './components/navegation/protectedRoutes/ProtectedRoute';

/*********** M O D A L S ***************/
import LoginModal from './components/home/loginSection/login/LoginModal';
import RegisterModal from './components/home/loginSection/register/RegisterModal';
import ForgotPasswordModal from './components/home/loginSection/forgotPassword/ForgotPasswordModal';

/*********** P A G E S ***************/
import Home from './Pages/home/Home';
import Catalog from './Pages/catalog/Catalog.jsx';
import Contact from './Pages/contact/Contact.jsx';
import TermsAndConditions from './Pages/termsAndConditions/TerminosCondiciones.jsx';
import Profile from './Pages/profile/Profile'
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
              <Home />
          } />
          <Route path="/catalogo" element={
              <Catalog />
          } />
          <Route path="/contacto" element={
              <Contact />
          } />
          <Route path="/terminos" element={
              <TermsAndConditions />
          } />

         
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Profile/>
            </ProtectedRoute>
          } />
          

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