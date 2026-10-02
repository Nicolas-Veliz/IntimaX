import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // 1. IMPORTAMOS THE HOOK DE REDIRECCIÓN
import logo from '../../../public/img/Logotipo2.jpeg';
import classImg from '../../../public/img/Class.png';
import oasisHotelImg from '../../../public/img/oasisHotel.jpg';


function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate(); // 2. INICIALIZAMOS EL NAVEGADOR INTERNO

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      await login(username, password);
      // 3. CAMBIO CLAVE: Navegamos internamente sin recargar la app ni perder el contexto
      navigate('/'); 
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
                color: '#000000',
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
                color: '#000000',
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

        {/* NUESTROS CLIENTES - CAROUSEL */}
        <div
          style={{
            marginTop: '25px',
            paddingTop: '20px',
            borderTop: '1px solid #333',
            textAlign: 'center',
            fontSize: '14px',
            color: '#fff',
          }}
        >
          <h3 style={{ color: '#C8A46A', marginBottom: '12px', fontSize: '16px' }}>Nuestros Clientes</h3>

          {/* Carousel container */}
          <ClientCarousel />
        </div>
      </div>
    </div>
  );
}

export default Login;

function ClientCarousel() {
  const clientImages = [
    classImg,
    oasisHotelImg,
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % clientImages.length);
    }, 5000); // autoplay más lento: 5 segundos
    return () => clearInterval(id);
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + clientImages.length) % clientImages.length);
  const next = () => setCurrent((c) => (c + 1) % clientImages.length);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: 340 }}>
        <div style={{ overflow: 'hidden', borderRadius: 8, background: 'transparent', padding: 12 }}>
          <div
            style={{
              display: 'flex',
              width: `${clientImages.length * 100}%`,
              transform: `translateX(-${current * (100 / clientImages.length)}%)`,
              transition: 'transform 0.8s ease',
            }}
          >
            {clientImages.map((src, i) => (
              <div key={i} style={{ flex: `0 0 ${100 / clientImages.length}%`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img loading="lazy" src={src} alt={`client-${i}`} style={{ maxWidth: '260px', maxHeight: '110px', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>

        <button onClick={prev} aria-label="anterior" style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}>‹</button>
        <button onClick={next} aria-label="siguiente" style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.45)', color: '#fff', border: 'none', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}>›</button>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {clientImages.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)} aria-label={`ir a ${i}`} style={{ width: 8, height: 8, borderRadius: 8, border: 'none', background: i === current ? '#C8A46A' : '#666', cursor: 'pointer' }} />
        ))}
      </div>
    </div>
  );
}