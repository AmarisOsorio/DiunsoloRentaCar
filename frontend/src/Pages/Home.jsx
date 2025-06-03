import React from 'react';
import '../components/styles/Home.css';
import ServiceCard from '../components/ServicesCard';
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

    function HomePage () {
      return(
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
               {homeServices.map((homeServices, index) => (
                 <ServiceCard
                   key={index}
                   iconName={homeServices.iconName}
                   title={homeServices.title}
                   description={homeServices.description} /> 
                   ))}
            </div>
          </section>
        </div>
        
        </>
      );
    }

export default HomePage;