// Ejemplo de Footer consistente para la app
import React from 'react';
import diunsolologo from '../../assets/diunsolologo.png';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-logo">
      <img
        src={diunsolologo}
        alt="DiunsoloRentaCar"
        className="footer-logo-img"
      />
    </div>
    <div className="footer-links-row">
      <div>
        <a href="/contacto" className="footer-link">Contáctanos</a>
      </div>
      <div>
        <div className="footer-dev-title">Desarrolladores</div>
        <div className="footer-social-row">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social"><i className="fab fa-facebook-f"></i></a>
          <a href="https://wa.me/50300000000" target="_blank" rel="noopener noreferrer" className="footer-social"><i className="fab fa-whatsapp"></i></a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social"><i className="fab fa-instagram"></i></a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-social"><i className="fab fa-youtube"></i></a>
        </div>
      </div>
      <div>
        <Link to="/terminos" className="footer-link">Términos y condiciones</Link>
      </div>
    </div>
    <div className="footer-desc">
      Somos una empresa 100% salvadoreña con servicio personalizado en <span className="footer-desc-bold">renta de vehículos a extranjeros y nacionales</span>. Nuestro servicio es calidad y profesionalismo.
    </div>
    <div className="footer-copyright">
      © {new Date().getFullYear()} DiunsoloRentaCar. Todos los derechos reservados.
    </div>
  </footer>
);

export default Footer;
