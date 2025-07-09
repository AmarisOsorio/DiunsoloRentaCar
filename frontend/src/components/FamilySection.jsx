import React from 'react';
import '../components/styles/FamilySection.css';
import FamiliaDiunsolo from "../assets/FamiliaDiunsolo.jpg"

const FamilySection = ({ 
  title = "Somos una empresa", 
  highlightWord = "FAMILIAR", 
  description = "Bienvenidos a nuestra empresa familiar de renta de vehículos. Somos una joven familia dedicada a ofrecerte un servicio seguro y confiable para que disfrutes de un viaje inolvidable en El Salvador. Te invitamos a explorar maravillosos lugares y crear recuerdos únicos. Con nosotros, tu aventura empezará de la mejor manera. ¡Esperamos verte pronto y ser parte de tu experiencia en este hermoso país!",
  imageSrc = {FamiliaDiunsolo},
  imageAlt = "Familia Diunsolo"
}) => {
  return (
    <section className="familiar-section">
      <div className="familiar-container">
        <div className="familiar-content">
          <div className="familiar-text">
            <div className="familiar-title-container">
              <h3 className="familiar-title">{title}</h3>
              <h1 className="familiar-highlight">{highlightWord}</h1>
            </div>
            <p className="familiar-description">{description}</p>
          </div>
          <div className="familiar-image-wrapper">
 <div className="familiar-image-wrapper">
  <div className="celeste-background"></div>
  <img 
    src={imageSrc} 
    alt={imageAlt} 
    className="familiar-image"
  />
</div>
</div>
        </div>
      </div>
    </section>
  );
};

export default FamilySection;