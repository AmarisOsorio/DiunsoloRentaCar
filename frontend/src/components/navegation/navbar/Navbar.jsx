// Navbar consistente para la app
import React, { useState, useEffect } from 'react';
import './Navbar.css';
import diunsoloImg from '../../../assets/diunsolologo.png';
import LangDropdown from '../langDropDown/LangDropdown.jsx';
import LoginModal from '../../home/loginSection/login/LoginModal.jsx';
import RegisterModal from '../../home/loginSection/register/RegisterModal.jsx';
import ForgotPasswordModal from '../../home/loginSection/forgotPassword/ForgotPasswordModal.jsx';
import { useNavbar } from './hooks/useNavbar.jsx';
import { useAuth } from '../../../context/AuthContext.jsx';
import Submenu from '../subMenu/submenu.jsx';
/*import AdminNavbar from './admin/AdminNavbar';*/
import { FaChevronDown } from 'react-icons/fa';

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
  const { userType, isAuthenticated } = useAuth();
  
  // Si ya es admin autenticado, mostrar directamente AdminNavbar sin delay
  /*if (isAuthenticated && userType === 'admin') {
    return <AdminNavbar />;
  }*/
  
  // Para usuarios normales y no autenticados, inicializar hooks del navbar normal
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
  
  const [rerenderFlag, setRerenderFlag] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);

  // Forzar re-render cuando cambia el estado de autenticación
  useEffect(() => {
    const isReallyAuthenticated = isAuthenticated || localStorage.getItem('isAuthenticated') === 'true';
    const handler = () => {
      setRerenderFlag(f => !f);
    };
    window.addEventListener('auth-changed', handler);
    return () => window.removeEventListener('auth-changed', handler);
  }, [isAuthenticated]);

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

  // Cerrar el submenú al hacer click fuera
  useEffect(() => {
    if (!submenuOpen) return;
    let closing = false;
    const handleClickOutside = (e) => {
      const submenu = document.getElementById('navbar-submenu');
      const btn = document.getElementById('navbar-profile-btn');
      if (!closing && submenu && !submenu.contains(e.target) && btn && !btn.contains(e.target)) {
        closing = true;
        const event = new Event('submenu-close');
        window.dispatchEvent(event);
        setTimeout(() => setSubmenuOpen(false), 300);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [submenuOpen]);

  const handleOpenRegister = () => {
    setLoginModalOpen(false);
    setTimeout(() => setRegisterModalOpen(true), 10);
  };
  
  const handleOpenLogin = () => {
    setRegisterModalOpen(false);
    setTimeout(() => setLoginModalOpen(true), 10);
  };

  const handleNavClick = () => setMobileMenuOpen(false);

  const handleCloseRegister = () => {
    setRegisterModalOpen(false);
  };

  React.useEffect(() => {
    if (loginModalOpen && isAuthenticated) {
      setLoginModalOpen(false);
    }
  }, [isAuthenticated]);

  // Forzar lectura de localStorage si el contexto no refleja el login
  const isReallyAuthenticated = isAuthenticated || localStorage.getItem('isAuthenticated') === 'true';

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
            {isReallyAuthenticated ? (
              <div style={{ position: 'relative', width: '100%' }}>
                <button
                  id="navbar-profile-btn"
                  className="login-btn navbar-profile-btn"
                  onClick={() => setSubmenuOpen(v => !v)}
                  aria-haspopup="true"
                  aria-expanded={submenuOpen}
                >
                  <span className="navbar-profile-content">
                    Mi perfil
                    <span className={`navbar-profile-arrow${submenuOpen ? ' open' : ''}`} aria-hidden="true">
                      <FaChevronDown />
                    </span>
                  </span>
                </button>
                {submenuOpen && (
                  <div id="navbar-submenu" style={{ position: 'absolute', left: 0, right: 0, zIndex: 2000 }}>
                    <Submenu onClose={() => setSubmenuOpen(false)} />
                  </div>
                )}
              </div>
            ) : (
              <button
                className="login-btn"
                onClick={() => {
                  setLoginModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                style={{ width: '100%', marginTop: '0.5rem' }}
              >
                Iniciar sesión
              </button>
            )}
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
          {isReallyAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                id="navbar-profile-btn"
                className="login-btn navbar-profile-btn"
                onClick={() => setSubmenuOpen(v => !v)}
                aria-haspopup="true"
                aria-expanded={submenuOpen}
              >
                <span className="navbar-profile-content">
                  Mi perfil
                  <span className={`navbar-profile-arrow${submenuOpen ? ' open' : ''}`} aria-hidden="true">
                    <FaChevronDown />
                  </span>
                </span>
              </button>
              {submenuOpen && (
                <div id="navbar-submenu" style={{ position: 'absolute', right: 0, top: '110%', zIndex: 2000 }}>
                  <Submenu onClose={() => setSubmenuOpen(false)} />
                </div>
              )}
            </div>
          ) : (
            <button className="login-btn" onClick={() => setLoginModalOpen(true)}>Iniciar sesión</button>
          )}
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
          setTimeout(() => setLoginModalOpen(true), 100);
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
