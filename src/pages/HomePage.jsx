//import React from 'react';
//import '../styles/HomePage.css'; // Importa el CSS específico de esta página
//import logo from '../assets/buho-eats-logo.png'; // Asumiendo que tienes un logo en assets

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BuhoLogo from '../assets/logo_blanco.png'; 
import '../styles/HomePage.css';

const HomePage = () => {
    // Datos de ejemplo para los restaurantes. En un proyecto real, esto vendría de una API.
    const restaurants = [
        {
            id: 1,
            name: "La Trattoria",
            cuisine: "Italiana",
            rating: 4.5,
            price: "$$",
            // IMAGEN TEMÁTICA: Pizza/Italiana - URL Pexels
            image: "https://images.pexels.com/photos/10790638/pexels-photo-10790638.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1", 
            link: "/restaurant/la-trattoria"
        },
        {
            id: 2,
            name: "Tacos El Rey",
            cuisine: "Mexicana",
            rating: 3.8,
            price: "$",
            // IMAGEN TEMÁTICA: Tacos/Mexicana - URL Pexels
            image: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1", 
            link: "/restaurant/tacos-el-rey"
        },
        {
            id: 3,
            name: "Green Leaf Cafe",
            cuisine: "Vegetariana",
            rating: 4.2,
            price: "$$",
            // IMAGEN TEMÁTICA: Ensalada/Vegetariana - URL Pexels
            image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1", 
            link: "/restaurant/green-leaf-cafe"
        },
        {
            id: 4,
            name: "Burger Bros.",
            cuisine: "Americana",
            rating: 4.0,
            price: "$$",
            // IMAGEN TEMÁTICA: Hamburguesas/Americana - URL Pexels
            image: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1", 
            link: "/restaurant/burger-bros"
        },
        {
            id: 5,
            name: "Sushi Sensation",
            cuisine: "Japonesa",
            rating: 4.7,
            price: "$$$",
            // IMAGEN TEMÁTICA: Sushi/Japonesa - URL Pexels
            image: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1", 
            link: "/restaurant/sushi-sensation"
        },
        {
            id: 6,
            name: "El Asador Argentino",
            cuisine: "Argentina",
            rating: 4.9,
            price: "$$$",
            // IMAGEN TEMÁTICA: Carne Asada/Argentina - URL Pexels
            image: "https://www.simplyrecipes.com/thmb/BFZCXxtSY4wiVrTVBC2IgWSK-rk=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Carne-Asada-LEAD-4-5d71826881464bdfaed032d673cd8b1f.jpg", 
            link: "/restaurant/el-asador"
        }
    ];

    // Función para renderizar estrellas según el rating
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let stars = '';
        for (let i = 0; i < fullStars; i++) {
            stars += '⭐';
        }
        if (hasHalfStar) {
            stars += '🌟'; // o puedes usar otro icono para media estrella
        }
        return stars + ` ${rating}`;
    };
    const navigate = useNavigate();
    return (
        <div className="home-page">
            {/* Header */}
            <header className="home-header">
                <div className="logo-container">
                    {/* Asegúrate de que la ruta de tu logo sea correcta */}
                    <img src={BuhoLogo} alt="menUca logo" className="logo" />
                    <span>MenUca</span>
                </div>
                <div className="search-bar">
                    <input type="text" placeholder="Busca restaurantes, platos, tipo de cocina..." />
                    <i className="fa-solid fa-magnifying-glass"></i> {/* Icono de lupa, asume FontAwesome */}
                </div>
                <div className="user-controls">
                    <button onClick={() => navigate("/edit-account")} className="account-button">
                        <i className="fa-solid fa-user"></i> {/* Icono de usuario */}
                        Mi Cuenta
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="home-main">
                {/* Sidebar de filtros */}
                <aside className="filters-sidebar">
                    <h3>Categorías</h3>
                    <ul>
                        <li><i className="fa-solid fa-pizza-slice"></i> Italiana</li>
                        <li><i className="fa-solid fa-burger"></i> Americana</li>
                        <li><i className="fa-solid fa-leaf"></i> Vegetariana</li>
                        <li><i className="fa-solid fa-bowl-rice"></i> Japonesa</li>
                        <li><i className="fa-solid fa-cookie-bite"></i> Postres</li>
                        {/* Agrega más categorías según sea necesario */}
                    </ul>

                    <h3>Precios</h3>
                    <ul>
                        <li>$</li>
                        <li>$$</li>
                        <li>$$$</li>
                    </ul>

                    <h3>Ratings</h3>
                    <ul>
                        <li>⭐ 3 estrellas o más</li>
                        <li>⭐ 4 estrellas o más</li>
                        <li>⭐ 4.5 estrellas o más</li>
                    </ul>
                </aside>

                {/* Grid de restaurantes */}
                <section className="restaurants-grid">
                    {restaurants.map(restaurant => (
                        <div key={restaurant.id} className="restaurant-card">
                            <img src={restaurant.image} alt={restaurant.name} />
                            <div className="card-info">
                                <h3>{restaurant.name}</h3>
                                <p className="cuisine">{restaurant.cuisine}</p>
                                <div className="rating-price">
                                    <span className="rating">{renderStars(restaurant.rating)}</span>
                                    <span className="price">{restaurant.price}</span>
                                </div>
                                <a href={restaurant.link} className="view-menu-button">Ver Menú</a>
                            </div>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
};

export default HomePage;