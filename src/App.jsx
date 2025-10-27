import React from 'react';
import { Routes, Route} from 'react-router-dom'
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css'; 

function App() {

  return (
    <div className="app-container">

      <Routes>
        
        {/* Ruta login*/}
        <Route 
          path="/" 
          element={<LoginPage />} 
        />
        
        {/* Ruta register*/}
        <Route 
          path="/register" 
          element={<RegisterPage />} 
        />
        
        {/* Ruta para 404 */}
        <Route 
          path="*" 
          element={<NotFoundPage />} 
        />

      </Routes>
    </div>
  );
}

export default App;
