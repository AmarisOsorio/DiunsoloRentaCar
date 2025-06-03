import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/modals/TooltipPortal.css';

const TOOLTIP_WIDTH = 180;
const TOOLTIP_GAP = 10;

const TooltipPortal = ({ targetRef, children, visible }) => {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef();

  // Detectar si es mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Actualizar posición
  const updateCoords = () => {
    if (targetRef.current && visible) {
      const rect = targetRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
    }
  };

  useEffect(() => {
    updateCoords();
    if (!visible) return;
    window.addEventListener('scroll', updateCoords, true);
    window.addEventListener('resize', updateCoords, true);
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords, true);
    };
  }, [targetRef, visible]);

  if (!visible) return null;

  // Posición dinámica
  let style = {};
  let arrowClass = 'fb-error-tooltip-arrow';
  if (isMobile) {
    style = {
      top: coords.top + coords.height + 8, // debajo del input
      left: coords.left + coords.width / 2, // centrar respecto al input
      minWidth: coords.width,
      maxWidth: '90vw',
      transform: 'translateX(-50%)',
    };
    arrowClass += ' fb-error-tooltip-arrow-top';
  } else {
    style = {
      top: coords.top,
      left: coords.left - TOOLTIP_WIDTH - TOOLTIP_GAP
    };
  }

  return createPortal(
    <div
      ref={tooltipRef}
      className="fb-error-tooltip fb-error-tooltip-portal"
      style={style}
    >
      <span className={arrowClass}></span>
      {children}
    </div>,
    document.body
  );
};

export default TooltipPortal;
