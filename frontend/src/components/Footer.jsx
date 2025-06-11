// Ejemplo de Footer consistente para la app
import React from 'react';
import diunsolologo from '../assets/diunsolologo.png';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={{
    background: '#05227b',
    color: '#fff',
    padding: '2.5rem 1rem 1.5rem 1rem',
    textAlign: 'center',
    fontFamily: 'inherit'
  }}>
    <div style={{ marginBottom: 18 }}>
      <img
        src={diunsolologo}
        alt="DiunsoloRentaCar"
        style={{ height: 90, width: 240, marginBottom: 10 }}
      />
    </div>
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '4rem',
      marginBottom: 18,
      flexWrap: 'wrap'
    }}>
      <div>
        <a
          href="/contacto"
          style={{
            fontSize: 20,
            fontWeight: 400,
            marginBottom: 8,
            color: "#fff",
            textDecoration: "none",
            transition: "color 0.2s"
          }}
        >
          Contáctanos
        </a>
      </div>
      <div>
        <div style={{ fontSize: 20, fontWeight: 400, marginBottom: 8 }}>Desarrolladores</div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}>
            <i className="fab fa-facebook-f" style={{ fontSize: 22 }}></i>
          </a>
          <a href="https://wa.me/50300000000" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}>
            <i className="fab fa-whatsapp" style={{ fontSize: 22 }}></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}>
            <i className="fab fa-instagram" style={{ fontSize: 22 }}></i>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" style={{ color: '#fff' }}>
            <i className="fab fa-youtube" style={{ fontSize: 22 }}></i>
          </a>
        </div>
      </div>
      <div>
        <Link
          to="/terminos"
          style={{
            fontSize: 20,
            fontWeight: 400,
            marginBottom: 8,
            color: "#fff",
            textDecoration: "none",
            transition: "color 0.2s"
          }}
        >
          Términos y condiciones
        </Link>
      </div>
    </div>
    <div style={{
      color: '#bfc8e6',
      fontSize: 15,
      maxWidth: 700,
      margin: '18px auto 0 auto',
      fontWeight: 400
    }}>
      Somos una empresa 100% salvadoreña con servicio personalizado en <span style={{ fontWeight: 600, color: '#fff' }}>renta de vehículos a extranjeros y nacionales</span>. Nuestro servicio es calidad y profesionalismo.
    </div>
    <div style={{
      color: '#bfc8e6',
      fontSize: 14,
      marginTop: 18
    }}>
      © {new Date().getFullYear()} DiunsoloRentaCar. Todos los derechos reservados.
    </div>
  </footer>
);

export default Footer;
