import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/modals/TooltipPortal.css';

const TOOLTIP_WIDTH = 180;
const TOOLTIP_GAP = 10;

const TooltipPortal = ({ targetRef, children, visible, fieldName }) => {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const tooltipRef = useRef();
  const observerRef = useRef();
  const resizeObserverRef = useRef();

  // Detectar si es mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Función para actualizar la posición
  const updateCoords = () => {
    if (targetRef.current && visible) {
      const rect = targetRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      });
    }
  };

  // Recalcular posición cuando cambia el campo, el mensaje, o la visibilidad
  useEffect(() => {
    if (!visible) return;
    // Esperar al próximo tick para asegurar que el DOM esté listo
    const raf = requestAnimationFrame(updateCoords);
    return () => cancelAnimationFrame(raf);
  }, [visible, fieldName, children]);

  // Recalcular en scroll y resize
  useEffect(() => {
    if (!visible) return;
    window.addEventListener('scroll', updateCoords, true);
    window.addEventListener('resize', updateCoords, true);
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords, true);
    };
  }, [visible, targetRef]);

  // Usar MutationObserver y ResizeObserver para detectar cambios en el input
  useEffect(() => {
    if (!visible || !targetRef.current) return;
    // MutationObserver para cambios en el input
    observerRef.current = new window.MutationObserver(updateCoords);
    observerRef.current.observe(targetRef.current, { attributes: true, childList: true, subtree: true });
    // ResizeObserver para cambios de tamaño
    if (window.ResizeObserver) {
      resizeObserverRef.current = new window.ResizeObserver(updateCoords);
      resizeObserverRef.current.observe(targetRef.current);
    }
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
    };
  }, [visible, targetRef, fieldName]);

  if (!visible) return null;

  // Posición dinámica mejorada
  let style = {};
  let arrowClass = 'fb-error-tooltip-arrow';
  const tooltipHeight = tooltipRef.current?.offsetHeight || 48; // fallback más seguro
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const rightSpace = viewportWidth - (coords.left + coords.width + TOOLTIP_GAP + TOOLTIP_WIDTH);
  const leftSpace = coords.left - TOOLTIP_WIDTH - TOOLTIP_GAP;

  if (isMobile) {
    // En mobile, mostrar debajo del input
    let left = Math.max(coords.left, 8);
    if (left + TOOLTIP_WIDTH > viewportWidth - 8) {
      left = viewportWidth - TOOLTIP_WIDTH - 8;
    }
    style = {
      position: 'fixed',
      top: Math.min(coords.top + coords.height + TOOLTIP_GAP, viewportHeight - tooltipHeight - 8),
      left,
      width: Math.min(TOOLTIP_WIDTH, viewportWidth - 16),
      zIndex: 9999
    };
    arrowClass += ' fb-error-tooltip-arrow-top';
  } else if (leftSpace > 0) {
    // Mostrar a la izquierda (PRIORIDAD)
    let top = coords.top + coords.height / 2 - tooltipHeight / 2;
    if (top < 8) top = 8;
    if (top + tooltipHeight > viewportHeight - 8) top = viewportHeight - tooltipHeight - 8;
    style = {
      position: 'fixed',
      top,
      left: coords.left - TOOLTIP_WIDTH - TOOLTIP_GAP,
      zIndex: 9999
    };
    arrowClass += ' fb-error-tooltip-arrow-right';
  } else if (rightSpace > 0) {
    // Mostrar a la derecha SOLO si no hay espacio a la izquierda
    let top = coords.top + coords.height / 2 - tooltipHeight / 2;
    if (top < 8) top = 8;
    if (top + tooltipHeight > viewportHeight - 8) top = viewportHeight - tooltipHeight - 8;
    style = {
      position: 'fixed',
      top,
      left: coords.left + coords.width + TOOLTIP_GAP,
      zIndex: 9999
    };
    arrowClass += ' fb-error-tooltip-arrow-left';
  } else {
    // Fallback: encima del input
    let top = Math.max(coords.top - tooltipHeight - TOOLTIP_GAP, 8);
    let left = Math.max(coords.left, 8);
    if (left + TOOLTIP_WIDTH > viewportWidth - 8) {
      left = viewportWidth - TOOLTIP_WIDTH - 8;
    }
    style = {
      position: 'fixed',
      top,
      left,
      zIndex: 9999
    };
    arrowClass += ' fb-error-tooltip-arrow-bottom';
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
