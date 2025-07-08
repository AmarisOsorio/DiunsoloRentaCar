import React, { useEffect, useState } from 'react';
import '../styles/Gallery.css';

const GalleryModal = ({ images, currentIndex, onClose }) => {
  const [index, setIndex] = useState(currentIndex);

  useEffect(() => {
    setIndex(currentIndex);
  }, [currentIndex]);

  const prevImage = () => {
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="gallery-modal">
      <div className="gallery-modal-overlay" onClick={onClose}></div>
      <div className="gallery-modal-content">
        <button className="gallery-close" onClick={onClose}>×</button>
        <img src={images[index]} alt={`Vista ${index + 1}`} className="gallery-full-image" />
        <button className="gallery-prev" onClick={prevImage}>‹</button>
        <button className="gallery-next" onClick={nextImage}>›</button>
      </div>
    </div>
  );
};

export default GalleryModal;