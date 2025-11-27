import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import BuhoLogo from '../assets/logo_blanco.png'; 
import '../styles/HomePage.css';

const HomePage = () => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPrice, setSelectedPrice] = useState('');
    const [selectedRating, setSelectedRating] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const userDataFromStorage = localStorage.getItem('userData');
        
        if (userDataFromStorage) {
            try {
                const parsedData = JSON.parse(userDataFromStorage);
                setUserData(parsedData);
            } catch (error) {
                console.error('Error parsing userData:', error);
            }
        }
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await fetch('http://localhost:5000/api/restaurants');
            
            if (!response.ok) {
                throw new Error('Error al cargar restaurantes');
            }
            
            const data = await response.json();
            setRestaurants(data);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            setError('No se pudieron cargar los restaurantes');
        } finally {
            setLoading(false);
        }
    };

    const filteredRestaurants = restaurants.filter(restaurant => {
        const matchesSearch = restaurant.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            restaurant.tipo_comida.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            restaurant.ubicacion.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = !selectedCategory || restaurant.tipo_comida === selectedCategory;
        const matchesPrice = !selectedPrice || restaurant.precio_general === selectedPrice.toLowerCase();
        const matchesRating = !selectedRating || (restaurant.puntaje_promedio && restaurant.puntaje_promedio >= selectedRating);

        return matchesSearch && matchesCategory && matchesPrice && matchesRating;
    });

    const renderStars = (rating) => {
        if (!rating || rating === 0) return 'Sin calificaciones';
        
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        return (
            <>
                {'⭐'.repeat(fullStars)}
                {hasHalfStar && '🌟'}
                <span> {rating.toFixed(1)}</span>
            </>
        );
    };

    const getPriceSymbols = (precioGeneral) => {
        switch (precioGeneral) {
            case 'economico':
                return '$';
            case 'moderado':
                return '$$';
            case 'premium':
                return '$$$';
            default:
                return '$$';
        }
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

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        navigate('/');
        window.location.reload();
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleCategoryFilter = (category) => {
        setSelectedCategory(category === selectedCategory ? '' : category);
    };

    const handlePriceFilter = (price) => {
        setSelectedPrice(price === selectedPrice ? '' : price);
    };

    const handleRatingFilter = (rating) => {
        setSelectedRating(rating === selectedRating ? 0 : rating);
    };

    const formatTime = (timeString) => {
        if (!timeString) return '';
        return timeString.substring(0, 5);
    };

    const categories = [...new Set(restaurants.map(r => r.tipo_comida))].filter(Boolean);

    return (
        <div className="home-page">
            <header className="home-header">
                <div className="logo-container">
                    <img src={BuhoLogo} alt="menUca logo" className="logo" />
                    <span>MenUca</span>
                </div>
                <div className="search-bar">
                    <input 
                        type="text" 
                        placeholder="Busca restaurantes, platos, tipo de cocina..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                    />
                    <i className="fa-solid fa-magnifying-glass"></i>
                </div>
                <div className="user-controls">
                    {userData && userData.tipo_usuario === 'vendedor' && (
                        <button 
                            onClick={() => navigate("/vendor/dashboard")} 
                            className="account-button vendor-btn"
                        >
                            <i className="fa-solid fa-store"></i>
                            Panel Vendedor
                        </button>
                    )}
                    
                    <button onClick={() => navigate("/edit-account")} className="account-button">
                        <i className="fa-solid fa-user"></i>
                        Mi Cuenta
                    </button>

                    <button className="account-button logout-btn" onClick={handleLogout}>
                        <i className="fa-solid fa-right-from-bracket"></i>
                        Cerrar sesión
                    </button>
                </div>
            </header>

            <main className="home-main">
                <aside className="filters-sidebar">
                    <h3>Categorías</h3>
                    <ul>
                        <li 
                            className={selectedCategory === '' ? 'active' : ''}
                            onClick={() => handleCategoryFilter('')}
                        >
                            <i className="fa-solid fa-utensils"></i>
                            Todas las categorías
                        </li>
                        {categories.map(category => (
                            <li 
                                key={category}
                                className={selectedCategory === category ? 'active' : ''}
                                onClick={() => handleCategoryFilter(category)}
                            >
                                <i className="fa-solid fa-utensils"></i>
                                {category}
                            </li>
                        ))}
                    </ul>

                    <h3>Precios</h3>
                    <ul>
                        <li 
                            className={selectedPrice === '' ? 'active' : ''}
                            onClick={() => handlePriceFilter('')}
                        >
                            Todos los precios
                        </li>
                        <li 
                            className={selectedPrice === 'economico' ? 'active' : ''}
                            onClick={() => handlePriceFilter('economico')}
                        >
                            $ Económico
                        </li>
                        <li 
                            className={selectedPrice === 'moderado' ? 'active' : ''}
                            onClick={() => handlePriceFilter('moderado')}
                        >
                            $$ Moderado
                        </li>
                        <li 
                            className={selectedPrice === 'premium' ? 'active' : ''}
                            onClick={() => handlePriceFilter('premium')}
                        >
                            $$$ Premium
                        </li>
                    </ul>

                    <h3>Ratings</h3>
                    <ul>
                        <li 
                            className={selectedRating === 0 ? 'active' : ''}
                            onClick={() => handleRatingFilter(0)}
                        >
                            Todas las calificaciones
                        </li>
                        <li 
                            className={selectedRating === 3 ? 'active' : ''}
                            onClick={() => handleRatingFilter(3)}
                        >
                            ⭐ 3 estrellas o más
                        </li>
                        <li 
                            className={selectedRating === 4 ? 'active' : ''}
                            onClick={() => handleRatingFilter(4)}
                        >
                            ⭐ 4 estrellas o más
                        </li>
                        <li 
                            className={selectedRating === 4.5 ? 'active' : ''}
                            onClick={() => handleRatingFilter(4.5)}
                        >
                            ⭐ 4.5 estrellas o más
                        </li>
                    </ul>
                </aside>

                <div className="restaurants-grid-container">
                    <section className="restaurants-grid">
                        {loading ? (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>Cargando restaurantes...</p>
                            </div>
                        ) : error ? (
                            <div className="error-message">
                                <p>{error}</p>
                                <button onClick={fetchRestaurants} className="retry-button">
                                    Reintentar
                                </button>
                            </div>
                        ) : filteredRestaurants.length === 0 ? (
                            <div className="no-restaurants">
                                <p>No hay restaurantes que coincidan con tu búsqueda.</p>
                                {userData && userData.tipo_usuario === 'vendedor' && (
                                    <button 
                                        onClick={() => navigate("/register-restaurant")} 
                                        className="register-first-btn"
                                    >
                                        ¡Registra el primer restaurante!
                                    </button>
                                )}
                            </div>
                        ) : (
                            filteredRestaurants.map(restaurant => (
                                <div 
                                    key={restaurant.restaurante_id} 
                                    className="restaurant-card"
                                    onClick={() => navigate(`/restaurant/${restaurant.restaurante_id}`)}
                                >
                                    <img 
                                        src={getRestaurantImage(restaurant.tipo_comida)} 
                                        alt={restaurant.nombre}
                                        onError={(e) => {
                                            e.target.src = 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg';
                                        }}
                                    />
                                    <div className="card-info">
                                        <h3>{restaurant.nombre}</h3>
                                        <p className="cuisine">{restaurant.tipo_comida}</p>
                                        <p className="location">
                                            <i className="fa-solid fa-location-dot"></i>
                                            {restaurant.ubicacion}
                                        </p>
                                        <div className="rating-price">
                                            <span className="rating">
                                                {renderStars(restaurant.puntaje_promedio)}
                                            </span>
                                            <span className="price">
                                                {getPriceSymbols(restaurant.precio_general)}
                                            </span>
                                        </div>
                                        <div className="restaurant-details">
                                            <span className="wait-time">
                                                <i className="fa-solid fa-clock"></i>
                                                {restaurant.tiempo_espera_promedio || 20} min aprox.
                                            </span>
                                            <span className="hours">
                                                <i className="fa-solid fa-door-open"></i>
                                                {formatTime(restaurant.horario_apertura)} - {formatTime(restaurant.horario_cierre)}
                                            </span>
                                        </div>
                                        <button 
                                            className="view-menu-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/restaurant/${restaurant.restaurante_id}`);
                                            }}
                                        >
                                            Ver Menú
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};

export default HomePage;