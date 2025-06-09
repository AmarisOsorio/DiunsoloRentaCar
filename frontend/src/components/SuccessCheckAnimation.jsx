import React from 'react';
import './styles/SuccessCheckAnimation.css';

const SuccessCheckAnimation = ({ message, subtitle, nextAction }) => (
  <div className="success-check-anim-container">
    <div className="success-check-anim">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r="40" fill="#e6f9ed" stroke="#34c759" strokeWidth="5" />
        <polyline
          points="28,50 42,64 66,36"
          fill="none"
          stroke="#34c759"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="success-check-tick-path"
        />
      </svg>
    </div>
    <div className="success-check-message">{message}</div>
    {subtitle && <div className="success-check-subtitle">{subtitle}</div>}
    {nextAction && <div className="success-check-next-action">{nextAction}</div>}
  </div>
);

export default SuccessCheckAnimation;
