import React, { useState } from 'react';
import './Gallery.css';
import GalleryModal from './modal/GalleryModal';

// Importa tus imágenes
import img1 from '../../../assets/galeria1.jpg';
import img2 from '../../../assets/galeria2.jpg';
import img3 from '../../../assets/galeria3.jpg';
import img4 from '../../../assets/galeria4.jpg';
import img5 from '../../../assets/galeria5.jpg'; 


const images = [img1, img2, img3, img4, img5];

const GallerySection = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);

  return (
    <section className="gallery-section">
      <h2 className="gallery-title">Nuestra galería</h2>
      <div className="gallery-grid">
        {images.map((img, i) => (
          <img 
            key={i}
            src={img}
            alt={`Imagen ${i + 1}`}
            className="gallery-image"
            onClick={() => setSelectedIndex(i)}
          />
        ))}
      </div>

      {selectedIndex !== null && (
        <GalleryModal 
          images={images}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </section>
  );
};

export default GallerySection;