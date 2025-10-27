import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BuhoLogo from '../assets/logo_blanco.png'; 
import '../styles/LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault(); 
    console.log('Intentando iniciar sesión con:', { email, password });
    if (email === 'test@buho.com' && password === '12345') {
      alert('¡Inicio de Sesión Exitoso!');
    } else {
      alert('Credenciales incorrectas o incompletas.');
    }
  };

  return (
    <div className="auth-container login-page-layout">
      
      {/* Panel Izquierdo: Marca y Logo */}
      <div className="left-panel">
        <img src={BuhoLogo} alt="Búho Chef Logo" className="buho-logo-desktop" />

        {/* Elementos de móvil ocultos en escritorio, visibles solo en móvil */}
        <img src={BuhoLogo} alt="Búho Chef Logo" className="buho-logo-mobile" />
      </div>

      {/* Panel Derecho: Formulario de Login */}
      <div className="right-panel">
        <h2 className="welcome-message-desktop">Bienvenido de Nuevo</h2> 
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="correo">Correo Electrónico:</label> 
            <input 
              id="correo" 
              type="email" 
              placeholder="Ingrese su correo." 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input 
              id="password" 
              type="password" 
              placeholder="Ingrese su contraseña." 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button type="submit" className="btn-primary">Iniciar sesion</button> 
        </form>

        <p className="switch-text-desktop">
          ¿No tienes cuenta? <Link to="/register" className="link">Regístrate aquí.</Link>
        </p>

        {/* Elemento de móvil oculto en desktop, visible solo en móvil */}
        <p className="switch-text-mobile">¿Todavia no tienes cuenta?</p>
        <Link to="/register" className="btn-secondary link-button switch-button-mobile">
            Crear cuenta
        </Link>
      </div>
    </div>
  );
}

export default LoginPage;