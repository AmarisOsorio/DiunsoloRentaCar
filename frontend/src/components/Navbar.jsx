// Navbar consistente para la app
import React, { useState } from 'react';
import './styles/Navbar.css';
import diunsoloImg from '.././assets/diunsolologo.png';
import LangDropdown from './LangDropdown';
import LoginModal from './modals/LoginModal';
import RegisterModal from './modals/RegisterModal';
import ForgotPasswordModal from './modals/ForgotPasswordModal';
import { useNavbar } from '../hooks/useNavbar.jsx';

const languages = [
  { value: 'es', label: 'Español' },
  { value: 'en', label: 'English' }
];
const navLinks = [
  { to: '/', label: 'Inicio', match: ['/','/Home'] },
  { to: '/catalogo', label: 'Catálogo', match: ['/catalogo'] },
  { to: '/contacto', label: 'Contáctanos', match: ['/contacto'] },
];

const Navbar = () => {
  const {
    lang,
    langOpen,
    linksRef,
    underlineRef,
    underlineStyle,
    handleLangBtnClick,
    handleLangBlur,
    handleLangSelect,
  } = useNavbar(navLinks);

  // Controlar ambos modales aquí
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);

  const handleOpenRegister = () => {
    setLoginModalOpen(false);
    setTimeout(() => setRegisterModalOpen(true), 10);
  };
  const handleOpenLogin = () => {
    setRegisterModalOpen(false);
    setTimeout(() => setLoginModalOpen(true), 10);
  };

  return (
    <nav className="navbar">
      <img className="navbar-img" src={diunsoloImg} alt="Diunsolo Logo" />
      <div className="navbar-center">
        <ul className="navbar-links" style={{ position: 'relative' }}>
          {navLinks.map((link, idx) => {
            const isActive = link.match.some(path => window.location.pathname.toLowerCase() === path);
            return (
              <li key={link.to}>
                <a
                  href={link.to}
                  className={`navbar-link${isActive ? ' active' : ''}`}
                  ref={el => linksRef.current[idx] = el}
                >
                  {link.label}
                </a>
              </li>
            );
          })}
          <span
            ref={underlineRef}
            className="navbar-shared-underline"
            style={{
              left: underlineStyle.left,
              width: underlineStyle.width,
              opacity: underlineStyle.opacity
            }}
          />
        </ul>
      </div>
      <div className="navbar-right">
        <LangDropdown
          open={langOpen}
          current={lang}
          languages={languages}
          onSelect={handleLangSelect}
          onBlur={handleLangBlur}
          onBtnClick={handleLangBtnClick}
        />
        <button className="login-btn" onClick={() => setLoginModalOpen(true)}>Iniciar sesión</button>
        <LoginModal 
          open={loginModalOpen} 
          onClose={() => setLoginModalOpen(false)} 
          onOpenRegister={handleOpenRegister}
          onOpenForgot={() => setForgotModalOpen(true)}
        />
        <RegisterModal open={registerModalOpen} onClose={() => setRegisterModalOpen(false)} onSwitchToLogin={handleOpenLogin} />
        <ForgotPasswordModal open={forgotModalOpen} onClose={() => setForgotModalOpen(false)} />
      </div>
    </nav>
  );
};

export default Navbar;
