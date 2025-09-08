import React, { useEffect, useRef, useState } from 'react';
import './submenu.css';
import LogoutConfirmModal from '../../home/loginSection/logout/LogoutConfirmModal.jsx';
import { useSubmenuLog } from './hooks/useSubmenuLog.js';
import { useAuth } from '../../../hooks/useAuth.js';


const ANIMATION_OUT_DURATION = 280; // ms, igual que en el CSS

const Submenu = ({ onClose }) => {
    const { userType } = useAuth();
    const {
        showLogoutModal,
        handleLogout,
        confirmLogout,
        cancelLogout,
        showSuccess
    } = useSubmenuLog();
    const [animState, setAnimState] = useState('in'); // 'in' | 'out'
    const closeTimeout = useRef();

    // Permite que el padre controle el cierre con animación
    useEffect(() => {
        if (!onClose) return;
        if (showSuccess) return; // No desmontar mientras hay success
        const handler = () => {
            setAnimState('out');
            closeTimeout.current = setTimeout(() => {
                onClose();
            }, ANIMATION_OUT_DURATION);
        };
        window.addEventListener('submenu-close', handler);
        return () => {
            window.removeEventListener('submenu-close', handler);
            clearTimeout(closeTimeout.current);
        };
    }, [onClose, showSuccess]);

    return (
  <>
    <div className={`bloque submenu-anim${animState === 'in' ? '-in' : '-out'}`}>
      {/* Solo mostrar enlace de perfil si NO es admin */}
      {userType !== 'admin' && (
        <>
          <a href="/perfil" className="submenu-item">
            <i className="fa-solid fa-circle-user user-pic"></i>
            <span className="submenu-label">Mi perfil</span>
          </a>
          <hr />
        </>
      )}
      <a href="#" className="submenu-item" onClick={handleLogout}>
        <i className="fa-solid fa-right-from-bracket"></i>
        <span className="submenu-label">Cerrar sesión</span>
      </a>
    </div>
    <LogoutConfirmModal isOpen={showLogoutModal} onConfirm={confirmLogout} onCancel={cancelLogout} showSuccess={showSuccess} />
  </>
  );
};

export default Submenu;
