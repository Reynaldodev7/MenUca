import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/RestaurantManagement.css';

const RestaurantManagement = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('info');
  const [showDishForm, setShowDishForm] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  const [dishForm, setDishForm] = useState({
    nombre: '',
    precio: '',
    ingredientes: '',
    incluye_bebida: false,
    unidades_disponibles: 10
  });

  // Cargar datos del restaurante y platillos
  useEffect(() => {
    fetchRestaurantData();
  }, [restaurantId]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Obtener información del restaurante
      const restaurantResponse = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!restaurantResponse.ok) {
        throw new Error('Error al cargar restaurante');
      }

      const restaurantData = await restaurantResponse.json();
      setRestaurant(restaurantData);

      // Obtener platillos
      const dishesResponse = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}/dishes`);
      if (dishesResponse.ok) {
        const dishesData = await dishesResponse.json();
        setDishes(dishesData);
      }

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDish = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingDish 
        ? `http://localhost:5000/api/restaurants/${restaurantId}/dishes/${editingDish.platillo_id}`
        : `http://localhost:5000/api/restaurants/${restaurantId}/dishes`;

      const response = await fetch(url, {
        method: editingDish ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dishForm)
      });

      if (!response.ok) {
        throw new Error('Error al guardar platillo');
      }

      alert(editingDish ? 'Platillo actualizado exitosamente' : 'Platillo agregado exitosamente');
      setShowDishForm(false);
      setEditingDish(null);
      setDishForm({
        nombre: '',
        precio: '',
        ingredientes: '',
        incluye_bebida: false,
        unidades_disponibles: 10
      });
      
      fetchRestaurantData();

    } catch (error) {
      alert(error.message);
    }
  };

  const handleEditDish = (dish) => {
    setEditingDish(dish);
    setDishForm({
      nombre: dish.nombre,
      precio: dish.precio,
      ingredientes: dish.ingredientes || '',
      incluye_bebida: dish.incluye_bebida || false,
      unidades_disponibles: dish.unidades_disponibles || 10
    });
    setShowDishForm(true);
  };

  const handleDeleteDish = async (dishId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este platillo?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}/dishes/${dishId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar platillo');
      }

      alert('Platillo eliminado exitosamente');
      fetchRestaurantData();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="restaurant-management">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando información del restaurante...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="restaurant-management">
        <div className="error-container">
          <h2>Restaurante no encontrado</h2>
          <button onClick={() => navigate('/vendor/dashboard')}>
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-management">
      <header className="management-header">
        <div className="header-content">
          <div className="header-info">
            <h1>{restaurant.nombre}</h1>
            <p>{restaurant.tipo_comida} • {restaurant.ubicacion}</p>
          </div>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/vendor/dashboard')}
              className="btn-secondary"
            >
              Volver al Dashboard
            </button>
            <button 
              onClick={() => navigate(`/restaurant/${restaurantId}`)}
              className="btn-view"
            >
              Ver Página Pública
            </button>
          </div>
        </div>
      </header>

      <div className="management-tabs">
        <button 
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Información
        </button>
        <button 
          className={`tab-button ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          Menú ({dishes.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Reseñas
        </button>
      </div>

      <div className="management-content">
        {activeTab === 'info' && (
          <div className="info-section">
            <h3>Información del Restaurante</h3>
            <div className="info-grid">
              <div className="info-item">
                <label>Nombre:</label>
                <span>{restaurant.nombre}</span>
              </div>
              <div className="info-item">
                <label>Ubicación:</label>
                <span>{restaurant.ubicacion}</span>
              </div>
              <div className="info-item">
                <label>Tipo de Comida:</label>
                <span>{restaurant.tipo_comida}</span>
              </div>
              <div className="info-item">
                <label>Precio General:</label>
                <span>{restaurant.precio_general}</span>
              </div>
              <div className="info-item">
                <label>Horario:</label>
                <span>{restaurant.horario_apertura} - {restaurant.horario_cierre}</span>
              </div>
              <div className="info-item">
                <label>Tiempo de Espera:</label>
                <span>{restaurant.tiempo_espera_promedio} minutos</span>
              </div>
            </div>
            <button className="btn-primary">
              Editar Información
            </button>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="menu-section">
            <div className="section-header">
              <h3>Gestión de Menú</h3>
              <button 
                onClick={() => {
                  setEditingDish(null);
                  setDishForm({
                    nombre: '',
                    precio: '',
                    ingredientes: '',
                    incluye_bebida: false,
                    unidades_disponibles: 10
                  });
                  setShowDishForm(true);
                }}
                className="btn-primary"
              >
                + Agregar Platillo
              </button>
            </div>

            {showDishForm && (
              <form onSubmit={handleAddDish} className="dish-form">
                <h4>{editingDish ? 'Editar Platillo' : 'Nuevo Platillo'}</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      value={dishForm.nombre}
                      onChange={(e) => setDishForm({...dishForm, nombre: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Precio ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={dishForm.precio}
                      onChange={(e) => setDishForm({...dishForm, precio: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Ingredientes</label>
                  <textarea
                    value={dishForm.ingredientes}
                    onChange={(e) => setDishForm({...dishForm, ingredientes: e.target.value})}
                    placeholder="Lista de ingredientes separados por comas"
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={dishForm.incluye_bebida}
                        onChange={(e) => setDishForm({...dishForm, incluye_bebida: e.target.checked})}
                      />
                      Incluye bebida
                    </label>
                  </div>
                  <div className="form-group">
                    <label>Unidades Disponibles</label>
                    <input
                      type="number"
                      min="0"
                      value={dishForm.unidades_disponibles}
                      onChange={(e) => setDishForm({...dishForm, unidades_disponibles: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" onClick={() => setShowDishForm(false)} className="btn-secondary">
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingDish ? 'Actualizar' : 'Agregar'} Platillo
                  </button>
                </div>
              </form>
            )}

            <div className="dishes-grid">
              {dishes.length === 0 ? (
                <div className="empty-state">
                  <p>No hay platillos en el menú</p>
                </div>
              ) : (
                dishes.map(dish => (
                  <div key={dish.platillo_id} className="dish-card">
                    <div className="dish-info">
                      <h4>{dish.nombre}</h4>
                      <p className="dish-price">${dish.precio}</p>
                      {dish.ingredientes && (
                        <p className="dish-ingredients">{dish.ingredientes}</p>
                      )}
                      <div className="dish-details">
                        {dish.incluye_bebida && <span className="tag">Incluye bebida</span>}
                        <span className={`stock ${dish.unidades_disponibles === 0 ? 'out-of-stock' : ''}`}>
                          {dish.unidades_disponibles > 0 ? `${dish.unidades_disponibles} disponibles` : 'Agotado'}
                        </span>
                      </div>
                    </div>
                    <div className="dish-actions">
                      <button 
                        onClick={() => handleEditDish(dish)}
                        className="btn-edit"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteDish(dish.platillo_id)}
                        className="btn-delete"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-section">
            <h3>Reseñas del Restaurante</h3>
            <p>Función en desarrollo...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantManagement;