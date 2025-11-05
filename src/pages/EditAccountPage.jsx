import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/EditAccountPage.css";
import BuhoLogo from "../assets/logo_blanco.png";

export default function EditAccount() {
  const [formData, setFormData] = useState({
    nombre: "Gabriel",
    apellido: "Urquilla",
    correo: "test@buho.com",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Cambios guardados correctamente.");
  };

  const handleGoBack = () => {
    navigate("/home");
  };

  const handleLogin = () => {
    navigate("/");
  };

  return (
    <div className="edit-account-page">
      <header className="home-header">
        <div className="logo-container">
          <img src={BuhoLogo} alt="MenUca logo" className="logo" />
          <span>MenUca</span>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Busca restaurantes, platos, tipo de cocina..."
          />
          <i className="fa-solid fa-magnifying-glass"></i>
        </div>

        <div className="user-controls">
          <button className="account-button logout-btn" onClick={handleLogin}>
            <i className="fa-solid fa-right-from-bracket"></i>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="edit-account-main">
        <div className="edit-card">
          {/* Botón de retroceso con imagen */}
          <button className="back-button" onClick={handleGoBack}>
            <img
              src="https://static.vecteezy.com/system/resources/previews/017/784/917/non_2x/left-arrow-icon-on-transparent-background-free-png.png"
              alt="Volver"
            />
          </button>

          {/* Imagen de perfil */}
          <div className="profile-picture-container">
            <img
              src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
              alt="Foto de perfil"
              className="profile-picture"
            />
          </div>

          <h2>Editar Perfil</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Correo</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="save-button">
              Guardar cambios
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
