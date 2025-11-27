import React from 'react';
import BuhoLogo from '../assets/logo_404.png';
import '../styles/NotFoundPage.css';

function NotFoundPage() {
  return (
    <div className='container-main'>
    <div className="app-container">
    <div className="not-found-container">
      <img src={BuhoLogo} alt="Búho Triste" className="sad-buho-logo" />
      <h1>¡Ups! Página no encontrada</h1>
      <p>Lo sentimos, no pudimos encontrar la página que buscas.</p>
      <a href="/" className="back-home-button">Volver al Inicio</a>
    </div>
    </div>
    </div>
  );
}

export default NotFoundPage;