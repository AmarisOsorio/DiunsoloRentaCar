// Ejemplo de Footer consistente para la app
import React from 'react';
import './styles/Footer.css';

const Footer = () => (
  <footer className="footer">
    <p>© {new Date().getFullYear()} DiunsoloRentaCar. Todos los derechos reservados.</p>
  </footer>
);

export default Footer;
