import React from 'react';
import { useAuth } from '../contexts/AuthContext';

function Footer() {
    const { user } = useAuth();
    const currentYear = new Date().getFullYear();

    // Si no es admin, no mostrar footer
    if (user?.role !== 'admin' && user?.role !== 'supervisor') {
        return null;
    }

    return (
    <footer style={{
            background: '#2c3e50',
            color: '#ecf0f1',
            padding: '30px 20px 20px',
            marginTop: '40px',
            fontSize: '14px'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '30px',
                    marginBottom: '30px'
                }}>

                    {/* Info del sistema */}
                    <div>
                        <h4 style={{ marginBottom: '15px', color: '#3498db' }}>🏨 Telo Management System</h4>
                        <p>Sistema profesional para gestión de albergues transitorios</p>
                        <p>Versión 2.0.0 - Enterprise</p>
                        <p style={{ fontSize: '12px', marginTop: '10px' }}>© {currentYear} Telo System</p>
                    </div>

                    {/* Enlaces rápidos */}
                    <div>
                        <h4 style={{ marginBottom: '15px', color: '#3498db' }}>Enlaces útiles</h4>
                        <p><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>📖 Manual de usuario</a></p>
                        <p><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>🐛 Reportar error</a></p>
                        <p><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>💡 Solicitar feature</a></p>
                        <p><a href="#" style={{ color: '#ecf0f1', textDecoration: 'none' }}>🔒 Políticas de privacidad</a></p>
                    </div>

          {/* Contacto y soporte */ }
    <div>
        <h4 style={{ marginBottom: '15px', color: '#3498db' }}>Contacto</h4>
        <p>📧 soporte@telosystem.com</p>
        <p>📞 (011) 1234-5678</p>
        <p>🕒 Soporte técnico: 24/7</p>
        <p>💬 Respuesta garantizada en &lt; 2hs</p>
    </div>

    {/* Estadísticas rápidas */ }
    <div>
        <h4 style={{ marginBottom: '15px', color: '#3498db' }}>Sistema</h4>
        <p>✅ Base de datos: MySQL</p>
        <p>✅ Backend: Node.js + Express</p>
        <p>✅ Frontend: React + Vite</p>
        <p>🔒 Datos anonimizados</p>
    </div>
        */</div >
        
        <hr style={{ margin: '20px 0', borderColor: '#34495e' }} />
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '12px',
          opacity: 0.8
        }}>
          <div>✨ Cumple con normativas de privacidad - Sin almacenamiento de datos personales</div>
          <div>🛡️ Sistema seguro para entornos críticos</div>
        </div>
      </div >
    </footer >
  );
}

export default Footer;