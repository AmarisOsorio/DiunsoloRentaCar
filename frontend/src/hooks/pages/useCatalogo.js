import React from 'react';
import CatalogoMarcas from './CatalogoMarcas';
// ...otros imports...

const Catalogo = () => {
  return (
    <section style={{ padding: '2rem' }}>
      <h2>Catálogo</h2>
      <CatalogoMarcas />
    </section>
  );
};

export default Catalogo;