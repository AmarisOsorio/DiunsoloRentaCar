// Navbar consistente para la app
import React, { useState, useRef, useLayoutEffect } from 'react';
import './styles/Navbar.css';
import diunsoloImg from '.././assets/diunsolologo.png';
import LangDropdown from './LangDropdown';
import { useLocation } from 'react-router-dom';

const Navbar = () => {
  const [lang, setLang] = React.useState('es');
  const [langOpen, setLangOpen] = React.useState(false);
  const location = useLocation();
  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' }
  ];
  const navLinks = [
    { to: '/', label: 'Inicio', match: ['/','/Home'] },
    { to: '/catalogo', label: 'Catálogo', match: ['/catalogo'] },
    { to: '/contacto', label: 'Contáctanos', match: ['/contacto'] },
  ];

  // Sliding underline logic
  const linksRef = useRef([]);
  const underlineRef = useRef(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0, opacity: 0 });

  useLayoutEffect(() => {
    const activeIdx = navLinks.findIndex(link => link.match.some(path => location.pathname.toLowerCase() === path));
    if (activeIdx !== -1 && linksRef.current[activeIdx]) {
      const el = linksRef.current[activeIdx];
      const { left, width } = el.getBoundingClientRect();
      const parentLeft = el.parentElement.parentElement.getBoundingClientRect().left;
      setUnderlineStyle({
        left: left - parentLeft,
        width,
        opacity: 1
      });
    } else {
      setUnderlineStyle({ left: 0, width: 0, opacity: 0 });
    }
  }, [location.pathname]);

  // Detect open/close for animation
  const handleLangBtnClick = () => setLangOpen((prev) => !prev);
  const handleLangBlur = (e) => {
    // Solo cerrar si el foco sale completamente del wrapper
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setLangOpen(false);
    }
  };
  const handleLangSelect = (value) => {
    setLang(value);
    setLangOpen(false);
  };

  return (
    <nav className="navbar">
      <img className="navbar-img" src={diunsoloImg} alt="Diunsolo Logo" />
      <div className="navbar-center">
        <ul className="navbar-links" style={{ position: 'relative' }}>
          {navLinks.map((link, idx) => {
            const isActive = link.match.some(path => location.pathname.toLowerCase() === path);
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
        <button className="login-btn">Iniciar sesión</button>
      </div>
    </nav>
  );
};

export default Navbar;
