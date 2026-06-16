import React, { useState, useEffect } from 'react';
import './navbar.css'; 
import { useAuth } from '../contexts/AuthContext'; // Importamos el contexto de autenticación
import logoIntimax_Texto from '../assets/logo-texto.png';

export const Navbar = ({ currentPage, setCurrentPage }) => {
  const [hora, setHora] = useState('');
  const { user, logout } = useAuth(); // Extraemos los datos del usuario logueado y la función logout

  useEffect(() => {
    const actualizarReloj = () => {
      const ahora = new Date();
      const horaFormateada = ahora.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      setHora(horaFormateada);
    };

    actualizarReloj();
    const intervalo = setInterval(actualizarReloj, 1000);

    return () => clearInterval(intervalo);
  }, []);

  // Función prolija para manejar el cierre de sesión
  const handleLogout = () => {
    if (confirm('¿Está seguro de que desea salir del sistema?')) {
      logout();
      window.location.href = '/login';
    }
  };

  return (
    <header className={`dashboard-header ${user?.role !== 'admin' ? 'is-receptionist' : ''}`}>

      {/* Pestañas izquierdas (Públicas para ambos roles) */}
      <div className="nav-group-left">
        <button 
          className={`nav-btn ${currentPage === 'rooms' ? 'active' : ''}`}
          onClick={() => setCurrentPage('rooms')}
        >
          🏨 ROOMS
        </button>
        <button 
          className={`nav-btn ${currentPage === 'contact' ? 'active' : ''}`}
          onClick={() => setCurrentPage('contact')}
        >
          📞 CONTACT
        </button>
      </div>

      {/* Centro absoluto con el imagotipo oficial */}
      <div className="header-center-logo">
        <img src={logoIntimax_Texto} alt="Intimax System" className="logo-text-img-only" />
      </div>

      {/* Pestañas derechas (Filtradas por Rol) */}
      <div className="nav-group-right">
        {/* ABOUT está disponible para ambos */}
        <button 
          className={`nav-btn ${currentPage === 'about' ? 'active' : ''}`}
          onClick={() => setCurrentPage('about')}
        >
          ℹ️ ABOUT
        </button>

        {/* 🔒 Pestañas exclusivas para el Administrador */}
        {user?.role === 'admin' && (
          <>
            <button 
              className={`nav-btn ${currentPage === 'users' ? 'active' : ''}`}
              onClick={() => setCurrentPage('users')}
            >
              👥 USERS
            </button>
            <button 
              className={`nav-btn ${currentPage === 'reports' ? 'active' : ''}`}
              onClick={() => setCurrentPage('reports')}
            >
              📊 REPORTS
            </button>
          </>
        )}
      </div>

      {/* Estado de la Cuenta Activa y Reloj */}
      <div className="header-right-status">
        <div className="time-display">
          <span className="time-icon">⏰</span>
          <span className="time-text">{hora || "Cargando..."}</span>
        </div>
        
        {/* AVATAR CIRCULAR CON INICIALES DINÁMICAS (ESTILO GOOGLE PERFIL) */}
        <div className="user-profile-wrapper">
          <div className="user-avatar-circle">
            {user?.username ? (
              user.username.split(' ').map(name => name[0]).join('').toUpperCase().substring(0, 2)
            ) : (
              user?.role === 'admin' ? 'SR' : 'RE'
            )}
          </div>
          <div className="user-info-sub">
            <span className="user-role-sub">
              {user?.role ? user.role.toUpperCase() : 'USER'}
            </span>
          </div>
        </div>
        
        <button className="logout-btn" onClick={handleLogout}>🚪 EXIT</button>
      </div>

    </header>
  );
};

export default Navbar;