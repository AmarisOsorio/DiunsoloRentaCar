import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function useSubmenuLog() {
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleLogout = (e) => {
    if (e) e.preventDefault();
    setShowLogoutModal(true);
  };
  const confirmLogout = async () => {
    setShowLogoutModal(false);
    setShowSuccess(true); // Mostrar animación inmediatamente
    setTimeout(async () => {
      await logout();
      window.location.href = '/';
    }, 2200); // Espera a mostrar la animación antes de cerrar sesión y redirigir
  };
  const cancelLogout = () => setShowLogoutModal(false);

  return {
    showLogoutModal,
    handleLogout,
    confirmLogout,
    cancelLogout,
    showSuccess,
    setShowSuccess
  };
}
