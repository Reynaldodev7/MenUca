import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../styles/RestaurantPage.css';
import BuhoLogo from '../assets/logo_blanco.png';
import '../styles/HomePage.css'; // reutilizamos estilos base para coherencia visual

const RestaurantPage = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  // Datos simulados (en proyecto real vendrían de la API o props)
  const restaurants = {
    "la-trattoria": {
      name: "La Trattoria",
      cuisine: "Italiana",
      image: "https://images.pexels.com/photos/10790638/pexels-photo-10790638.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
      description: "Auténtica comida italiana con ingredientes frescos y un toque casero.",
      dishes: [
        { id: 1, name: "Pizza Margherita", price: "$8.99", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSX2w-6ljxAJtEImAJ4zBsRnou1CoSAVmgvQw&s" },
        { id: 2, name: "Pasta Carbonara", price: "$10.50", image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 3, name: "Tiramisú", price: "$5.99", image: "https://images.pexels.com/photos/3026801/pexels-photo-3026801.jpeg?auto=compress&cs=tinysrgb&w=600" },
      ],
    },

    "tacos-el-rey": {
      name: "Tacos El Rey",
      cuisine: "Mexicana",
      image: "https://images.pexels.com/photos/461198/pexels-photo-461198.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
      description: "Tacos auténticos con sabor a México y salsas picantes irresistibles.",
      dishes: [
        { id: 1, name: "Taco al Pastor", price: "$2.50", image: "https://images.pexels.com/photos/1435901/pexels-photo-1435901.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 2, name: "Quesadilla de Pollo", price: "$3.50", image: "https://images.pexels.com/photos/8448323/pexels-photo-8448323.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 3, name: "Agua de Horchata", price: "$1.99", image: "https://mahatmarice.com/wp-content/uploads/2020/04/GettyImages-493110032.jpg" },
      ],
    },

    "green-leaf-cafe": {
      name: "Green Leaf Cafe",
      cuisine: "Vegetariana",
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
      description: "Comida saludable, orgánica y deliciosa para quienes aman lo verde.",
      dishes: [
        { id: 1, name: "Ensalada César Vegana", price: "$7.99", image: "https://images.pexels.com/photos/1640771/pexels-photo-1640771.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 2, name: "Wrap de Falafel", price: "$8.50", image: "https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 3, name: "Smoothie Verde", price: "$4.99", image: "https://images.pexels.com/photos/1640769/pexels-photo-1640769.jpeg?auto=compress&cs=tinysrgb&w=600" },
      ],
    },

    "burger-bros": {
      name: "Burger Bros.",
      cuisine: "Americana",
      image: "https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
      description: "Hamburguesas artesanales con queso derretido y papas crujientes.",
      dishes: [
        { id: 1, name: "Classic Burger", price: "$9.99", image: "https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 2, name: "Bacon & Cheese Burger", price: "$11.50", image: "https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 3, name: "Milkshake de Vainilla", price: "$3.99", image: "https://static1.squarespace.com/static/63bcee2d8ab2cd47fb1169cf/63bcee368ab2cd47fb116bb2/64be9a6e8f3f570e1a3cf016/1690650949584/vanilla-milkshake-with-whipped-cream-and-sprinkles-2023-03-23-06-11-49-utc.png?format=1500w" },
      ],
    },

    "sushi-sensation": {
      name: "Sushi Sensation",
      cuisine: "Japonesa",
      image: "https://images.pexels.com/photos/357756/pexels-photo-357756.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&dpr=1",
      description: "El mejor sushi con ingredientes frescos y técnica japonesa auténtica.",
      dishes: [
        { id: 1, name: "Sushi Roll Clásico", price: "$12.99", image: "https://images.pexels.com/photos/2098085/pexels-photo-2098085.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 2, name: "Sashimi de Salmón", price: "$14.99", image: "https://cdn7.recetasdeescandalo.com/wp-content/uploads/2018/07/Sashimi-de-salmon-con-wasabi-jengibre-y-salsa-de-soja.jpg" },
        { id: 3, name: "Mochi de Té Verde", price: "$5.50", image: "https://evertongroup.com/wp-content/uploads/2020/07/61684623_s.jpg" },
      ],
    },

    "el-asador": {
      name: "El Asador Argentino",
      cuisine: "Argentina",
      image: "https://www.simplyrecipes.com/thmb/BFZCXxtSY4wiVrTVBC2IgWSK-rk=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Carne-Asada-LEAD-4-5d71826881464bdfaed032d673cd8b1f.jpg",
      description: "Cortes de carne premium asados al punto exacto, con sabor argentino.",
      dishes: [
        { id: 1, name: "Bife de Chorizo", price: "$16.99", image: "https://static.esnota.com/uploads/2024/10/bife-de-chorizo.jpg" },
        { id: 2, name: "Empanadas Criollas", price: "$6.50", image: "https://images.pexels.com/photos/3872373/pexels-photo-3872373.jpeg?auto=compress&cs=tinysrgb&w=600" },
        { id: 3, name: "Chimichurri Casero", price: "$2.50", image: "https://images.pexels.com/photos/4686823/pexels-photo-4686823.jpeg?auto=compress&cs=tinysrgb&w=600" },
      ],
    },
  };

  const restaurant = restaurants[restaurantId];

  if (!restaurant) {
    return (
      <div className="restaurant-page not-found">
        <h2>Restaurante no encontrado</h2>
        <button onClick={() => navigate('/')}>Volver al inicio</button>
      </div>
    );
  }

  return (
    <div className="restaurant-page">
      {/* Header reutilizado */}
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

      {/* Botón volver */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <img src="https://static.vecteezy.com/system/resources/previews/017/784/917/non_2x/left-arrow-icon-on-transparent-background-free-png.png"
            alt="Volver" />
      </button>

      {/* Información principal */}
      <div className="restaurant-info">
        <img src={restaurant.image} alt={restaurant.name} className="restaurant-banner" />
        <h2>{restaurant.name}</h2>
        <p className="cuisine">{restaurant.cuisine}</p>
        <p className="description">{restaurant.description}</p>
      </div>

      {/* Menú */}
      <div className="menu-section">
        <h3>Menú</h3>
        <div className="menu-grid">
          {restaurant.dishes.map((dish) => (
            <div key={dish.id} className="dish-card">
              <img src={dish.image} alt={dish.name} />
              <div className="dish-info">
                <h4>{dish.name}</h4>
                <span>{dish.price}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage;
