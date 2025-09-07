import React from 'react';
import LanguageSelector from './LanguageSelector';
import './Navbar.css';

function Navbar({ selectedLanguage, handleLanguageChange }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <span className="brand-text">
            Personalized Legal Assistant
          </span>
        </div>
        <div className="navbar-nav">
          <LanguageSelector 
            selectedLanguage={selectedLanguage}
            onLanguageChange={handleLanguageChange}
          />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
      