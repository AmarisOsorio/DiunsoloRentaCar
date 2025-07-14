
import React, { useState, useEffect } from 'react';
import { useMarcas } from '../hooks/useMarcas';
import './styles/FiltrosCatalogo.css';

const FiltrosCatalogo = ({ vehiculos, onFilterChange, onClose, isMobile, ordenFiltros = ['marcas', 'tipos', 'estados'] }) => {
  const [filtros, setFiltros] = useState({
    marcas: [],
    tipos: [],
    estados: [],
  });

  const capitalizar = (texto) =>
    texto ? texto.charAt(0).toUpperCase() + texto.slice(1) : '';

  const { marcas: marcasDB } = useMarcas();
  const marcasDisponibles = marcasDB.length > 0
    ? marcasDB.map(m => m.nombreMarca?.trim())
    : (vehiculos ? [...new Set(vehiculos.map(v => v.idMarca?.nombreMarca?.trim()))].sort() : []);

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

  useEffect(() => {
    // console.log('Vehiculos recibidos:', vehiculos);
  }, [vehiculos]);
  const estadosDisponibles = ['Disponible', 'Reservado', 'Mantenimiento'];

  // isMobile ahora viene por props
  const handleClose = onClose || (() => {});

  // Renderiza los filtros en el orden especificado por ordenFiltros
  const filtroMap = {
    marcas: {
      titulo: 'Marca',
      opciones: marcasDisponibles,
      tipo: 'marcas',
      capitalizar: true,
    },
    tipos: {
      titulo: 'Clase',
      opciones: clasesDisponibles,
      tipo: 'tipos',
      capitalizar: true,
    },
    estados: {
      titulo: 'Estado',
      opciones: estadosDisponibles,
      tipo: 'estados',
      capitalizar: false,
    },
  };

  const renderFiltros = () =>
    ordenFiltros.map((key) => {
      const filtro = filtroMap[key];
      if (!filtro) return null;
      return (
        <div className="filtro-seccion" key={key}>
          <h4 className="filtro-titulo">{filtro.titulo}</h4>
          <div className="filtro-grupo">
            {filtro.opciones.map((opcion, index) => (
              <label key={`${opcion}-${index}`} className="filtro-checkbox">
                <input
                  type="checkbox"
                  value={opcion}
                  checked={filtros[filtro.tipo].includes(opcion)}
                  onChange={() => handleCheckboxChange(filtro.tipo, opcion)}
                />
                {filtro.capitalizar ? capitalizar(opcion) : opcion}
              </label>
            ))}
          </div>
        </div>
      );
    });

  if (isMobile) {
    return <>{renderFiltros()}</>;
  }

  // DESKTOP: filtros-container horizontal
  return <div className="filtros-container">{renderFiltros()}</div>;
};

export default FiltrosCatalogo;