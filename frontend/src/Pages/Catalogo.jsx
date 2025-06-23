import React, { useEffect, useState } from 'react';
import './styles/Catalogo.css';
import { useAuth } from '../context/AuthContext.jsx';
import catalogBG from '../assets/catalogBG.png';

const Catalogo = () => {
  const [marcas, setMarcas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetch('/api/brands')
      .then(res => res.json())
      .then(data => {
        setMarcas(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="marcas-loading">Cargando marcas...</div>;

  return (
    <>
      <div
        className="catalogo-header"
        style={{ backgroundImage: `url(${catalogBG})` }}
      >
        <div className="catalogo-header-overlay">
          <h1>Catálogo</h1>
          <p>Explora nuestra variedad de autos disponibles para renta.</p>
        </div>
      </div>
      <section style={{ padding: '2rem' }}>
        <h2>Catálogo</h2>
        <div className="marcas-grid">
          {marcas.map(marca => (
            <div className="marca-card" key={marca._id}>
              <img src={marca.logo} alt={marca.nombreMarca} className="marca-logo" />
              <div className="marca-nombre">{marca.nombreMarca}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Catalogo;
