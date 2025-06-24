import React, { useState } from 'react';

const VehiculoModal = ({ vehiculo, isOpen, onClose }) => {
  const [imagenActual, setImagenActual] = useState(0);

  if (!isOpen || !vehiculo) return null;

  const getEstadoClass = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'disponible':
        return 'disponible';
      case 'reservado':
        return 'reservado';
      case 'mantenimiento':
        return 'mantenimiento';
      default:
        return 'disponible';
    }
  };

  const cambiarImagen = (direccion) => {
    if (vehiculo.imagenes && vehiculo.imagenes.length > 1) {
      if (direccion === 'next') {
        setImagenActual((prev) => 
          prev === vehiculo.imagenes.length - 1 ? 0 : prev + 1
        );
      } else {
        setImagenActual((prev) => 
          prev === 0 ? vehiculo.imagenes.length - 1 : prev - 1
        );
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div style={modalBackdropStyle} onClick={handleBackdropClick}>
      <div style={modalContainerStyle}>
        <button style={modalCloseStyle} onClick={onClose}>×</button>
        
        <div style={modalContentStyle}>
          {/* Header del modal */}
          <div style={modalHeaderStyle}>
            <h2 style={vehiculoTitleStyle}>{vehiculo.nombreVehiculo}</h2>
            <div style={{
              ...vehiculoEstadoModalStyle,
              backgroundColor: getEstadoClass(vehiculo.estado) === 'disponible' ? '#28a745' : 
                              getEstadoClass(vehiculo.estado) === 'reservado' ? '#ffc107' : '#dc3545',
              color: getEstadoClass(vehiculo.estado) === 'reservado' ? '#000' : '#fff'
            }}>
              <span style={{marginRight: '0.5rem'}}>
                {getEstadoClass(vehiculo.estado) === 'disponible' ? '✓' :
                 getEstadoClass(vehiculo.estado) === 'reservado' ? '⏱' : '🔧'}
              </span>
              {vehiculo.estado}
            </div>
          </div>

          {/* Contenido principal */}
          <div style={modalBodyStyle}>
            {/* Sección de imagen */}
            <div style={imagenSectionStyle}>
              <div style={imagenContainerStyle}>
                {vehiculo.imagenes && vehiculo.imagenes.length > 1 && (
                  <button 
                    style={{...imagenNavStyle, left: '10px'}} 
                    onClick={() => cambiarImagen('prev')}
                  >
                    &#8249;
                  </button>
                )}
                
                <img 
                  src={vehiculo.imagenes?.[imagenActual] || '/default-car.jpg'} 
                  alt={vehiculo.nombreVehiculo}
                  style={vehiculoImagenModalStyle}
                />
                
                {vehiculo.imagenes && vehiculo.imagenes.length > 1 && (
                  <button 
                    style={{...imagenNavStyle, right: '10px'}} 
                    onClick={() => cambiarImagen('next')}
                  >
                    &#8250;
                  </button>
                )}
              </div>
              
              {vehiculo.imagenes && vehiculo.imagenes.length > 1 && (
                <div style={imagenThumbnailsStyle}>
                  {vehiculo.imagenes.map((imagen, index) => (
                    <img
                      key={index}
                      src={imagen}
                      alt={`${vehiculo.nombreVehiculo} ${index + 1}`}
                      style={{
                        ...thumbnailStyle,
                        opacity: index === imagenActual ? 1 : 0.6
                      }}
                      onClick={() => setImagenActual(index)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Sección de información */}
            <div style={infoSectionStyle}>
              <div style={precioDestacadoStyle}>
                ${vehiculo.precioPorDia}/día
              </div>

              <div style={specsGridStyle}>
                <div style={specItemStyle}>
                  <div style={specIconStyle}>🚗</div>
                  <div>
                    <div style={specLabelStyle}>Motor diésel</div>
                    <div style={specValueStyle}>4 cilindros</div>
                  </div>
                </div>

                <div style={specItemStyle}>
                  <div style={specIconStyle}>⚙️</div>
                  <div>
                    <div style={specLabelStyle}>Manual de 6 velocidades</div>
                  </div>
                </div>

                <div style={specItemStyle}>
                  <div style={specIconStyle}>🚙</div>
                  <div>
                    <div style={specLabelStyle}>Tracción 4x4</div>
                  </div>
                </div>

                <div style={specItemStyle}>
                  <div style={specIconStyle}>👥</div>
                  <div>
                    <div style={specLabelStyle}>Capacidad para {vehiculo.capacidad} personas</div>
                  </div>
                </div>
              </div>

              <div style={detallesVehiculoStyle}>
                <h3 style={detallesTitleStyle}>Detalles del Vehículo</h3>
                <div style={detallesGridStyle}>
                  <div style={detalleItemStyle}>
                    <span style={detalleLabelStyle}>Año:</span>
                    <span style={detalleValorStyle}>{vehiculo.anio}</span>
                  </div>
                  <div style={detalleItemStyle}>
                    <span style={detalleLabelStyle}>Clase:</span>
                    <span style={detalleValorStyle}>{vehiculo.clase}</span>
                  </div>
                  <div style={detalleItemStyle}>
                    <span style={detalleLabelStyle}>Modelo:</span>
                    <span style={detalleValorStyle}>{vehiculo.modelo}</span>
                  </div>
                  <div style={detalleItemStyle}>
                    <span style={detalleLabelStyle}>Color:</span>
                    <span style={detalleValorStyle}>{vehiculo.color}</span>
                  </div>
                  <div style={detalleItemStyle}>
                    <span style={detalleLabelStyle}>Placa:</span>
                    <span style={detalleValorStyle}>{vehiculo.placa}</span>
                  </div>
                </div>
              </div>

              <button style={solicitarReservaBtnStyle}>
                Solicitar reserva
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};