import { useState, useRef, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function useNavbar(navLinks) {
  const [lang, setLang] = useState('es');
  const [langOpen, setLangOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const location = useLocation();
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
  }, [location.pathname, navLinks]);

  const handleLangBtnClick = () => setLangOpen(prev => !prev);
  const handleLangBlur = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setLangOpen(false);
    }
  };
  const handleLangSelect = (value) => {
    setLang(value);
    setLangOpen(false);
  };

  return {
    lang,
    setLang,
    langOpen,
    setLangOpen,
    loginModalOpen,
    setLoginModalOpen,
    location,
    linksRef,
    underlineRef,
    underlineStyle,
    handleLangBtnClick,
    handleLangBlur,
    handleLangSelect
  };
}
