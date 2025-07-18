import React from 'react';
import './LangDropdown.css';

const LangDropdown = ({ open, current, languages, onSelect, onBlur, onBtnClick }) => {
  return (
    <div className="lang-select-wrapper" tabIndex={-1} onBlur={onBlur}>
      <button
        className={`lang-btn${open ? ' open' : ''}`}
        onClick={onBtnClick}
        tabIndex={0}
        type="button"
        style={open ? { boxShadow: '0 0 0 1px #fff', zIndex: 11 } : {}}
      >
        <span className="lang-flag">
          <svg width="22" height="16" viewBox="0 0 22 16" className="flag-icon">
            <g className="flag-es" style={current === 'es' ? undefined : { display: 'none' }}>
              <rect width="22" height="16" fill="#C60B1E"/>
              <rect y="4" width="22" height="8" fill="#FFC400"/>
            </g>
            <g className="flag-en" style={current === 'en' ? undefined : { display: 'none' }}>
              <rect width="22" height="16" fill="#00247D"/>
              <rect y="6" width="22" height="4" fill="#fff"/>
              <rect x="9" width="4" height="16" fill="#fff"/>
              <rect y="7" width="22" height="2" fill="#CF142B"/>
              <rect x="10" width="2" height="16" fill="#CF142B"/>
            </g>
          </svg>
        </span>
        <span className="lang-label">{current === 'es' ? 'Español' : 'English'}</span>
        <span className="lang-arrow">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      {open && (
        <div className="lang-dropdown">
          {languages.filter(l => l.value !== current).map(l => (
            <button
              key={l.value}
              className={`lang-dropdown-item${l.value === current ? ' selected' : ''}`}
              onClick={() => onSelect(l.value)}
              type="button"
            >
              <span className="lang-flag">
                {l.value === 'es' ? (
                  <svg width="22" height="16" viewBox="0 0 22 16" className="flag-icon">
                    <g>
                      <rect width="22" height="16" fill="#C60B1E"/>
                      <rect y="4" width="22" height="8" fill="#FFC400"/>
                    </g>
                  </svg>
                ) : (
                  <svg width="22" height="16" viewBox="0 0 22 16" className="flag-icon">
                    <g>
                      <rect width="22" height="16" fill="#00247D"/>
                      <rect y="6" width="22" height="4" fill="#fff"/>
                      <rect x="9" width="4" height="16" fill="#fff"/>
                      <rect y="7" width="22" height="2" fill="#CF142B"/>
                      <rect x="10" width="2" height="16" fill="#CF142B"/>
                    </g>
                  </svg>
                )}
              </span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LangDropdown;
