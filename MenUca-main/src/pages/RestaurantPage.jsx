import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/RestaurantPage.css';
import BuhoLogo from '../assets/logo_blanco.png';

const RestaurantPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState(null);
  const [dishes, setDishes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('menu');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [userData, setUserData] = useState(null);
  const [reviewData, setReviewData] = useState({
    puntaje_general: 5,
    titulo: '',
    descripcion: '',
    calidad_comida: 5,
    tiempo_espera: 5,
    atencion_cliente: 5,
    cantidad_comida: 5
  });

  // Obtener userData del localStorage
  useEffect(() => {
    const userDataFromStorage = localStorage.getItem('userData');
    if (userDataFromStorage) {
      setUserData(JSON.parse(userDataFromStorage));
    }
  }, []);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching restaurant data for ID:', restaurantId);

      const restaurantResponse = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}`);

      if (!restaurantResponse.ok) {
        throw new Error('Restaurante no encontrado');
      }

      const restaurantData = await restaurantResponse.json();
      console.log('Restaurant data:', restaurantData);

      const dishesResponse = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}/dishes`);
      let dishesData = [];

      if (dishesResponse.ok) {
        const dishesResult = await dishesResponse.json();
        dishesData = Array.isArray(dishesResult) ? dishesResult : [];
        console.log('Dishes data:', dishesData);
      }

      // Cargar reseñas
      const reviewsResponse = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}/reviews`);
      let reviewsData = [];

      if (reviewsResponse.ok) {
        const reviewsResult = await reviewsResponse.json();
        reviewsData = Array.isArray(reviewsResult) ? reviewsResult : [];
        console.log('Reviews data:', reviewsData);
      }

      setRestaurant({
        id: restaurantData.restaurante_id,
        name: restaurantData.nombre,
        cuisine: restaurantData.tipo_comida,
        image: getRestaurantImage(restaurantData.tipo_comida),
        description: `Ubicación: ${restaurantData.ubicacion}. ${restaurantData.tipo_comida} de calidad ${restaurantData.precio_general}.`,
        precio_general: restaurantData.precio_general,
        ubicacion: restaurantData.ubicacion,
        horario_apertura: restaurantData.horario_apertura,
        horario_cierre: restaurantData.horario_cierre,
        tiempo_espera_promedio: restaurantData.tiempo_espera_promedio,
        puntaje_promedio: restaurantData.puntaje_promedio || 0,
        total_reseñas: restaurantData.total_reseñas || 0
      });

      const mappedDishes = dishesData.map(dish => ({
        id: dish.platillo_id,
        name: dish.nombre,
        price: `$${dish.precio}`,
        image: getDishImage(dish.nombre, restaurantData.tipo_comida),
        ingredients: dish.ingredientes || 'Ingredientes no especificados',
        includesDrink: dish.incluye_bebida || false,
        unitsAvailable: dish.unidades_disponibles || 0
      }));

      setDishes(mappedDishes);
      setReviews(reviewsData);

    } catch (err) {
      console.error('Error fetching restaurant data:', err);
      setError('Error al cargar la información del restaurante');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Debes iniciar sesión para agregar una reseña');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/restaurants/${restaurantId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(reviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al enviar reseña');
      }

      alert('Reseña agregada exitosamente!');
      setShowReviewForm(false);
      setReviewData({
        puntaje_general: 5,
        titulo: '',
        descripcion: '',
        calidad_comida: 5,
        tiempo_espera: 5,
        atencion_cliente: 5,
        cantidad_comida: 5
      });

      // Recargar reseñas
      fetchRestaurantData();

    } catch (error) {
      alert(error.message);
    }
  };

  const renderStars = (rating) => {
    if (!rating) return '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    return '⭐'.repeat(fullStars) + (hasHalfStar ? '🌟' : '');
  };

  const getRestaurantImage = (tipoComida) => {
    const imageMap = {
      'Carnes y Parrilla': 'https://images.pexels.com/photos/10790638/pexels-photo-10790638.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
      'Comida Japonesa': 'https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
      'Comida Tradicional': 'https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
      'Italiana': 'https://images.pexels.com/photos/10790638/pexels-photo-10790638.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1',
      'Saludable': 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1'
    };

    return imageMap[tipoComida] || 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1';
  };

  const getDishImage = (nombrePlatillo) => {
    const dishImageMap = {
      'Bife de Chorizo': 'https://static.esnota.com/uploads/2024/10/bife-de-chorizo.jpg',
      'Asado de Tira': 'https://images.pexels.com/photos/65175/pexels-photo-65175.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Milanesa Napolitana': 'https://images.pexels.com/photos/675951/pexels-photo-675951.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Empanadas Criollas': 'https://images.pexels.com/photos/3872373/pexels-photo-3872373.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Sushi Mixto': 'https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Tempura de Camarón': 'https://images.pexels.com/photos/884596/pexels-photo-884596.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Ramen Tradicional': 'https://images.pexels.com/photos/884600/pexels-photo-884600.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Gyozas de Cerdo': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Sashimi Premium': 'https://cdn7.recetasdeescandalo.com/wp-content/uploads/2018/07/Sashimi-de-salmon-con-wasabi-jengibre-y-salsa-de-soja.jpg',
      'Pupusas Revueltas': 'https://images.pexels.com/photos/1435901/pexels-photo-1435901.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Pupusas de Queso': 'https://images.pexels.com/photos/8448323/pexels-photo-8448323.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Plátanos Fritos': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Pizza Margherita': 'https://images.pexels.com/photos/10790638/pexels-photo-10790638.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Pizza Pepperoni': 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Lasagna Tradicional': 'https://images.pexels.com/photos/4079522/pexels-photo-4079522.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Risotto de Champiñones': 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Ensalada César': 'https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Bowl de Quinoa': 'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Wrap de Pollo': 'https://images.pexels.com/photos/1640769/pexels-photo-1640769.jpeg?auto=compress&cs=tinysrgb&w=600',
      'Smoothie Verde': 'https://images.pexels.com/photos/1640769/pexels-photo-1640769.jpeg?auto=compress&cs=tinysrgb&w=600'
    };

    return dishImageMap[nombrePlatillo] || 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=600';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantData();
    }
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="restaurant-page" style={{ 
        backgroundColor: '#f5f5f5', 
        minHeight: '100vh',
        color: '#333'
      }}>
        <header className="home-header">
          <div className="logo-container">
            <img src={BuhoLogo} alt="menUca logo" className="logo" />
            <span>MenUca</span>
          </div>
          <div className="user-controls">
            <button onClick={() => navigate("/edit-account")} className="account-button">
              <i className="fa-solid fa-user"></i> Mi Cuenta
            </button>
            {userData && userData.tipo_usuario === 'vendedor' && (
              <button
                onClick={() => navigate(`/vendor/restaurant/${restaurantId}`)}
                className="account-button vendor-btn"
              >
                <i className="fa-solid fa-edit"></i>
                Gestionar
              </button>
            )}
          </div>
        </header>
        <div className="loading-container">
          <p>Cargando información del restaurante...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="restaurant-page" style={{ 
        backgroundColor: '#f5f5f5', 
        minHeight: '100vh',
        color: '#333'
      }}>
        <header className="home-header">
          <div className="logo-container">
            <img src={BuhoLogo} alt="menUca logo" className="logo" />
            <span>MenUca</span>
          </div>
          <div className="user-controls">
            <button onClick={() => navigate("/edit-account")} className="account-button">
              <i className="fa-solid fa-user"></i> Mi Cuenta
            </button>
          </div>
        </header>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchRestaurantData}>Reintentar</button>
          <button onClick={() => navigate('/home')} className="back-home-btn">
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="restaurant-page not-found" style={{ 
        backgroundColor: '#f5f5f5', 
        minHeight: '100vh',
        color: '#333'
      }}>
        <header className="home-header">
          <div className="logo-container">
            <img src={BuhoLogo} alt="menUca logo" className="logo" />
            <span>MenUca</span>
          </div>
          <div className="user-controls">
            <button onClick={() => navigate("/edit-account")} className="account-button">
              <i className="fa-solid fa-user"></i> Mi Cuenta
            </button>
          </div>
        </header>
        <div className="not-found-container">
          <h2>Restaurante no encontrado</h2>
          <p>El restaurante que buscas no existe o no está disponible.</p>
          <button onClick={() => navigate('/home')}>Volver al inicio</button>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-page" style={{ 
      backgroundColor: '#f5f5f5', 
      minHeight: '100vh',
      color: '#333'
    }}>
      <header className="home-header">
        <div className="logo-container">
          <img src={BuhoLogo} alt="menUca logo" className="logo" />
          <span>MenUca</span>
        </div>
        <div className="user-controls">
          <button onClick={() => navigate("/edit-account")} className="account-button">
            <i className="fa-solid fa-user"></i> Mi Cuenta
          </button>
          {userData && userData.tipo_usuario === 'vendedor' && (
            <button
              onClick={() => navigate(`/vendor/restaurant/${restaurantId}`)}
              className="account-button vendor-btn"
            >
              <i className="fa-solid fa-edit"></i>
              Gestionar
            </button>
          )}
        </div>
      </header>

      <button className="back-button" onClick={() => navigate(-1)}>
        <img src="https://static.vecteezy.com/system/resources/previews/017/784/917/non_2x/left-arrow-icon-on-transparent-background-free-png.png" alt="Volver" />
      </button>

      <div className="restaurant-info">
        <img src={restaurant.image} alt={restaurant.name} className="restaurant-banner" />
        <h2>{restaurant.name}</h2>
        <p className="cuisine">{restaurant.cuisine}</p>
        <div className="restaurant-rating">
          <span className="rating-stars">{renderStars(restaurant.puntaje_promedio)}</span>
          <span className="rating-text">({restaurant.puntaje_promedio?.toFixed(1) || '0.0'}) • {restaurant.total_reseñas || 0} reseñas</span>
        </div>
        <p className="description">{restaurant.description}</p>

        <div className="restaurant-details">
          <div className="detail-item">
            <i className="fa-solid fa-location-dot"></i>
            <span>{restaurant.ubicacion}</span>
          </div>
          <div className="detail-item">
            <i className="fa-solid fa-clock"></i>
            <span>Horario: {formatTime(restaurant.horario_apertura)} - {formatTime(restaurant.horario_cierre)}</span>
          </div>
          <div className="detail-item">
            <i className="fa-solid fa-stopwatch"></i>
            <span>Tiempo de espera: {restaurant.tiempo_espera_promedio} min</span>
          </div>
          <div className="detail-item">
            <i className="fa-solid fa-tag"></i>
            <span>Precio: {restaurant.precio_general}</span>
          </div>
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="restaurant-tabs">
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
          Reseñas ({reviews.length})
        </button>
      </div>

      {/* Contenido de Tabs */}
      {activeTab === 'menu' && (
        <div className="menu-section">
          <h3>Menú ({dishes.length} platillos)</h3>
          {dishes.length > 0 ? (
            <div className="menu-grid">
              {dishes.map((dish) => (
                <div key={dish.id} className="dish-card">
                  <img src={dish.image} alt={dish.name} />
                  <div className="dish-info">
                    <h4>{dish.name}</h4>
                    <div className="dish-details">
                      <span className="dish-price">{dish.price}</span>
                      {dish.includesDrink && (
                        <span className="includes-drink">Incluye bebida</span>
                      )}
                    </div>
                    {dish.ingredients && (
                      <p className="dish-ingredients">
                        {dish.ingredients.length > 100
                          ? `${dish.ingredients.substring(0, 100)}...`
                          : dish.ingredients}
                      </p>
                    )}
                    {dish.unitsAvailable !== undefined && (
                      <p className={`dish-stock ${dish.unitsAvailable === 0 ? 'out-of-stock' : ''}`}>
                        {dish.unitsAvailable > 0
                          ? `${dish.unitsAvailable} disponibles`
                          : 'Agotado'}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-dishes">
              <p>Este restaurante no tiene platillos disponibles en este momento.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'reviews' && (
        <div className="reviews-section">
          <div className="reviews-header">
            <h3>Reseñas ({reviews.length})</h3>
            <button
              className="add-review-button"
              onClick={() => setShowReviewForm(!showReviewForm)}
            >
              {showReviewForm ? 'Cancelar' : 'Agregar Reseña'}
            </button>
          </div>

          {showReviewForm && (
            <form className="review-form" onSubmit={handleReviewSubmit}>
              <h4>Escribe tu reseña</h4>

              <div className="form-group">
                <label>Puntaje General *</label>
                <select
                  value={reviewData.puntaje_general}
                  onChange={(e) => setReviewData({ ...reviewData, puntaje_general: parseInt(e.target.value) })}
                  required
                >
                  <option value={5}>5 ⭐ (Excelente)</option>
                  <option value={4}>4 ⭐ (Muy Bueno)</option>
                  <option value={3}>3 ⭐ (Bueno)</option>
                  <option value={2}>2 ⭐ (Regular)</option>
                  <option value={1}>1 ⭐ (Malo)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Título</label>
                <input
                  type="text"
                  value={reviewData.titulo}
                  onChange={(e) => setReviewData({ ...reviewData, titulo: e.target.value })}
                  placeholder="Resumen de tu experiencia..."
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={reviewData.descripcion}
                  onChange={(e) => setReviewData({ ...reviewData, descripcion: e.target.value })}
                  placeholder="Comparte los detalles de tu experiencia..."
                  rows="4"
                />
              </div>

              <div className="rating-categories">
                <div className="rating-category">
                  <label>Calidad de Comida</label>
                  <select
                    value={reviewData.calidad_comida}
                    onChange={(e) => setReviewData({ ...reviewData, calidad_comida: parseInt(e.target.value) })}
                  >
                    {[5, 4, 3, 2, 1].map(num => (
                      <option key={num} value={num}>{num} ⭐</option>
                    ))}
                  </select>
                </div>

                <div className="rating-category">
                  <label>Tiempo de Espera</label>
                  <select
                    value={reviewData.tiempo_espera}
                    onChange={(e) => setReviewData({ ...reviewData, tiempo_espera: parseInt(e.target.value) })}
                  >
                    {[5, 4, 3, 2, 1].map(num => (
                      <option key={num} value={num}>{num} ⭐</option>
                    ))}
                  </select>
                </div>

                <div className="rating-category">
                  <label>Atención al Cliente</label>
                  <select
                    value={reviewData.atencion_cliente}
                    onChange={(e) => setReviewData({ ...reviewData, atencion_cliente: parseInt(e.target.value) })}
                  >
                    {[5, 4, 3, 2, 1].map(num => (
                      <option key={num} value={num}>{num} ⭐</option>
                    ))}
                  </select>
                </div>

                <div className="rating-category">
                  <label>Cantidad de Comida</label>
                  <select
                    value={reviewData.cantidad_comida}
                    onChange={(e) => setReviewData({ ...reviewData, cantidad_comida: parseInt(e.target.value) })}
                  >
                    {[5, 4, 3, 2, 1].map(num => (
                      <option key={num} value={num}>{num} ⭐</option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="submit-review-button">
                Enviar Reseña
              </button>
            </form>
          )}

          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map((review) => (
                <div key={review.reseña_id} className="review-card">
                  <div className="review-header">
                    <div className="review-user">
                      <strong>{review.usuario_nombre}</strong>
                      <span className="review-date">
                        {new Date(review.fecha_creacion).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="review-rating">
                      {renderStars(review.puntaje_general)} ({review.puntaje_general})
                    </div>
                  </div>

                  {review.titulo && <h4>{review.titulo}</h4>}

                  {review.comentario && (
                    <p className="review-comment">{review.comentario}</p>
                  )}

                  <div className="review-details">
                    {review.calidad_comida && (
                      <span>Comida: {renderStars(review.calidad_comida)}</span>
                    )}
                    {review.tiempo_espera && (
                      <span>Tiempo: {renderStars(review.tiempo_espera)}</span>
                    )}
                    {review.atencion_cliente && (
                      <span>Atención: {renderStars(review.atencion_cliente)}</span>
                    )}
                    {review.cantidad_comida && (
                      <span>Cantidad: {renderStars(review.cantidad_comida)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-reviews">
              <p>Este restaurante aún no tiene reseñas.</p>
              <p>¡Sé el primero en compartir tu experiencia!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RestaurantPage;