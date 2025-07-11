import React, { useState, useEffect, useRef } from 'react';
import '../styles/Navbar.css'; // Usar estilos del navbar público
import './styles/AdminNavbar.css'; // Estilos específicos adicionales
import diunsoloImg from '../../assets/diunsolologo.png';
import { useAuth } from '../../context/AuthContext';
import LogoutConfirmModal from '../modals/LogoutConfirmModal';
import Submenu from '../submenu';
import { FaChevronDown } from 'react-icons/fa';

const adminNavLinks = [
  { to: '/admin', label: 'Inicio', match: ['/admin'] },
  { to: '/admin/vehiculos', label: 'Vehículos', match: ['/admin/vehiculos'] },
  { to: '/admin/usuarios', label: 'Usuarios', match: ['/admin/usuarios'] },
];

const AdminNavbar = () => {
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [showLogoutSuccess, setShowLogoutSuccess] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const linksRef = useRef([]);
  const underlineRef = useRef(null);
  const [underlineStyle, setUnderlineStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0
  });

  // Configurar subrayado animado - adaptado del navbar público
  useEffect(() => {
    const updateUnderline = () => {
      const activeIndex = adminNavLinks.findIndex(link => 
        link.match.some(path => window.location.pathname.toLowerCase() === path.toLowerCase())
      );
      
      if (activeIndex !== -1 && linksRef.current[activeIndex]) {
        const activeLink = linksRef.current[activeIndex];
        const linkRect = activeLink.getBoundingClientRect();
        const navRect = activeLink.closest('.navbar-links').getBoundingClientRect();
        
        setUnderlineStyle({
          left: linkRect.left - navRect.left,
          width: linkRect.width,
          opacity: 1
        });
      } else {
        setUnderlineStyle(prev => ({ ...prev, opacity: 0 }));
      }
    };

    updateUnderline();
    window.addEventListener('resize', updateUnderline);
    
    return () => window.removeEventListener('resize', updateUnderline);
  }, []);

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

  const handleNavClick = () => setMobileMenuOpen(false);

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const handleLogoutConfirm = () => {
    setLogoutModalOpen(false);
    setShowLogoutSuccess(true);
    
    // Mostrar animación de éxito y luego ejecutar logout
    setTimeout(() => {
      logout();
    }, 1500);
  };

  const handleLogoutCancel = () => {
    setLogoutModalOpen(false);
  };

  return (
    <nav className="navbar admin-navbar-wrapper">
      <img className="navbar-img" src={diunsoloImg} alt="Diunsolo Logo" style={{ marginLeft: 0 }} />
      
      <div className={`navbar-center${mobileMenuOpen ? ' navbar-center-mobile-open' : ''}`}>
        <ul className="navbar-links" style={{ position: 'relative' }}>
          {adminNavLinks.map((link, idx) => {
            const isActive = link.match.some(path => 
              window.location.pathname.toLowerCase() === path.toLowerCase()
            );
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
            <button
              className="login-btn navbar-profile-btn"
              onClick={() => setSubmenuOpen(v => !v)}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <span className="navbar-profile-content">
                Admin
                <span className={`navbar-profile-arrow${submenuOpen ? ' open' : ''}`} aria-hidden="true">
                  <FaChevronDown />
                </span>
              </span>
            </button>
            {submenuOpen && (
              <div style={{ position: 'relative', width: '100%', marginTop: '0.5rem' }}>
                <Submenu onClose={() => setSubmenuOpen(false)} />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="navbar-right">
        {/* Solo mostrar en desktop (cuando el botón hamburguesa NO es visible) */}
        <span className="navbar-desktop-actions">
          <div style={{ position: 'relative' }}>
            <button
              className="login-btn navbar-profile-btn"
              onClick={() => setSubmenuOpen(v => !v)}
              aria-haspopup="true"
              aria-expanded={submenuOpen}
            >
              <span className="navbar-profile-content">
                Admin
                <span className={`navbar-profile-arrow${submenuOpen ? ' open' : ''}`} aria-hidden="true">
                  <FaChevronDown />
                </span>
              </span>
            </button>
            {submenuOpen && (
              <div style={{ position: 'absolute', right: 0, top: '110%', zIndex: 2000 }}>
                <Submenu onClose={() => setSubmenuOpen(false)} />
              </div>
            )}
          </div>
        </span>
      </div>

      {/* Botón hamburguesa */}
      <button
        className="navbar-hamburger"
        onClick={() => setMobileMenuOpen(v => !v)}
        aria-label="Abrir menú"
      >
        <span className="navbar-hamburger-bar" />
        <span className="navbar-hamburger-bar" />
        <span className="navbar-hamburger-bar" />
      </button>
      
      {/* Modal de confirmación de logout */}
      <LogoutConfirmModal
        isOpen={logoutModalOpen}
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
        showSuccess={showLogoutSuccess}
      />
    </nav>
  );
};

export default AdminNavbar;
