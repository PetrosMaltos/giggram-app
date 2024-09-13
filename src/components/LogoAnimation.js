// src/components/LogoAnimation.js
import React from 'react';
import './LogoAnimation.css'; // Подключаем стили

const LogoAnimation = () => {
  return (
    <div className="logo-animation">
      <img src="/images/logo.png" alt="Logo" className="animated-logo" />
    </div>
  );
};

export default LogoAnimation;
