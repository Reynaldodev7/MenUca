import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/VendorDashboard.css';

const VendorDashboard = () => {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('restaurants');

  const fetchMyRestaurants = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/restaurants/vendor/my-restaurants', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar restaurantes');
      }

      const data = await response.json();
      setRestaurants(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRestaurants();
  }, []);

  const handleDeleteRestaurant = async (restaurantId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este restaurante?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al eliminar restaurante');
      }

      alert('Restaurante eliminado exitosamente');
      fetchMyRestaurants();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="vendor-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando tus restaurantes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      <header className="vendor-header">
        <div className="header-content">
          <h1>Panel de Vendedor</h1>
          <div className="header-actions">
            <button 
              onClick={() => navigate('/register-restaurant')}
              className="btn-primary"
            >
              + Nuevo Restaurante
            </button>
            <button 
              onClick={() => navigate('/home')}
              className="btn-secondary"
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-tabs">
        <button 
          className={`tab-button ${activeTab === 'restaurants' ? 'active' : ''}`}
          onClick={() => setActiveTab('restaurants')}
        >
          Mis Restaurantes ({restaurants.length})
        </button>
        <button 
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Estadísticas
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'restaurants' && (
          <div className="restaurants-grid">
            {restaurants.length === 0 ? (
              <div className="empty-state">
                <h3>No tienes restaurantes registrados</h3>
                <p>Comienza registrando tu primer restaurante</p>
                <button 
                  onClick={() => navigate('/register-restaurant')}
                  className="btn-primary"
                >
                  Registrar Primer Restaurante
                </button>
              </div>
            ) : (
              restaurants.map(restaurant => (
                <div key={restaurant.restaurante_id} className="restaurant-card">
                  <div className="card-header">
                    <h3>{restaurant.nombre}</h3>
                    <div className="card-actions">
                      <button 
                        onClick={() => navigate(`/vendor/restaurant/${restaurant.restaurante_id}`)}
                        className="btn-edit"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDeleteRestaurant(restaurant.restaurante_id)}
                        className="btn-delete"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  
                  <div className="card-info">
                    <p><strong>Tipo:</strong> {restaurant.tipo_comida}</p>
                    <p><strong>Ubicación:</strong> {restaurant.ubicacion}</p>
                    <p><strong>Precio:</strong> {restaurant.precio_general}</p>
                    <p><strong>Platillos:</strong> {restaurant.total_platillos}</p>
                    <p><strong>Rating:</strong> ⭐ {restaurant.puntaje_promedio?.toFixed(1) || '0.0'}</p>
                  </div>

                  <div className="card-footer">
                    <button 
                      onClick={() => navigate(`/restaurant/${restaurant.restaurante_id}`)}
                      className="btn-view"
                    >
                      Ver Página Pública
                    </button>
                    <button 
                      onClick={() => navigate(`/vendor/restaurant/${restaurant.restaurante_id}/menu`)}
                      className="btn-menu"
                    >
                      Gestionar Menú
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h3>Estadísticas de tus Restaurantes</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <h4>Total Restaurantes</h4>
                <p className="stat-number">{restaurants.length}</p>
              </div>
              <div className="stat-card">
                <h4>Platillos Totales</h4>
                <p className="stat-number">
                  {restaurants.reduce((sum, rest) => sum + (rest.total_platillos || 0), 0)}
                </p>
              </div>
              <div className="stat-card">
                <h4>Rating Promedio</h4>
                <p className="stat-number">
                  {restaurants.length > 0 
                    ? (restaurants.reduce((sum, rest) => sum + (rest.puntaje_promedio || 0), 0) / restaurants.length).toFixed(1)
                    : '0.0'
                  } ⭐
                </p>
              </div>
              <div className="stat-card">
                <h4>Total Reseñas</h4>
                <p className="stat-number">
                  {restaurants.reduce((sum, rest) => sum + (rest.total_reseñas || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;