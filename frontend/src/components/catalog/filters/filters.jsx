import { useState, useEffect } from 'react';
import './filters.css';
import { useBrands, useTypes } from './hook/usefilters.js';

/**
 * Componente de filtros para el catálogo de vehículos.
 * Permite filtrar por marca, clase y estado.
 * Los campos y variables han sido traducidos a inglés para consistencia.
 * Comentarios explicativos en español.
 */

const CatalogFilters = ({ vehicles, onFilterChange, onClose, isMobile, filterOrder = ['brands', 'types', 'statuses'] }) => {
  // Estado local para los filtros seleccionados
  const [filters, setFilters] = useState({
    brands: [],
    types: [],
    statuses: [],
  });

  // Capitaliza la primera letra de un texto
  const capitalize = (text) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1) : '';

  // Obtiene las marcas únicas usando el hook useBrands
  const availableBrands = useBrands(vehicles);

  // Obtiene las clases únicas usando el hook useTypes
  const availableTypes = useTypes ? useTypes(vehicles) : [];

  // Estados posibles para los vehículos
  const availableStatuses = ['Disponible', 'Reservado', 'Mantenimiento'];

  // Maneja el cambio de selección de un checkbox de filtro
  const handleCheckboxChange = (type, value) => {
    const alreadySelected = filters[type].includes(value);
    const newValues = alreadySelected
      ? filters[type].filter((v) => v !== value)
      : [...filters[type], value];
    const newFilters = { ...filters, [type]: newValues };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Efecto para depuración (puedes eliminarlo si no lo usas)
  useEffect(() => {
    // console.log('Vehículos recibidos:', vehicles);
  }, [vehicles]);


  // Mapeo de los filtros para renderizar, con títulos y opciones
  const filterMap = {
    statuses: {
      title: 'Estado',
      options: availableStatuses,
      type: 'statuses',
      capitalize: false,
    },
  };

  /**
   * Renderiza los filtros: siempre muestra marcas y clases, luego los adicionales según filterOrder
   */
  const renderFilters = () => (
    <>
      {/* Filtro de marcas */}
      <div className="filter-section" key="brands">
        <h4 className="filter-title">Marca</h4>
        <div className="filter-group">
          {availableBrands.map((option, index) => (
            <label key={`${option}-${index}`} className="filter-checkbox">
              <input
                type="checkbox"
                value={option}
                checked={filters.brands.includes(option)}
                onChange={() => handleCheckboxChange('brands', option)}
              />
              {capitalize(option)}
            </label>
          ))}
        </div>
      </div>
      {/* Filtro de clases */}
      <div className="filter-section" key="types">
        <h4 className="filter-title">Clase</h4>
        <div className="filter-group">
          {availableTypes.map((option, index) => (
            <label key={`${option}-${index}`} className="filter-checkbox">
              <input
                type="checkbox"
                value={option}
                checked={filters.types.includes(option)}
                onChange={() => handleCheckboxChange('types', option)}
              />
              {capitalize(option)}
            </label>
          ))}
        </div>
      </div>
      {/* Filtros adicionales según filterOrder (ejemplo: status) */}
      {filterOrder.map((key) => {
        if (key === 'brands' || key === 'types') return null;
        const filter = filterMap[key];
        if (!filter) return null;
        return (
          <div className="filter-section" key={key}>
            <h4 className="filter-title">{filter.title}</h4>
            <div className="filter-group">
              {filter.options.map((option, index) => (
                <label key={`${option}-${index}`} className="filter-checkbox">
                  <input
                    type="checkbox"
                    value={option}
                    checked={filters[filter.type].includes(option)}
                    onChange={() => handleCheckboxChange(filter.type, option)}
                  />
                  {filter.capitalize ? capitalize(option) : option}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );

  // Renderizado para móvil (solo los filtros)
  if (isMobile) {
    return <>{renderFilters()}</>;
  } 

  // Renderizado para escritorio: filtros en contenedor horizontal
  return <div className="filters-container">{renderFilters()}</div>;
};

export default CatalogFilters;