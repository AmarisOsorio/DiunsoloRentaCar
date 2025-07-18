import React from 'react';
import './IntroSection.css';

const IntroSection = ({ 
  title = "¿Por que elegirnos?", 
  description = "¿Listo para rodar? En Diunsolo lo hacemos fácil: vehículos top, reservas rápidas y cero estrés. Desde un paseo espontáneo hasta ese viaje que planeaste con tiempo, tenemos justo lo que necesitás.",
  bottomText = "Y arrancá sin complicaciones.",
  videoSrc = "/path/to/your/video.mp4",
  videoPoster = "/path/to/video-poster.jpg"
}) => {
  return (
    <section className="intro-section">
      <div className="intro-container">
        <div className="intro-content">
          <div className="intro-video-container">
            <video 
              className="intro-video"
              controls
              autoPlay 
              loop
              muted
              poster={videoPoster}
              preload="metadata"
            >
              <source src={videoSrc} type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
          <div className="intro-text">
            <h2 className="intro-title">{title}</h2>
            <p className="intro-description">{description}</p>
            <p className="intro-bottom-text">{bottomText}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IntroSection;