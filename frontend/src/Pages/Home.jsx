import React from 'react';
import './styles/Home.css';
import ServicesCard from '../components/ServicesCard';
import VehiculoCardHome from '../components/VehiculoCard';
import useHomeVehiculos from '../hooks/pages/Home';
import Rapido from '../assets/FlashOn.png'
import Seguro from '../assets/Protect.png'
import Aeropuerto from '../assets/AirplaneTakeOff.png'
import WIFI from '../assets/WIFI.png'
import Chofer from '../assets/AirPilotHat.png'
import EntregaExpress from '../assets/Airplaneticket.png'

const homeServices = [
    {
      iconName: Rapido,    
      title: 'Rápido y confiable',
      description: 'Rentar un vehículo no debe de ser tan complicado  ¡Nosotros lo hacemos fácil para ti!'
    },
    {
      iconName: Seguro,
      title: 'Seguro incluido',
      description: 'Todos nuestros vehículos ofrecen seguro de daños propios y terceros, lo hacemos simple para ti.'
    },
    {
      iconName: Aeropuerto,
      title: 'Entrega en aeropuerto',
      description: 'Si lo que deseas es no complicarte ¡Ahora contamos con entregas programadas en aeropuerto! Costo adicional'
    },
    {
      iconName: WIFI,
      title: 'WIFI conectividad',
      description: 'Ofrecemos conectividad y paquetes de internet a nuestros clientes con nuestros módems a bordo'
    },
    {
      iconName: Chofer,
      title: 'Servicio de chofer',
      description: 'Servicio de chofer a disponibilidad y solicitud del cliente, Costo adicional'
    },
    {
      iconName: EntregaExpress,
      title: 'Entrega express',
      description: 'Si tienes una emergencia cuenta con nosotros realizamos viajes exprés al aeropuerto, costo adicional dependiendo de la ubicación'
    }
];

function HomePage() {
  const { vehiculos, loading, error } = useHomeVehiculos();

  return (
    <>
      <div>
        <header className="header-container">
          <div className="header-overlay">
            <h1>Bienvenido a DiunsoloRentaCar</h1>
            <p>Tu mejor opción para renta de autos.</p>
          </div>
        </header>
        
        <section className="services-section">
          <div className="services-grid">
            {homeServices.map((service, index) => (
              <ServicesCard
                key={index}
                iconName={service.iconName}
                title={service.title}
                description={service.description}
              />
            ))}
          </div>
        </section>

        <section className="vehiculos-destacados-section">
          <h2 className="vehiculos-destacados-title">Vehículos Destacados</h2>
          <p className="vehiculos-destacados-subtitle">Descubre algunos de nuestros mejores vehículos disponibles</p>
          
          {loading && <div className="vehiculos-loading-home">Cargando vehículos...</div>}
          {error && <div className="vehiculos-error-home">Error: {error}</div>}
          
          {!loading && !error && vehiculos.length > 0 && (
            <div className="vehiculos-destacados-grid">
              {vehiculos.map((vehiculo) => (
                <VehiculoCardHome key={vehiculo._id} vehiculo={vehiculo} />
              ))}
            </div>
          )}
          
          {!loading && !error && vehiculos.length === 0 && (
            <div className="vehiculos-loading-home">No hay vehículos disponibles</div>
          )}
        </section>
      </div>
    </>
  );
}

export default HomePage;