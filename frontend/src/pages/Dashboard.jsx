import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRooms, createShift, registerPayment, markCleaned, extendShift, getTodayMetrics } from '../services/api';
import io from 'socket.io-client';
import './Dashboard.css';
import Navbar from '../components/Navbar';

const socket = io('http://localhost:3000');

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [duration, setDuration] = useState(2);
  const [notifications, setNotifications] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState('rooms');
  const { user, logout } = useAuth();


  useEffect(() => {
    loadRooms();
    loadMetrics();

    // Reloj en tiempo real
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    socket.emit('join_reception');

    socket.on('shift_created', () => {
      loadRooms();
      loadMetrics();
      addNotification('✅ Nuevo turno iniciado', 'success');
    });

    socket.on('shift_extended', () => {
      loadRooms();
      addNotification('⏰ Tiempo extendido', 'success');
    });

    socket.on('room_needs_cleaning', () => {
      loadRooms();
      addNotification('🧹 Habitación necesita limpieza', 'warning');
    });

    socket.on('room_cleaned', () => {
      loadRooms();
      loadMetrics();
      addNotification('✨ Habitación limpia y disponible', 'success');
    });

    return () => {
      clearInterval(timer);
      socket.off('shift_created');
      socket.off('shift_extended');
      socket.off('room_needs_cleaning');
      socket.off('room_cleaned');
    };
  }, []);

  const loadRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const loadMetrics = async () => {
    try {
      const data = await getTodayMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  };

  const handleStartShift = async () => {
    try {
      await createShift(selectedRoom.id, duration);
      setSelectedRoom(null);
      addNotification('🎉 Turno iniciado correctamente', 'success');
    } catch (error) {
      alert('Error al iniciar turno');
    }
  };

  const handleExtendTime = async (room) => {
    const extraHours = prompt('¿Cuántas horas más?', '1');
    if (extraHours && !isNaN(extraHours)) {
      try {
        await extendShift(room.shift_id, parseInt(extraHours));
        addNotification(`⏰ Habitación ${room.room_number} extendida ${extraHours} hora(s)`, 'success');
      } catch (error) {
        alert('Error al extender tiempo');
      }
    }
  };

  const handleCheckout = async (room) => {
    const method = prompt('Método de pago:\n1. Efectivo\n2. Tarjeta\n3. Transferencia');
    let payment_method = '';

    if (method === '1') payment_method = 'cash';
    else if (method === '2') payment_method = 'card';
    else if (method === '3') payment_method = 'transfer';
    else return;

    try {
      await registerPayment(room.shift_id, payment_method);
      loadRooms();
      addNotification('💰 Pago registrado', 'success');
    } catch (error) {
      alert('Error al registrar pago');
    }
  };

  const handleClean = async (room) => {
    try {
      await markCleaned(room.id);
      loadRooms();
      addNotification('✨ Habitación limpia', 'success');
    } catch (error) {
      alert('Error al marcar limpieza');
    }
  };

  const addNotification = (message, type) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  // Formatear tiempo restante
  const formatTimeLeft = (endTime) => {
    if (!endTime) return null;
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };

    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return { hours, minutes, seconds, expired: false };
  };

  // Formatear como 01:42:15
  const formatTimer = (time) => {
    if (!time) return '--:--:--';
    return `${time.hours.toString().padStart(2, '0')}:${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  };

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;

  return (
    <div className="intimax-dashboard">

      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        currentTime={currentTime}
        logout={logout}
      />


      {/* CONTENIDO PRINCIPAL */}
      <main className="dashboard-main">
        {currentPage === 'rooms' ? (
          <>
            {/* STATS BAR */}
            <div className="stats-bar">
              <div className="stat-item">
                <span className="stat-label">HABITACIONES TOTALES</span>
                <span className="stat-value">{totalRooms}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">OCUPADAS</span>
                <span className="stat-value occupied">{occupiedRooms}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">DISPONIBLES</span>
                <span className="stat-value available">{availableRooms}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">INGRESOS HOY</span>
                <span className="stat-value">${metrics?.daily?.total_income?.toLocaleString() || 0}</span>
              </div>
            </div>

            {/* GRID DE HABITACIONES - Estilo imagen */}
            <div className="rooms-header">
              <h2>ROOMS</h2>
              <button onClick={loadRooms} className="refresh-btn">🔄 ACTUALIZAR</button>
            </div>

            <div className="rooms-grid">
              {rooms.map(room => {
                const timeLeft = formatTimeLeft(room.end_time);
                const isOccupied = room.status === 'occupied';
                const isCleaning = room.status === 'cleaning';

                return (
                  <div key={room.id} className={`room-card ${room.status}`}>
                    <div className="room-number">{room.room_number}</div>
                    <div className="room-type">{room.room_type?.toUpperCase()}</div>

                    {isOccupied && timeLeft && !timeLeft.expired && (
                      <>
                        <div className="room-timer">{formatTimer(timeLeft)}</div>
                        <div className="room-actions">
                          <button
                            className="btn-extend"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExtendTime(room);
                            }}
                          >
                            EXTENDIDO
                          </button>
                          <button
                            className="btn-free"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCheckout(room);
                            }}
                          >
                            LIBRE
                          </button>
                        </div>
                      </>
                    )}

                    {isOccupied && timeLeft?.expired && (
                      <div className="room-expired">
                        <span>⏰ TIEMPO EXPIRO</span>
                        <button
                          className="btn-clean"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCheckout(room);
                          }}
                        >
                          FINALIZAR
                        </button>
                      </div>
                    )}

                    {isCleaning && (
                      <div className="room-cleaning">
                        <span>🧹 LIMPIEZA</span>
                        <button
                          className="btn-clean"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleClean(room);
                          }}
                        >
                          MARCAR LISTA
                        </button>
                      </div>
                    )}

                    {room.status === 'available' && (
                      <div className="room-available">
                        <span>✅ DISPONIBLE</span>
                        <button
                          className="btn-start"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoom(room);
                          }}
                        >
                          INICIAR
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* PÁGINA DE CONTACTO / ABOUT */
          <div className="contact-page">
            <div className="contact-card">
              <h2>📞 CONTACT</h2>
              <div className="social-links">
                <a href="#" className="social-link">Facebook</a>
                <a href="#" className="social-link">Instagram</a>
                <a href="#" className="social-link">Twitter</a>
                <a href="#" className="social-link">LinkedIn</a>
              </div>
              <div className="about-section">
                <h3>ABOUT US</h3>
                <p>Somos un grupo de jóvenes programadores dedicado a ofrecerte las mejores soluciones web.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL PARA INICIAR TURNO */}
      {selectedRoom && (
        <div className="modal-overlay" onClick={() => setSelectedRoom(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>HABITACIÓN {selectedRoom.room_number}</h2>
            <p>Tipo: {selectedRoom.room_type}</p>
            <p>Precio base: ${selectedRoom.base_price?.toLocaleString()}</p>

            <div className="duration-selector">
              <label>DURACIÓN:</label>
              <div className="duration-buttons">
                <button
                  className={`duration-btn ${duration === 2 ? 'active' : ''}`}
                  onClick={() => setDuration(2)}
                >
                  2 HS
                </button>
                <button
                  className={`duration-btn ${duration === 4 ? 'active' : ''}`}
                  onClick={() => setDuration(4)}
                >
                  4 HS
                </button>
                <button
                  className={`duration-btn ${duration === 6 ? 'active' : ''}`}
                  onClick={() => setDuration(6)}
                >
                  6 HS
                </button>
              </div>
            </div>

            <div className="modal-actions">
              <button onClick={handleStartShift} className="btn-confirm">
                INICIAR TURNO
              </button>
              <button onClick={() => setSelectedRoom(null)} className="btn-cancel">
                CANCELAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICACIONES */}
      <div className="notifications-container">
        {notifications.map(n => (
          <div key={n.id} className={`notification ${n.type}`}>
            {n.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;