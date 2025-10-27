import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; 
import BuhoLogoSmall from '../assets/logo_blanco.png'; 
import '../styles/RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Error: Las contraseñas no coinciden.');
      return;
    }
    console.log('Intentando registrar usuario con:', formData);
    alert('Usuario registrado con éxito.');
    navigate('/'); 
  };

  const handleGoBack = () => {
    navigate('/'); 
  };

  return (
    <div className="auth-container register-page-layout">
      
      {/* Panel Izquierdo: Marca y Logo */}
      <div className="left-panel register-left-panel">
        <img src={BuhoLogoSmall} alt="Búho Chef Logo" className="buho-logo-desktop" />

        {/* Elementos de móvil ocultos en escritorio */}
        <div className="header-register-mobile">
            <button className="btn-back-mobile" onClick={handleGoBack}>&lt;</button>
            <h2 className="page-title-mobile">Crear cuenta</h2>
            <img src={BuhoLogoSmall} alt="Búho Chef Logo" className="buho-logo-small-mobile" />
        </div>
      </div>

      {/* Panel Derecho: Formulario de Registro */}
      <div className="right-panel">
        {/* Header de registro para escritorio*/}
        <div className="header-register-desktop">
            <button className="btn-back-desktop" onClick={handleGoBack}>&lt;</button>
            <h2 className="page-title-desktop">Crear cuenta</h2>
            <img src={BuhoLogoSmall} alt="Búho Chef Logo" className="buho-logo-small-desktop" />
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="firstName">Nombre:</label>
            <input id="firstName" type="text" placeholder="Ingrese su nombre." value={formData.firstName} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Apellido:</label>
            <input id="lastName" type="text" placeholder="Ingrese su apellido." value={formData.lastName} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo:</label>
            <input id="email" type="email" placeholder="Ingrese su correo." value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña:</label>
            <input id="password" type="password" placeholder="Ingrese su contraseña." value={formData.password} onChange={handleChange} />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirme su contraseña:</label>
            <input id="confirmPassword" type="password" placeholder="Verificar su contraseña" value={formData.confirmPassword} onChange={handleChange} />
          </div>

          <button type="submit" className="btn-primary">Registrarse</button>
        </form>
        
        <p className="switch-text-desktop">¿Ya tienes una cuenta? <Link to="/" className="link">Iniciar Sesion</Link></p>
      </div>
    </div>
  );
}

export default RegisterPage;