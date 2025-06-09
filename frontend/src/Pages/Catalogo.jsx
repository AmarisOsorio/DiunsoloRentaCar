import React, { useState } from 'react';
import AccountVerifiedScreen from '../components/AccountVerifiedScreen';
import { useAuth } from '../context/AuthContext.jsx';

const Catalogo = () => {
  const [show, setShow] = useState(false);
  const { user } = useAuth();

  // Mismo patrón que en el modal: función para cerrar la animación
  const handleAccountVerifiedClose = async () => {
    window.location.replace('/');
  };

  return (
    <section style={{ padding: '2rem' }}>
      <h2>Catálogo</h2>
      <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0f4fa', borderRadius: 8 }}>
        {user ? (
          <>
            <strong>Sesión iniciada como:</strong> {user.correo || user.email || JSON.stringify(user)}
          </>
        ) : (
          <span style={{ color: '#b00' }}>No has iniciado sesión</span>
        )}
      </div>
      <p>Próximamente: Explora nuestra flota de vehículos.</p>
      <button onClick={() => setShow(true)} style={{ padding: '12px 24px', fontSize: 18, background: '#4BB543', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 24 }}>
        Probar animación de cuenta verificada
      </button>
      {show && <AccountVerifiedScreen onClose={handleAccountVerifiedClose} />}
    </section>
  );
};

export default Catalogo;
