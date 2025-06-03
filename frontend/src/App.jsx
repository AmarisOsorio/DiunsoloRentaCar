import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './components/styles/Navbar.css';
import './components/styles/Footer.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './Pages/Home';
import Catalogo from './Pages/Catalogo';
import Contacto from './Pages/Contacto';
import './App.css';
import LoginModal from './components/modals/LoginModal';
import RegisterModal from './components/modals/RegisterModal';
import ForgotPasswordModal from './components/modals/ForgotPasswordModal';

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgot, setShowForgot] = useState(false);

  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/contacto" element={<Contacto />} />
        </Routes>
        <LoginModal open={showLogin} onClose={() => setShowLogin(false)} onOpenRegister={() => { setShowLogin(false); setShowRegister(true); }} onOpenForgot={() => { setShowLogin(false); setShowForgot(true); }} />
        <RegisterModal open={showRegister} onClose={() => setShowRegister(false)} onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }} />
        <ForgotPasswordModal open={showForgot} onClose={() => setShowForgot(false)} />
      </main>
      <Footer />
    </Router>
  );
}

export default App;
