import { useState, useRef, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';

export function useNavbar(navLinks) {
  // React Hook Form para idioma y loginModalOpen
  const {
    register,
    setValue,
    watch,
    formState: { errors },
    handleSubmit
  } = useForm({
    defaultValues: {
      lang: 'es',
      loginModalOpen: false
    }
  });

  const lang = watch('lang');
  const loginModalOpen = watch('loginModalOpen');
  const [langOpen, setLangOpen] = useState(false);
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
    setValue('lang', value);
    setLangOpen(false);
  };
  const setLoginModalOpen = (v) => setValue('loginModalOpen', v);

  return {
    lang,
    setLang: v => setValue('lang', v),
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
    handleLangSelect,
    register,
    handleSubmit,
    setValue,
    watch,
    errors
  };
}
