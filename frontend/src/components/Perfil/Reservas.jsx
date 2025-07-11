import React, { useMemo, useEffect, useCallback } from 'react';
import { FaCalendarAlt } from 'react-icons/fa';
import { FaCircle } from 'react-icons/fa';
import { useReservas } from '../../hooks/components/perfil/useReservas';
import '../styles/Reservas.css';

/**
 * Componente para mostrar una tarjeta de reserva individual
 */
const ReservaCard = React.memo(({ reserva }) => {
  const statusMap = {
    activa: { label: 'Activa', className: 'reserva-status-activa' },
    pendiente: { label: 'Pendiente', className: 'reserva-status-pendiente' },
    finalizada: { label: 'Finalizada', className: 'reserva-status-finalizada' },
  };

  const status = statusMap[reserva.estado?.toLowerCase()] || { label: reserva.estado, className: '' };
  
  // Info del auto desde vehiculoID
  const vehiculo = reserva.vehiculoID || {};
  const marca = vehiculo.marca || vehiculo.idMarca || '';
  const nombreVehiculo = vehiculo.nombreVehiculo || '';
  const modelo = vehiculo.modelo || '';
  const color = vehiculo.color || '';
  const anio = vehiculo.anio || vehiculo.año || '';
  const capacidad = vehiculo.capacidad || '';
  const clase = vehiculo.clase || '';
  const placa = vehiculo.placa || '';
  const imagenVehiculo = vehiculo.imagenLateral || reserva.imagenVehiculo || '';
  
  // Info del usuario desde cliente[0]
  const cliente = (reserva.cliente && reserva.cliente[0]) || {};
  const nombreCliente = cliente.nombre || reserva.nombreCliente || reserva.nombre || '';
  const emailCliente = cliente.correoElectronico || reserva.emailCliente || reserva.email || '';
  const telefonoCliente = cliente.telefono || reserva.telefonoCliente || reserva.telefono || reserva.celular || '';
  
  // Fechas
  const fechaInicio = reserva.fechaInicio ? new Date(reserva.fechaInicio) : null;
  const fechaFin = reserva.fechaDevolucion ? new Date(reserva.fechaDevolucion) : (reserva.fechaFin ? new Date(reserva.fechaFin) : null);
  
  return (
    <div className="reserva-card">
      <div className="reserva-card-header">
        {status.label && (
          <span className={`reserva-status ${status.className}`}>
            <FaCircle style={{ fontSize: '0.7em', marginRight: 6, color: status.className === 'reserva-status-activa' ? '#1bb76e' : status.className === 'reserva-status-pendiente' ? '#e6a100' : '#1976d2' }} />
            {status.label}
          </span>
        )}
        {status.label === 'Pendiente' && (
          <div className="reserva-acciones-header">
            <button className="reserva-btn editar">Editar</button>
            <button className="reserva-btn eliminar">Eliminar</button>
          </div>
        )}
      </div>
      <div className="reserva-card-body body-flex-row">
        <div className="reserva-card-info">
          {/* Info cliente */}
          <div className="reserva-cliente">
            <span className="reserva-cliente-nombre">{nombreCliente}</span>
            {emailCliente && <span className="reserva-cliente-email"> | {emailCliente}</span>}
            {telefonoCliente && <span className="reserva-cliente-tel"> | {telefonoCliente}</span>}
          </div>
          {/* Info vehículo */}
          <div className="reserva-vehiculo">
            {marca && <span className="reserva-marca">{marca}</span>}
            {nombreVehiculo && <span className="reserva-modelo"> {nombreVehiculo}</span>}
            {modelo && <span className="reserva-modelo"> {modelo}</span>}
            {anio && <span className="reserva-anio"> ({anio})</span>}
            {color && <span className="reserva-color"> - {color}</span>}
            {clase && <span className="reserva-clase"> - {clase}</span>}
            {capacidad && <span className="reserva-capacidad"> - {capacidad} pasajeros</span>}
            {placa && <span className="reserva-placa"> - Placa: {placa}</span>}
          </div>
          <div className="reserva-fechas-group">
            <div className="reserva-fecha">
              <FaCalendarAlt className="reserva-icon" />
              <span>Inicio: {fechaInicio ? fechaInicio.toLocaleString() : 'Sin fecha'}</span>
            </div>
            <div className="reserva-fecha">
              <FaCalendarAlt className="reserva-icon" />
              <span>Devolución: {fechaFin ? fechaFin.toLocaleString() : 'Sin fecha'}</span>
            </div>
          </div>
        </div>
        {imagenVehiculo && (
          <div className="reserva-vehiculo-img-side">
            <img className="reserva-vehiculo-img ajustada" src={imagenVehiculo} alt={nombreVehiculo || 'Vehículo'} />
          </div>
        )}
      </div>
    </div>
  );
});

ReservaCard.displayName = 'ReservaCard';

/**
 * Componente para mostrar las reservas del usuario
 * @param {boolean} shouldFetch - Indica si se deben cargar las reservas
 */
const Reservas = ({ shouldFetch = false }) => {
  const { reservas, loading, error, reloadReservas } = useReservas(shouldFetch);
  
  // Solo log cuando cambien los valores importantes
  useEffect(() => {
    console.log('� Reservas state update - reservas:', reservas.length, 'loading:', loading, 'error:', error);
  }, [reservas.length, loading, error]);

  // Memorizar las reservas para evitar re-renders innecesarios
  const memoizedReservas = useMemo(() => reservas, [reservas]);

  return (
    <div className="perfil-content">
      <div className="perfil-section">
        <h2 className="perfil-section-title">
          <FaCalendarAlt className="perfil-section-icon" />
          Reservas
        </h2>
        {loading && (
          <span className="perfil-loading-text">Cargando reservas
            <span className="perfil-loading-dots">
              <span className="dot">.</span>
              <span className="dot">.</span>
              <span className="dot">.</span>
            </span>
          </span>
        )}
        {error && <div className="perfil-error">{error}</div>}
        {!loading && !error && memoizedReservas.length === 0 && (
          <div className="perfil-coming-soon ">
            <div className="invitacion-icono">
              <FaCalendarAlt size={38} />
            </div>
            <h3 className="invitacion-titulo">¡Aún no tienes reservas!</h3>
            <p className="invitacion-texto">
              Descubre nuestra variedad de vehículos y realiza tu primera reserva en solo minutos.
            </p>
            <a href="/catalogo" className="catalogo-link invitacion-boton">Ver catálogo</a>
          </div>
        )}
        <div className="reservas-list">
          {memoizedReservas.map((reserva, idx) => (
            <ReservaCard key={reserva.id || idx} reserva={reserva} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reservas;
