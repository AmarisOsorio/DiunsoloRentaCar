import React from 'react';

/**
 * Componente para secciones del perfil con título e ícono
 */
const ProfileSection = ({
  title,
  subtitle,
  icon: Icon,
  children
}) => {
  return (
    <div className="perfil-section">
      <h2 className="perfil-section-title">
        {Icon && <Icon className="perfil-section-icon" />}
        {title}
      </h2>
      {subtitle && (
        <p className="perfil-section-subtitle">
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
};

export default ProfileSection;
