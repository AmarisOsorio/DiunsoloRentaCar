import React, { useState, useEffect } from 'react';
import './styles/FiltrosCatalogo.css';

const FiltrosCatalogo = ({ vehiculos, onFilterChange }) => {
  const [filtros, setFiltros] = useState({
    marcas: [],
    tipos: [],
  });

  //Capitalizar el texto para que lo encuentre ya sea que lo hayan escrito con Mayusculas o Minusculas
  const capitalizar = (texto) =>
    texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';

  const marcasDisponibles = vehiculos
  ? [...new Set(vehiculos.map(v => v.idMarca?.nombreMarca?.trim().toLowerCase()))].sort()
  : [];

  const clasesDisponibles = vehiculos
    ? [...new Set(vehiculos.map(v => v.clase?.trim().toLowerCase()))].sort()
    : [];

 
  const handleCheckboxChange = (tipo, valor) => {
    const yaSeleccionado = filtros[tipo].includes(valor);
    const nuevosValores = yaSeleccionado
      ? filtros[tipo].filter((v) => v !== valor)
      : [...filtros[tipo], valor];

    const nuevosFiltros = { ...filtros, [tipo]: nuevosValores };
    setFiltros(nuevosFiltros);
    onFilterChange(nuevosFiltros);
  };

  //Para ver que datos son los que recibo en la consola
  useEffect(() => {
  console.log('Vehiculos recibidos:', vehiculos);
  }, [vehiculos]);

  return (
    <div className="filtros-container">
      <div className="filtro-seccion">
        <h4 className="filtro-titulo">Marca</h4>
        {marcasDisponibles.map((marca, index) => (
          <label key={`${marca}-${index}`} className="filtro-checkbox">
            <input
              type="checkbox"
              value={marca}
              checked={filtros.marcas.includes(marca)}
              onChange={() => handleCheckboxChange('marcas', marca)}
            />
            {capitalizar(marca)}
          </label>
        ))}
      </div>

      <div className="filtro-seccion">
        <h4 className="filtro-titulo">Tipo</h4>
        {clasesDisponibles.map((tipo, index) => (
          <label key={`${tipo}-${index}`} className="filtro-checkbox">
            <input
              type="checkbox"
              value={tipo}
              checked={filtros.tipos.includes(tipo)}
              onChange={() => handleCheckboxChange('tipos', tipo)}
            />
            {capitalizar(tipo)}
          </label>
        ))}
      </div>

    
    </div>
  );
};

export default FiltrosCatalogo;