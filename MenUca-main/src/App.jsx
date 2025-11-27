import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import HomePage from './pages/HomePage';
import EditAccount from './pages/EditAccountPage';
import RegisterRestaurant from './pages/RegisterRestaurant';
import RestaurantPage from './pages/RestaurantPage';
import VendorDashboard from './pages/VendorDashboard';
import RestaurantManagement from './pages/RestaurantManagement';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Rutas protegidas - Todos los usuarios */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/edit-account" 
            element={
              <ProtectedRoute>
                <EditAccount />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/restaurant/:restaurantId" 
            element={
              <ProtectedRoute>
                <RestaurantPage />
              </ProtectedRoute>
            } 
          />

          {/* Rutas protegidas - Solo vendedores */}
          <Route 
            path="/register-restaurant" 
            element={
              <ProtectedRoute>
                <RegisterRestaurant />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/vendor/dashboard" 
            element={
              <ProtectedRoute>
                <VendorDashboard />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/vendor/restaurant/:restaurantId" 
            element={
              <ProtectedRoute>
                <RestaurantManagement />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/vendor/restaurant/:restaurantId/menu" 
            element={
              <ProtectedRoute>
                <RestaurantManagement />
              </ProtectedRoute>
            } 
          />

          {/* Ruta para 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;