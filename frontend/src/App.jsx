import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './components/styles/Navbar.css';
import './components/styles/Footer.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './Pages/Home';
import Catalogo from './Pages/Catalogo';
import Contacto from './Pages/Contacto';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/contacto" element={<Contacto />} />
        </Routes>
      
      <Footer />
    </Router>
  );
}

export default App;
