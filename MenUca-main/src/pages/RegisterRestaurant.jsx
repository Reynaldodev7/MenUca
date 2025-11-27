import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterRestaurant.css';

const RegisterRestaurant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  const [restaurantData, setRestaurantData] = useState({
    nombre: '',
    ubicacion: '',
    precio_general: 'moderado',
    tipo_comida: '',
    tiempo_espera_promedio: 20,
    horario_apertura: '08:00',
    horario_cierre: '22:00',
    ofertas_disponibles: 0
  });

  const [dishes, setDishes] = useState([
    { nombre: '', precio: '', ingredientes: '', incluye_bebida: false, unidades_disponibles: 10 }
  ]);

  const handleRestaurantChange = (e) => {
    setRestaurantData({
      ...restaurantData,
      [e.target.name]: e.target.value
    });
  };

  const handleDishChange = (index, field, value) => {
    const updatedDishes = dishes.map((dish, i) =>
      i === index ? { ...dish, [field]: value } : dish
    );
    setDishes(updatedDishes);
  };

  const addDish = () => {
    setDishes([...dishes, {
      nombre: '',
      precio: '',
      ingredientes: '',
      incluye_bebida: false,
      unidades_disponibles: 10
    }]);
  };

  const removeDish = (index) => {
    if (dishes.length > 1) {
      setDishes(dishes.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('userData');

      console.log('Token:', token ? 'Presente' : 'Faltante');
      console.log('UserData:', userData);

      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      if (!userData) {
        throw new Error('No hay información de usuario');
      }

      const parsedUser = JSON.parse(userData);
      console.log('Usuario que registra:', parsedUser);

      const response = await fetch('http://localhost:5000/api/restaurants/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...restaurantData,
          dishes: dishes
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al registrar restaurante');
      }

      alert('Restaurante registrado exitosamente!');
      navigate('/vendor/dashboard');

    } catch (error) {
      setError(error.message);
      console.error('Error registrando restaurante:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1) {
      if (!restaurantData.nombre || !restaurantData.ubicacion || !restaurantData.tipo_comida) {
        setError('Por favor completa todos los campos requeridos');
        return;
      }
    }
    setStep(step + 1);
    setError('');
  };

  const prevStep = () => {
    setStep(step - 1);
    setError('');
  };

  return (
    <div className="register-restaurant-page">
      <header className="register-header">
        <div className="logo-container" onClick={() => navigate('/home')}>
          <span>MenUca</span>
        </div>
        <button onClick={() => navigate('/home')} className="back-button">
          Volver al Inicio
        </button>
      </header>

      <div className="register-container">
        <h1>Registrar Restaurante</h1>

        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <p>Información del Restaurante</p>
          </div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <p>Menú</p>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="form-step">
              <h2>Información del Restaurante</h2>

              <div className="form-group">
                <label>Nombre del Restaurante *</label>
                <input
                  type="text"
                  name="nombre"
                  value={restaurantData.nombre}
                  onChange={handleRestaurantChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ubicación *</label>
                <input
                  type="text"
                  name="ubicacion"
                  value={restaurantData.ubicacion}
                  onChange={handleRestaurantChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Tipo de Comida *</label>
                <select
                  name="tipo_comida"
                  value={restaurantData.tipo_comida}
                  onChange={handleRestaurantChange}
                  required
                >
                  <option value="">Selecciona un tipo</option>
                  <option value="Carnes y Parrilla">Carnes y Parrilla</option>
                  <option value="Comida Japonesa">Comida Japonesa</option>
                  <option value="Comida Tradicional">Comida Tradicional</option>
                  <option value="Italiana">Italiana</option>
                  <option value="Saludable">Saludable</option>
                  <option value="Mexicana">Mexicana</option>
                  <option value="Americana">Americana</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Precio General</label>
                  <select
                    name="precio_general"
                    value={restaurantData.precio_general}
                    onChange={handleRestaurantChange}
                  >
                    <option value="economico">Económico ($)</option>
                    <option value="moderado">Moderado ($$)</option>
                    <option value="premium">Premium ($$$)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Tiempo de Espera (minutos)</label>
                  <input
                    type="number"
                    name="tiempo_espera_promedio"
                    value={restaurantData.tiempo_espera_promedio}
                    onChange={handleRestaurantChange}
                    min="5"
                    max="120"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Horario Apertura</label>
                  <input
                    type="time"
                    name="horario_apertura"
                    value={restaurantData.horario_apertura}
                    onChange={handleRestaurantChange}
                  />
                </div>

                <div className="form-group">
                  <label>Horario Cierre</label>
                  <input
                    type="time"
                    name="horario_cierre"
                    value={restaurantData.horario_cierre}
                    onChange={handleRestaurantChange}
                  />
                </div>
              </div>

              <button type="button" onClick={nextStep} className="next-button">
                Siguiente: Menú
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="form-step">
              <h2>Menú del Restaurante</h2>
              <p>Agrega al menos un platillo a tu menú</p>

              {dishes.map((dish, index) => (
                <div key={index} className="dish-form">
                  <h3>Platillo {index + 1}</h3>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Nombre del Platillo *</label>
                      <input
                        type="text"
                        value={dish.nombre}
                        onChange={(e) => handleDishChange(index, 'nombre', e.target.value)}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Precio ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={dish.precio}
                        onChange={(e) => handleDishChange(index, 'precio', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Ingredientes</label>
                    <textarea
                      value={dish.ingredientes}
                      onChange={(e) => handleDishChange(index, 'ingredientes', e.target.value)}
                      placeholder="Lista los ingredientes principales separados por comas"
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={dish.incluye_bebida}
                          onChange={(e) => handleDishChange(index, 'incluye_bebida', e.target.checked)}
                        />
                        Incluye bebida
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Unidades Disponibles</label>
                      <input
                        type="number"
                        min="0"
                        value={dish.unidades_disponibles}
                        onChange={(e) => handleDishChange(index, 'unidades_disponibles', parseInt(e.target.value))}
                      />
                    </div>

                    {dishes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDish(index)}
                        className="remove-dish-button"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <button type="button" onClick={addDish} className="add-dish-button">
                + Agregar Otro Platillo
              </button>

              <div className="form-actions">
                <button type="button" onClick={prevStep} className="back-button">
                  Anterior
                </button>
                <button type="submit" disabled={loading} className="submit-button">
                  {loading ? 'Registrando...' : 'Registrar Restaurante'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default RegisterRestaurant;