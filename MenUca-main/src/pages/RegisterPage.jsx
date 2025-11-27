import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BuhoLogo from '../assets/logo_blanco.png';
import '../styles/RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    contraseña: '',
    confirmarContraseña: '',
    tipo_usuario: 'consumidor'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.contraseña !== formData.confirmarContraseña) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: formData.correo,
          contraseña: formData.contraseña,
          tipo_usuario: formData.tipo_usuario
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el registro');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      navigate('/home');

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container-main'>
      <div className="app-container">
        <div className="auth-container login-page-layout">

          <div className="left-panel">
            <img src={BuhoLogo} alt="Búho Chef Logo" className="buho-logo-desktop" />
            <img src={BuhoLogo} alt="Búho Chef Logo" className="buho-logo-mobile" />
            <h1 className="app-title-desktop">MenUca</h1>
            <p className="tagline-desktop">Únete a nuestra comunidad</p>
            <h1 className="app-title-mobile">MenUca</h1>
          </div>

          <div className="right-panel">
            <h2 className="welcome-message-desktop">Crear Cuenta</h2>
            <h2 className="welcome-message-mobile">Crear Cuenta</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nombre">Nombre:</label>
                  <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    placeholder="Tu nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="apellido">Apellido:</label>
                  <input
                    id="apellido"
                    type="text"
                    name="apellido"
                    placeholder="Tu apellido"
                    value={formData.apellido}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="correo">Correo Electrónico:</label>
                <input
                  id="correo"
                  type="email"
                  name="correo"
                  placeholder="tu@correo.com"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="tipo_usuario">Tipo de Usuario:</label>
                <select
                  id="tipo_usuario"
                  name="tipo_usuario"
                  value={formData.tipo_usuario}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="consumidor">Consumidor</option>
                  <option value="vendedor">Vendedor</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="contraseña">Contraseña:</label>
                <input
                  id="contraseña"
                  type="password"
                  name="contraseña"
                  placeholder="Mínimo 6 caracteres"
                  value={formData.contraseña}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  minLength="6"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmarContraseña">Confirmar Contraseña:</label>
                <input
                  id="confirmarContraseña"
                  type="password"
                  name="confirmarContraseña"
                  placeholder="Repite tu contraseña"
                  value={formData.confirmarContraseña}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
            </form>

            <p className="switch-text-desktop">
              ¿Ya tienes cuenta? <Link to="/" className="link">Inicia sesión aquí.</Link>
            </p>

            <p className="switch-text-mobile">
              ¿Ya tienes cuenta? <Link to="/" className="link">Inicia sesión aquí.</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;