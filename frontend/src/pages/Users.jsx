import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

function Users() {
  const navigate = useNavigate();

  return (
    <div className="intimax-dashboard">
      <Navbar currentPage="users" setCurrentPage={() => {}} />

      <main className="dashboard-main" style={{ padding: '40px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', background: '#111827', border: '1px solid #374151', borderRadius: '16px', padding: '32px', color: '#f9fafb' }}>
          <h2 style={{ marginBottom: '12px', fontSize: '28px' }}>USERS & STAFF</h2>
          <p style={{ lineHeight: 1.7, color: '#d1d5db', marginBottom: '20px' }}>
            Aquí puedes gestionar la información de usuarios y personal del sistema.
          </p>
          <p style={{ lineHeight: 1.7, color: '#d1d5db', marginBottom: '24px' }}>
            Esta vista fue convertida en una ruta real para que funcione igual que About.
          </p>

          <button
            onClick={() => navigate('/')}
            style={{
              background: '#f59e0b',
              color: '#111827',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 18px',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            VOLVER AL DASHBOARD
          </button>
        </div>
      </main>
    </div>
  );
}

export default Users;
