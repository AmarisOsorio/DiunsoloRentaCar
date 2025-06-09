import React, { useState } from 'react';
import AccountVerifiedScreen from '../components/AccountVerifiedScreen';

const Catalogo = () => {
  const [show, setShow] = useState(false);

  // Mismo patrón que en el modal: función para cerrar la animación
   const handleAccountVerifiedClose = async () => {
    window.location.replace('/');
  };


  return (
    <section style={{ padding: '2rem' }}>
      <h2>Catálogo</h2>
      <p>Próximamente: Explora nuestra flota de vehículos.</p>
      <button onClick={() => setShow(true)} style={{ padding: '12px 24px', fontSize: 18, background: '#4BB543', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', marginTop: 24 }}>
        Probar animación de cuenta verificada
      </button>
      {show && <AccountVerifiedScreen onClose={handleAccountVerifiedClose} />}
    </section>
  );
};

export default Catalogo;
