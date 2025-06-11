import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './components/styles/Navbar.css';
import './components/styles/Footer.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './Pages/Home';
import Catalogo from './Pages/Catalogo';
import Contacto from './Pages/Contacto';
import TerminosCondiciones from './Pages/TerminosCondiciones';
import './App.css';
import LoginModal from './components/modals/LoginModal';
import RegisterModal from './components/modals/RegisterModal';
import ForgotPasswordModal from './components/modals/ForgotPasswordModal';

function App() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);

  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/terminos" element={<TerminosCondiciones />} />
        </Routes>
        <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} onOpenRegister={() => { setShowLoginModal(false); setShowRegisterModal(true); }} onOpenForgot={() => { setShowLoginModal(false); setShowForgotModal(true); }} />
        <RegisterModal open={showRegisterModal} onClose={() => setShowRegisterModal(false)} onSwitchToLogin={() => { setShowRegisterModal(false); setShowLoginModal(true); }} />
        <ForgotPasswordModal open={showForgotModal} onClose={() => setShowForgotModal(false)} />
      </main>
      <Footer />
    </Router>
  );
}

export default App;
