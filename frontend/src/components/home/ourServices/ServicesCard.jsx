import React from 'react';
import './ServicesCard.css';

const ServicesCard = ({ iconName, title, description }) => {
  return (
    <div className='service-container'>
    <div className="service-card">
      <div className="service-icon">
        <img src={iconName} alt={title} />
      </div>
      <h3 className="service-title">{title}</h3>
      <p className="service-description">{description}</p>
    </div>
    </div>
  );
};

export default ServicesCard;
