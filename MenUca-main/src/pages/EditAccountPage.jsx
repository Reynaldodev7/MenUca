import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/EditAccountPage.css";
import BuhoLogo from "../assets/logo_blanco.png";

export default function EditAccount() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    tipo_usuario: ""
  });

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        setUserData(userData);
        setFormData({
          nombre: userData.nombre || "",
          apellido: userData.apellido || "",
          correo: userData.correo || "",
          tipo_usuario: userData.tipo_usuario || ""
        });
      } else {
        throw new Error('Error al cargar datos');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          correo: formData.correo.trim()
        })
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess("Perfil actualizado correctamente");
        const currentUserData = JSON.parse(localStorage.getItem('userData') || '{}');
        localStorage.setItem('userData', JSON.stringify({
          ...currentUserData,
          nombre: formData.nombre,
          apellido: formData.apellido,
          correo: formData.correo
        }));
      } else {
        throw new Error(result.error || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    navigate("/home");
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const handleCancel = () => {
    fetchUserData();
    setError("");
    setSuccess("");
  };

  if (loading) {
    return (
      <div className="edit-account-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando datos del usuario...</p>
        </div>
      </div>
    );
  }

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
          <button className="account-button logout-btn" onClick={handleLogout}>
            <i className="fa-solid fa-right-from-bracket"></i>
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="edit-account-main">
        <div className="edit-card">
          <button className="back-button" onClick={handleGoBack} title="Volver al inicio">
            <i className="fa-solid fa-arrow-left"></i>
          </button>

          <div className="profile-header">
            <div className="profile-picture-container">
              <img
                src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
                alt="Foto de perfil"
                className="profile-picture"
              />
            </div>
            <div className="profile-info">
              <h2>{formData.nombre} {formData.apellido}</h2>
              <p className="user-role">
                {formData.tipo_usuario === 'administrador' && 'Administrador'}
                {formData.tipo_usuario === 'vendedor' && 'Vendedor'}
                {formData.tipo_usuario === 'consumidor' && 'Consumidor'}
              </p>
            </div>
          </div>

          <h3>Editar Información Personal</h3>

          {error && (
            <div className="message error-message">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}
          {success && (
            <div className="message success-message">
              <i className="fa-solid fa-circle-check"></i>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                disabled={saving}
                placeholder="Ingresa tu nombre"
              />
            </div>

            <div className="form-group">
              <label htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleChange}
                required
                disabled={saving}
                placeholder="Ingresa tu apellido"
              />
            </div>

            <div className="form-group">
              <label htmlFor="correo">Correo Electrónico</label>
              <input
                id="correo"
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleChange}
                required
                disabled={saving}
                placeholder="Ingresa tu correo electrónico"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="save-button"
                disabled={saving || !formData.nombre || !formData.apellido || !formData.correo}
              >
                {saving ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk"></i>
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </form>

          {userData && userData.tipo_usuario === 'vendedor' && (
            <div className="vendor-section">
              <h4>Panel de Vendedor</h4>
              <button
                onClick={() => navigate('/vendor/dashboard')}
                className="btn-secondary"
              >
                Gestionar Mis Restaurantes
              </button>
            </div>
          )}

          <div className="account-info">
            <h4>Información de la Cuenta</h4>
            <div className="info-item">
              <span>Tipo de cuenta:</span>
              <strong>
                {formData.tipo_usuario === 'administrador' && 'Administrador'}
                {formData.tipo_usuario === 'vendedor' && 'Vendedor'}
                {formData.tipo_usuario === 'consumidor' && 'Consumidor'}
              </strong>
            </div>
            <div className="info-item">
              <span>Estado:</span>
              <strong className="status-active">Activa</strong>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}