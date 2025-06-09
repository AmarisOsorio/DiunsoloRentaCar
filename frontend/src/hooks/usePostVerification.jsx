import { useEffect } from 'react';

/**
 * Hook para manejar acciones post-verificación:
 * - Enviar correo de bienvenida
 * - Login automático
 * - Redirección
 */
const usePostVerification = ({ success, email, password, onClose, redirectUrl = '/catalogo' }) => {
  useEffect(() => {
    if (success) {
      // 1. Enviar correo de bienvenida
      if (email) {
        fetch('/api/send-welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ correo: email })
        }).catch(() => {});
      }
      // 2. Login automático y redirección
      const timer = setTimeout(async () => {
        if (email && password) {
          try {
            const res = await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ correo: email, contraseña: password })
            });
            // No importa el resultado, redirige igual
          } catch {}
        }
        onClose && onClose();
        window.location.href = redirectUrl;
      }, 3000); // Espera 3 segundos para mostrar la animación
      return () => clearTimeout(timer);
    }
  }, [success, email, password, onClose, redirectUrl]);
};

export default usePostVerification;
