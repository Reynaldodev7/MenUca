import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BuhoLogo from '../assets/logo_blanco.png';
import '../styles/LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: email,
          contraseña: password
        }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en el login');
      }

      console.log('Login exitoso - Datos recibidos:', data);

      if (!data.user || !data.user.tipo_usuario) {
        console.warn('El backend no está enviando tipo_usuario');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      
      console.log('Datos guardados en localStorage:', {
        token: data.token,
        userData: data.user
      });

      navigate('/home');

    } catch (err) {
      console.error('Error en login:', err);
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
            <p className="tagline-desktop">Descubre los mejores restaurantes</p>
            <h1 className="app-title-mobile">MenUca</h1>
          </div>

          <div className="right-panel">
            <h2 className="welcome-message-desktop">Bienvenido de Nuevo</h2>
            <h2 className="welcome-message-mobile">Bienvenido</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="correo">Correo Electrónico:</label>
                <input
                  id="correo"
                  type="email"
                  placeholder="Ingrese su correo."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
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
                  required
                  disabled={loading}
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </button>
            </form>

            <p className="switch-text-desktop">
              ¿No tienes cuenta? <Link to="/register" className="link">Regístrate aquí.</Link>
            </p>

            <p className="switch-text-mobile">
              ¿No tienes cuenta? <Link to="/register" className="link">Regístrate aquí.</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;