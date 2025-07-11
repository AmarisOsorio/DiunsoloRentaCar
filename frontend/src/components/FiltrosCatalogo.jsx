import React, { useState, useEffect } from 'react';
import './styles/FiltrosCatalogo.css';

const tiposVehiculo = ['Gama alta', 'SUVs', 'Todo terreno', 'Vans'];

const FiltrosCatalogo = ({ vehiculos, onFilterChange }) => {
  const [filtros, setFiltros] = useState({
    marcas: [],
    tipos: [],
  });

  const marcasDisponibles = vehiculos ? 
  [...new Set(vehiculos.map(v => v.marca?.trim().toLowerCase()))].sort() : [];

  const handleCheckboxChange = (tipo, valor) => {
    const yaSeleccionado = filtros[tipo].includes(valor);
    const nuevosValores = yaSeleccionado
      ? filtros[tipo].filter((v) => v !== valor)
      : [...filtros[tipo], valor];

    const nuevosFiltros = { ...filtros, [tipo]: nuevosValores };
    setFiltros(nuevosFiltros);
    onFilterChange(nuevosFiltros);
  };

  const limpiarFiltros = () => {
    const filtrosLimpios = { marcas: [], tipos: [] };
    setFiltros(filtrosLimpios);
    onFilterChange(filtrosLimpios);
  };

  return (
    <div className="filtros-container">
      <div className="filtro-seccion">
        <h4 className="filtro-titulo">Marca</h4>
        {marcasDisponibles.map((marca , index) => (
          <label key={`${marca}-${index}`} className="filtro-checkbox">
            <input
              type="checkbox"
              value={marca}
              checked={filtros.marcas.includes(marca)}
              onChange={() => handleCheckboxChange('marcas', marca)}
            />
            {marca}
          </label>
        ))}
      </div>

      <div className="filtro-seccion">
        <h4 className="filtro-titulo">Tipo</h4>
        {tiposVehiculo.map((tipo , index) => (
          <label key={`${tipo}-${index}`} className="filtro-checkbox">
            <input
              type="checkbox"
              value={tipo}
              checked={filtros.tipos.includes(tipo)}
              onChange={() => handleCheckboxChange('tipos', tipo)}
            />
            {tipo}
          </label>
        ))}
      </div>

      <button className="btn-limpiar-filtros" onClick={limpiarFiltros}>
        Limpiar filtros
      </button>
    </div>
  );
};

export default FiltrosCatalogo;