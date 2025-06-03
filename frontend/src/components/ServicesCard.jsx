import React from 'react';
import '../components/styles/ServicesCard.css';

const ServiceCard = ({ iconName, title, description }) => {
  return (
    <div className="service-card">
      <div className="service-icon">
        <img src={iconName} alt={title} />
      </div>
      <h3 className="service-title">{title}</h3>
      <p className="service-description">{description}</p>
    </div>
  );
};

export default ServiceCard;
