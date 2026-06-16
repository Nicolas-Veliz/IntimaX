import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRooms, createShift, registerPayment, markCleaned, extendShift, getTodayMetrics } from '../services/api';
import io from 'socket.io-client';
import './Dashboard.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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

            {/* ENCABEZADO CON SU CONTENEDOR DE ACCIONES GRUPALES */}
            <div className="rooms-header">
              <h2>ROOMS</h2>
              <div className="header-actions-group">
                <button
                  onClick={() => setCurrentPage('manage-rooms')}
                  className="manage-rooms-btn"
                >
                  ⚙️ ADMINISTRAR
                </button>
                <button onClick={loadRooms} className="refresh-btn">
                  🔄 ACTUALIZAR
                </button>
              </div>
            </div>

            {/* GRID DE HABITACIONES CON FILTRADO DE ICONOS CORPORATIVOS */}
            <div className="rooms-grid">
              {rooms.map((room, index) => {
                const timeLeft = formatTimeLeft(room.end_time);
                const isOccupied = room.status === 'occupied';
                const isCleaning = room.status === 'cleaning';

                return (
                  <div key={room.id} className={`room-card ${room.status}`}>
                    <div className="room-number">{index + 1}</div>
                    <div className="room-type">{room.room_type?.toUpperCase()}</div>

                    {/* 1. ESTADO: OCUPADO PERO CON TIEMPO CORRIENDO */}
                    {isOccupied && timeLeft && !timeLeft.expired && (
                      <>
                        <div className="room-timer">{formatTimer(timeLeft)}</div>
                        <div className="room-status-badge text-occupied">
                          <img src="/src/assets/OCUPADO.PNG" alt="Ocupado" className="status-icon" />
                          <span>OCUPADO</span>
                        </div>
                        <div className="room-actions">
                          <button className="btn-extend" onClick={(e) => { e.stopPropagation(); handleExtendTime(room); }}>EXTENDIDO</button>
                          <button className="btn-free" onClick={(e) => { e.stopPropagation(); handleCheckout(room); }}>LIBRE</button>
                        </div>
                      </>
                    )}

                    {/* 2. ESTADO: OCUPADO Y TIEMPO EXPIRADO */}
                    {isOccupied && timeLeft?.expired && (
                      <div className="room-expired">
                        <div className="room-status-badge text-expired">
                          <img src="/src/assets/OCUPADO.PNG" alt="Expiró" className="status-icon" />
                          <span>TIEMPO EXPIRO</span>
                        </div>
                        <button className="btn-clean" onClick={(e) => { e.stopPropagation(); handleCheckout(room); }}>FINALIZAR</button>
                      </div>
                    )}

                    {/* 3. ESTADO: EN LIMPIEZA */}
                    {isCleaning && (
                      <div className="room-cleaning">
                        <div className="room-status-badge text-cleaning">
                          <img src="/src/assets/LIMPIEZA.PNG" alt="Limpieza" className="status-icon" />
                          <span>LIMPIEZA</span>
                        </div>
                        <button className="btn-clean" onClick={(e) => { e.stopPropagation(); handleClean(room); }}>MARCAR LISTA</button>
                      </div>
                    )}

                    {/* 4. ESTADO: DISPONIBLE */}
                    {room.status === 'available' && (
                      <div className="room-available">
                        <div className="room-status-badge text-available">
                          <img src="/src/assets/LIBRE.PNG" alt="Disponible" className="status-icon" />
                          <span>DISPONIBLE</span>
                        </div>
                        <button className="btn-start" onClick={(e) => { e.stopPropagation(); setSelectedRoom(room); }}>INICIAR</button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : currentPage === 'manage-rooms' ? (
          /* PESTAÑA GESTIÓN DE HABITACIONES (ABM INTEGRADO) */
          <div className="manage-rooms-page">
            <div className="manage-rooms-container">
              <div className="manage-rooms-header">
                <h2>⚙️ PANEL DE GESTIÓN: HABITACIONES</h2>
                <button onClick={() => setCurrentPage('rooms')} className="refresh-btn">
                  ⬅️ VOLVER AL PANEL
                </button>
              </div>

              <div className="abm-layout">
                {/* COLUMNA IZQUIERDA: FORMULARIO DE ALTA / MODIFICACIÓN */}
                <div className="abm-form-section">
                  <h3>Añadir / Editar Habitación</h3>
                  <form onSubmit={(e) => e.preventDefault()} className="abm-form">
                    <div className="form-group">
                      <label>NÚMERO DE HABITACIÓN</label>
                      <input type="number" placeholder="Ej: 6" required />
                    </div>

                    <div className="form-group">
                      <label>TIPO DE HABITACIÓN</label>
                      <select required>
                        <option value="simple">SIMPLE</option>
                        <option value="doble">DOBLE</option>
                        <option value="suite">SUITE</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>PRECIO BASE ($)</label>
                      <input type="number" placeholder="Ej: 5000" required />
                    </div>

                    <div className="form-actions-abm">
                      <button type="submit" className="btn-confirm-abm">GUARDAR HABITACIÓN</button>
                      <button type="button" className="btn-clear-abm">LIMPIAR</button>
                    </div>
                  </form>
                </div>

                {/* COLUMNA DERECHA: LISTADO CON ACCIONES DE MODIFICACIÓN / ELIMINACIÓN */}
                <div className="abm-table-section">
                  <h3>Habitaciones Registradas ({rooms.length})</h3>
                  <div className="table-responsive-abm">
                    <table className="abm-table">
                      <thead>
                        <tr>
                          <th># ACCIÓN</th>
                          <th>HABITACIÓN</th>
                          <th>TIPO</th>
                          <th>PRECIO BASE</th>
                          <th>ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.map((room, index) => (
                          <tr key={room.id}>
                            <td className="table-index">{index + 1}</td>
                            <td className="table-room-num">Habitación {index + 1}</td>
                            <td className="table-room-type">
                              <span className={`badge-type ${room.room_type}`}>
                                {room.room_type?.toUpperCase()}
                              </span>
                            </td>
                            <td className="table-room-price">${room.base_price?.toLocaleString()}</td>
                            <td>
                              <div className="table-actions-btns">
                                <button className="btn-table-edit" title="Editar">✏️</button>
                                <button className="btn-table-delete" title="Eliminar">🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : currentPage === 'users' ? (
          /* PESTAÑA GESTIÓN DE USUARIOS / PERSONAL (ABM INTEGRADO) */
          <div className="manage-users-page">
            <div className="manage-users-container">
              
              <div className="manage-users-header">
                <h2>⚙️ MANAGEMENT PANEL: USERS / STAFF</h2>
                <button onClick={() => setCurrentPage('rooms')} className="refresh-btn">
                  ⬅️ RETURN TO PANEL
                </button>
              </div>

              <div className="abm-layout">
                {/* COLUMNA IZQUIERDA: FORMULARIO SEGÚN MOCKUP */}
                <div className="abm-form-section">
                  <h3>Register / Modify Staff</h3>
                  <form onSubmit={(e) => e.preventDefault()} className="abm-form">
                    <div className="form-group">
                      <label>NAME/S</label>
                      <input type="text" placeholder="Ej: JUAN" required />
                    </div>

                    <div className="form-group">
                      <label>LAST NAME</label>
                      <input type="text" placeholder="Ej: PÉREZ" required />
                    </div>

                    <div className="form-group">
                      <label>SHIFT</label>
                      <select required>
                        <option value="06:00 - 14:00">06:00 - 14:00 hs</option>
                        <option value="14:00 - 22:00">14:00 - 22:00 hs</option>
                        <option value="22:00 - 06:00">22:00 - 06:00 hs</option>
                        <option value="S/Hs">Sin Horario Fijo</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>DNI</label>
                      <input type="text" placeholder="Ej: XX.XX.XX" required />
                    </div>

                    <div className="form-group">
                      <label>ADDRESS</label>
                      <input type="text" placeholder="Ej: SAN JUAN 350" required />
                    </div>

                    <div className="form-group">
                      <label>PERMIT (ROLE)</label>
                      <select required>
                        <option value="recepcion">Usuario (Recepcionista)</option>
                        <option value="admin">Admin. (Administrador)</option>
                      </select>
                    </div>

                    <div className="form-actions-abm-vertical">
                      <button type="submit" className="btn-confirm-abm">CREATE</button>
                      <button type="button" className="btn-modify-abm">MODIFY</button>
                      <button type="button" className="btn-free">DELETE</button>
                    </div>
                  </form>
                </div>

                {/* COLUMNA DERECHA: TABLA DE USUARIOS REGISTRADOS */}
                <div className="abm-table-section">
                  <h3>List of Registered Users</h3>
                  <div className="table-responsive-abm">
                    <table className="abm-table users-custom-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Last Name</th>
                          <th>Shift</th>
                          <th>DNI</th>
                          <th>Permit (Role)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="table-row-selectable">
                          <td className="table-room-num">Santiago</td>
                          <td>Robles</td>
                          <td className="table-subtext">S/Hs</td>
                          <td className="table-index">XX.XX.XX</td>
                          <td><span className="badge-type suite">Admin.</span></td>
                        </tr>
                        <tr className="table-row-selectable">
                          <td className="table-room-num">Juan</td>
                          <td>Pérez</td>
                          <td className="table-subtext">06-14hs</td>
                          <td className="table-index">XX.XX.XX</td>
                          <td><span className="badge-type simple">Usuario</span></td>
                        </tr>
                        <tr className="table-row-selectable">
                          <td className="table-room-num">María</td>
                          <td>Luz</td>
                          <td className="table-subtext">14-22hs</td>
                          <td className="table-index">XX.XX.XX</td>
                          <td><span className="badge-type simple">Usuario</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="table-hint-text">💡 Click on a row in the table to load the data into the form so you can modify or delete it..</p>
                </div>
              </div>
            </div>
          </div>
        ) : currentPage === 'reports' ? (
          /* ==========================================================================
             PESTAÑA DE REPORTES Y AUDITORÍA (MOCKUP VISUAL INTEGRADO)
             ========================================================================== */
          <div className="reports-page-wrapper">
            <div className="reports-page-header">
              <h2>📊 MÓDULO DE AUDITORÍA Y REPORTES GENERALES</h2>
              <button onClick={() => setCurrentPage('rooms')} className="refresh-btn">
                ⬅️ VOLVER AL PANEL
              </button>
            </div>

            <div className="reports-top-grid">
              {/* COLUMNA 1: KPI CARDS */}
              <div className="reports-kpi-column">
                <div className="report-card-kpi">
                  <span className="kpi-title">Ingresos totales del día</span>
                  <div className="kpi-value-box">
                    <span className="kpi-main-value">$32.000</span>
                  </div>
                </div>
                <div className="report-card-kpi">
                  <span className="kpi-title">Método de pago más usado</span>
                  <div className="kpi-value-box">
                    <span className="kpi-main-value method-text">EFECTIVO</span>
                  </div>
                </div>
              </div>

              {/* COLUMNA 2: GRÁFICO HABITACIONES */}
              <div className="report-card-box chart-box-container">
                <h3 className="chart-title">Habitaciones más usadas</h3>
                <div className="chart-native-body">
                  <div className="chart-row">
                    <span className="chart-label">Hab. 04</span>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar-fill" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div className="chart-row">
                    <span className="chart-label">Hab. 08</span>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar-fill" style={{ width: '55%' }}></div>
                    </div>
                  </div>
                  <div className="chart-row">
                    <span className="chart-label">Hab. 01</span>
                    <div className="chart-bar-wrapper">
                      <div className="chart-bar-fill" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLUMNA 3: CONTROL DE SESIONES */}
              <div className="report-card-box sessions-box-container">
                <h3 className="chart-title">Control de Sesiones e Historial de Personal</h3>
                <div className="table-responsive-abm compact-reports-table">
                  <table className="abm-table layout-table-reports">
                    <thead>
                      <tr>
                        <th>Empleado</th>
                        <th>Rol</th>
                        <th>Login</th>
                        <th>Logout</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="table-room-num">Juan Pérez</td>
                        <td>Recep</td>
                        <td>06:00</td>
                        <td>14:00</td>
                        <td>
                          <div className="status-badge-report">
                            <span>Finaliz.</span>
                            <span className="dot-indicator red-dot"></span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td className="table-room-num">María Luz</td>
                        <td>Recep</td>
                        <td>14:00</td>
                        <td>-</td>
                        <td>
                          <div className="status-badge-report">
                            <span>Activo</span>
                            <span className="dot-indicator green-dot"></span>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* SECCIÓN INFERIOR: HISTORIAL DE CAJA */}
            <div className="report-card-box ledger-box-container">
              <h3 className="chart-title">Detalle de Ingresos e Historial de Caja</h3>
              <div className="table-responsive-abm">
                <table className="abm-table layout-table-reports full-ledger-table">
                  <thead>
                    <tr>
                      <th>Hora</th>
                      <th>Habitación</th>
                      <th>Turno/Tiempo</th>
                      <th>Recepcionista</th>
                      <th>Medio de Pago</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>09:15</td>
                      <td className="table-room-num">Hab. 04</td>
                      <td><span className="badge-time-report">2 Horas</span></td>
                      <td>Juan Pérez</td>
                      <td><span className="badge-pay-report">Efectivo</span></td>
                      <td className="table-room-price">$5.500</td>
                    </tr>
                    <tr>
                      <td>10:30</td>
                      <td className="table-room-num">Hab. 08</td>
                      <td><span className="badge-time-report">4 Horas</span></td>
                      <td>Juan Pérez</td>
                      <td><span className="badge-pay-report">Tarjeta Deb.</span></td>
                      <td className="table-room-price">$8.000</td>
                    </tr>
                    <tr>
                      <td>11:02</td>
                      <td className="table-room-num">Hab. 01</td>
                      <td><span className="badge-time-report action-extended">EXTENDIDO</span></td>
                      <td>Juan Pérez</td>
                      <td><span className="badge-pay-report">Transf.</span></td>
                      <td className="table-room-price">$15.000</td>
                    </tr>
                    <tr>
                      <td>13:45</td>
                      <td className="table-room-num">Hab. 05</td>
                      <td><span className="badge-time-report action-free">LIBRE(1H)</span></td>
                      <td>María Luz</td>
                      <td><span className="badge-pay-report">Efectivo</span></td>
                      <td className="table-room-price">$3.500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* SECCIÓN DE CONTACTO VIEJA CORREGIDA PARA QUE NO AFECTE AL PIE DE PÁGINA */
          <div style={{ padding: '60px 30px', textAlign: 'center', fontFamily: 'Montserrat' }}>
            <p style={{ color: '#9CA3AF', fontSize: '15px', fontWeight: '500', letterSpacing: '0.5px' }}>
              Podés visualizar los canales de atención y medios de soporte técnico directamente en el pie de página de Intimax System.
            </p>
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