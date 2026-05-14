import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout({ children, currentPage, setCurrentPage }) {
  const { user } = useAuth();
  
  // Determinar si es admin/gerente
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'supervisor';
  
  // Si es empleado (receptionist), mostrar solo el contenido, sin navbar/footer
  if (!isAdminOrManager) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        {children}
      </div>
    );
  }
  
  // Si es admin/gerente, mostrar interfaz completa con navbar y footer
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div style={{ flex: 1, padding: '20px', background: '#f5f5f5' }}>
        {children}
      </div>
      <Footer />
    </div>
  );
}

export default Layout;