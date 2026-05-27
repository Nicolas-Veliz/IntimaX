{/*import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../../../public/img/Logotipo2.jpeg';

<img src={logo} alt="Logo" />

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(username, password);
      window.location.href = '/';
    } catch (err) {
      setError('❌ Usuario o contraseña incorrectos');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #000000 50%, #000000 100%)'
    }}>
      <div style={{
        background: 'black',
        padding: '20px',
        borderRadius: '10px',
        width: '450px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
        
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <img src={logo} alt="" justifyContent="center" display="flex" height="330px" alignItems="center" marginTop="0px" marginLeft="0px"></img>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#C8A46A' }}>👤 Usuario</label>
            <input
              type="text"
              placeholder="Ingrese su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
              autoFocus
            />
          </div>
          
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#C8A46A' }}>🔒 Contraseña</label>
            <input
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#ccc' : '#B11226',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.3s'
            }}
          >
            {loading ? 'Ingresando...' : 'INGRESAR'}
          </button>
          
          {error && (
            <p style={{ color: 'red', textAlign: 'center', marginTop: '15px', fontSize: '14px' }}>
              {error}
            </p>
          )}
        </form>
        
        <div style={{ 
          marginTop: '25px', 
          paddingTop: '20px', 
          borderTop: '1px solid #eee',
          textAlign: 'center',
          fontSize: '12px',
          color: '#999'
        }}>
          <p>📋 Credenciales de prueba:</p>
          <p><strong>Admin:</strong> admin / admin123</p>
          <p><strong>Recepcionista:</strong> recepcion / recep123</p>
        </div>
      </div>
    </div>
  );
}

export default Login;*/}

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import logo from '../../../public/img/Logotipo2.jpeg';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      await login(username, password);
      window.location.href = '/';
    } catch (err) {
      setError('❌ Usuario o contraseña incorrectos');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #000000 50%, #000000 100%)',
        padding: '20px',
      }}
    >
      <div
        style={{
          background: 'black',
          padding: '30px',
          borderRadius: '10px',
          width: '100%',
          maxWidth: '450px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        }}
      >
        {/* LOGO */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: '25px',
          }}
        >
          <img
            src={logo}
            alt="Logo Intimax"
            style={{
              width: '100%',
              maxWidth: '320px',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit}>
          {/* USUARIO */}
          <div style={{ marginBottom: '15px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                color: '#C8A46A',
                fontSize: '16px',
              }}
            >
              👤 Usuario
            </label>

            <input
              type="text"
              placeholder="Ingrese su usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              style={{
                width: '100%',
                padding: '14px',
                border: '1px solid #444',
                borderRadius: '6px',
                fontSize: '15px',
                boxSizing: 'border-box',
                background: '#f5f5f5',
                outline: 'none',
              }}
            />
          </div>

          {/* CONTRASEÑA */}
          <div style={{ marginBottom: '25px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '5px',
                color: '#C8A46A',
                fontSize: '16px',
              }}
            >
              🔒 Contraseña
            </label>

            <input
              type="password"
              placeholder="Ingrese su contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px',
                border: '1px solid #444',
                borderRadius: '6px',
                fontSize: '15px',
                boxSizing: 'border-box',
                background: '#f5f5f5',
                outline: 'none',
              }}
            />
          </div>

          {/* BOTÓN */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#666' : '#B11226',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '17px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: '0.3s',
            }}
          >
            {loading ? 'Ingresando...' : 'INGRESAR'}
          </button>

          {/* ERROR */}
          {error && (
            <p
              style={{
                color: '#ff4d4d',
                textAlign: 'center',
                marginTop: '15px',
                fontSize: '14px',
              }}
            >
              {error}
            </p>
          )}
        </form>

        {/* CREDENCIALES */}
        <div
          style={{
            marginTop: '25px',
            paddingTop: '20px',
            borderTop: '1px solid #333',
            textAlign: 'center',
            fontSize: '12px',
            color: '#999',
          }}
        >
          <p>📋 Credenciales de prueba:</p>

          <p>
            <strong>Admin:</strong> admin / admin123
          </p>

          <p>
            <strong>Recepcionista:</strong> recepcion / recep123
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;