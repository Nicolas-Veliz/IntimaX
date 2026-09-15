import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#070708', 
        color: '#E8BA6F', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        fontFamily: 'Montserrat',
        fontWeight: 'bold'
      }}>
        Cargando sistema de seguridad...
      </div>
    );
  }

  if (!user) {
    // CORRECCIÓN CLAVE: Agregamos la barra "/" para hacer la ruta absoluta
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default PrivateRoute;