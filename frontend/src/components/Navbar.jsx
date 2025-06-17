// Navbar consistente para la app
import React, { useState, useEffect } from 'react';
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
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  // Cerrar menú móvil si cambia a vista desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 700 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const handleOpenRegister = () => {
    setLoginModalOpen(false);
    setTimeout(() => setRegisterModalOpen(true), 10);
  };
  const handleOpenLogin = () => {
    setRegisterModalOpen(false);
    setTimeout(() => setLoginModalOpen(true), 10);
  };

  // Cerrar menú móvil al navegar
  const handleNavClick = () => setMobileMenuOpen(false);

  // Cuando se cierra el modal de registro, también limpia el estado de éxito
  const handleCloseRegister = () => {
    setRegisterModalOpen(false);
    // No es necesario limpiar aquí, el RegisterModal ya lo hace con useEffect
  };

  return (
    <nav className="navbar">
      <img className="navbar-img" src={diunsoloImg} alt="Diunsolo Logo" style={{ marginLeft: 0 }} />
      <div className={`navbar-center${mobileMenuOpen ? ' navbar-center-mobile-open' : ''}`}>
        <ul className="navbar-links" style={{ position: 'relative' }}>
          {navLinks.map((link, idx) => {
            const isActive = link.match.some(path => window.location.pathname.toLowerCase() === path);
            return (
              <li key={link.to} onClick={handleNavClick}>
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
        {/* Acciones móviles integradas debajo del menú de páginas */}
        {mobileMenuOpen && (
          <div className="navbar-mobile-actions navbar-mobile-actions-column">
            <LangDropdown
              open={langOpen}
              current={lang}
              languages={languages}
              onSelect={handleLangSelect}
              onBlur={handleLangBlur}
              onBtnClick={handleLangBtnClick}
            />
            <button
              className="login-btn"
              onClick={() => {
                setLoginModalOpen(true);
                setMobileMenuOpen(false); // Cierra el menú móvil al abrir login
              }}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              Iniciar sesión
            </button>
          </div>
        )}
      </div>
      <div className="navbar-right">
        {/* Solo mostrar en desktop (cuando el botón hamburguesa NO es visible) */}
        <span className="navbar-desktop-actions">
          <LangDropdown
            open={langOpen}
            current={lang}
            languages={languages}
            onSelect={handleLangSelect}
            onBlur={handleLangBlur}
            onBtnClick={handleLangBtnClick}
          />
          <button className="login-btn" onClick={() => setLoginModalOpen(true)}>Iniciar sesión</button>
        </span>
      </div>
      <LoginModal 
        open={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)} 
        onOpenRegister={handleOpenRegister}
        onOpenForgot={() => {
          setLoginModalOpen(false);
          setForgotModalOpen(true);
        }}
      />
      <RegisterModal open={registerModalOpen} onClose={handleCloseRegister} onSwitchToLogin={handleOpenLogin} />
      <ForgotPasswordModal 
        open={forgotModalOpen} 
        onClose={() => setForgotModalOpen(false)}
        onBackToLogin={() => {
          setForgotModalOpen(false);
          setTimeout(() => setLoginModalOpen(true), 100); // Cambia a 100ms para abrir más rápido
        }}
      />
      <button
        className="navbar-hamburger"
        onClick={() => setMobileMenuOpen(v => !v)}
        aria-label="Abrir menú"
        style={
          (loginModalOpen || registerModalOpen || forgotModalOpen)
            ? { zIndex: 1, position: 'relative' }
            : {}
        }
      >
        <span className="navbar-hamburger-bar" />
        <span className="navbar-hamburger-bar" />
        <span className="navbar-hamburger-bar" />
      </button>
    </nav>
  );
};

export default Navbar;
