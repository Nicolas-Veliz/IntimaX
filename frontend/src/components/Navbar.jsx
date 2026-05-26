import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './Avatar';

function Navbar({ currentPage, setCurrentPage }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  // Obtener turno en texto
  const getShiftText = () => {
    const shifts = { mañana: '🌅 Mañana', tarde: '☀️ Tarde', noche: '🌙 Noche' };
    return shifts[user?.shift] || '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="logo-icon">🏨</span>
        <span className="logo-text">INTIMAX</span>
        <span className="logo-sub">SYSTEM</span>
      </div>
      
      <div className="navbar-menu">
        <button 
          className={`nav-link ${currentPage === 'rooms' ? 'active' : ''}`}
          onClick={() => setCurrentPage('rooms')}
        >
          🏠 ROOMS
        </button>
        <button 
          className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`}
          onClick={() => setCurrentPage('contact')}
        >
          📞 CONTACT
        </button>
        <button 
          className={`nav-link ${currentPage === 'about' ? 'active' : ''}`}
          onClick={() => setCurrentPage('about')}
        >
          ℹ️ ABOUT US
        </button>
        
        {isAdmin && (
          <>
            <button 
              className={`nav-link ${currentPage === 'users' ? 'active' : ''}`}
              onClick={() => setCurrentPage('users')}
            >
              👥 USUARIOS
            </button>
            <button 
              className={`nav-link ${currentPage === 'reports' ? 'active' : ''}`}
              onClick={() => setCurrentPage('reports')}
            >
              📊 REPORTES
            </button>
          </>
        )}
      </div>
      
      <div className="navbar-user">
        <div className="user-info-container">
          <Avatar user={user} />
          <div className="user-details">
            <span className="user-name">{user?.first_name} {user?.last_name}</span>
            <span className="user-shift">{getShiftText()}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;