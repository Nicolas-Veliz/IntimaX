import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getRooms, createRoom, updateRoom, deleteRoom, createShift, registerPayment, markCleaned, extendShift, getTodayMetrics, getDailyMetricsReport, getUsers, createUser, updateUser, deleteUser } from '../services/api';
import io from 'socket.io-client';
import './Dashboard.css';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AmenityManager from '../components/AmenityManager';

const socket = io('http://localhost:3000');

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [duration, setDuration] = useState(2);
  const [notifications, setNotifications] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentPage, setCurrentPage] = useState('rooms');
  const [cleaningCountdowns, setCleaningCountdowns] = useState({});
  const [amenitiesRoom, setAmenitiesRoom] = useState(null);
  const cleaningTimers = useRef({});
  const { user, logout } = useAuth();
  const [showAmenities, setShowAmenities] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [dailyReports, setDailyReports] = useState([]);
  const [dailyReportsLoading, setDailyReportsLoading] = useState(false);
  const [dailyReportsError, setDailyReportsError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    room_number: '',
    room_type: 'especial',
    base_price: '',
    extended_price: '',
    price_per_extra_hour: '',
    status: 'available',
    cleaning_time_minutes: 20
  });
  const [roomForCheckout, setRoomForCheckout] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [roomForInitialPayment, setRoomForInitialPayment] = useState(null);
  const [durationForPayment, setDurationForPayment] = useState(2);
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    dni: '',
    phone: '',
    address: '',
    shift: 'mañana',
    role: 'receptionist'
  });

  useEffect(() => {
    if (currentPage === 'users') {
      loadUsers();
    }
    if (currentPage === 'reports') {
      loadDailyReports();
    }
  }, [currentPage]);

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
      Object.values(cleaningTimers.current).forEach(clearInterval);
      socket.off('shift_created');
      socket.off('shift_extended');
      socket.off('room_needs_cleaning');
      socket.off('room_cleaned');
    };
  }, []);

  const resetUserForm = () => {
    setEditingUser(null);
    setUserForm({
      username: '',
      password: '',
      first_name: '',
      last_name: '',
      dni: '',
      phone: '',
      address: '',
      shift: 'mañana',
      role: 'receptionist'
    });
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError('');
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsersError('No se pudieron cargar los usuarios desde la base de datos.');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id, { ...userForm, is_active: 1 });
      } else {
        if (!userForm.password) {
          alert('La contraseña es obligatoria para crear un usuario.');
          return;
        }
        await createUser(userForm);
      }

      await loadUsers();
      resetUserForm();
    } catch (error) {
      alert('Error al guardar usuario: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      username: user.username,
      password: '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      dni: user.dni || '',
      phone: user.phone || '',
      address: user.address || '',
      shift: user.shift || 'mañana',
      role: user.role || 'user'
    });
  };

  const handleDeleteUser = async (user) => {
    if (window.confirm(`¿Eliminar a ${user.first_name} ${user.last_name}?`)) {
      try {
        await deleteUser(user.id);
        if (editingUser?.id === user.id) {
          resetUserForm();
        }
        await loadUsers();
      } catch (error) {
        alert('Error al eliminar usuario: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const loadDailyReports = async () => {
    try {
      setDailyReportsLoading(true);
      setDailyReportsError('');
      const data = await getDailyMetricsReport();
      setDailyReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading daily metrics:', error);
      setDailyReportsError('No se pudieron cargar los reportes desde la base de datos.');
    } finally {
      setDailyReportsLoading(false);
    }
  };

  const loadRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (error) {
      console.error('Error loading rooms:', error);
    }
  };

  const resetRoomForm = () => {
    setEditingRoom(null);
    setRoomForm({
      room_number: '',
      room_type: 'especial',
      base_price: '',
      extended_price: '',
      price_per_extra_hour: '',
      status: 'available',
      cleaning_time_minutes: 20
    });
  };

  const handleRoomInputChange = (e) => {
    const { name, value } = e.target;
    setRoomForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleRoomSubmit = async (e) => {
    e.preventDefault();
    try {
      const roomData = {
        ...roomForm,
        room_number: Number(roomForm.room_number),
        base_price: Number(roomForm.base_price),
        extended_price: Number(roomForm.extended_price),
        price_per_extra_hour: Number(roomForm.price_per_extra_hour || 0),
        cleaning_time_minutes: Number(roomForm.cleaning_time_minutes || 20)
      };

      if (editingRoom) {
        await updateRoom(editingRoom.id, roomData);
      } else {
        await createRoom(roomData);
      }

      await loadRooms();
      resetRoomForm();
    } catch (error) {
      alert('Error al guardar habitación: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEditRoom = (room) => {
    setEditingRoom(room);
    setRoomForm({
      room_number: room.room_number || '',
      room_type: room.room_type || 'especial',
      base_price: room.base_price || '',
      extended_price: room.extended_price || '',
      price_per_extra_hour: room.price_per_extra_hour || '',
      status: room.status || 'available',
      cleaning_time_minutes: room.cleaning_time_minutes || 20
    });
  };

  const handleDeleteRoom = async (room) => {
    if (!window.confirm(`¿Eliminar la habitación ${room.room_number}?`)) return;

    try {
      await deleteRoom(room.id);
      if (editingRoom?.id === room.id) {
        resetRoomForm();
      }
      await loadRooms();
    } catch (error) {
      alert('Error al eliminar habitación: ' + (error.response?.data?.message || error.message));
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
    // Mostrar modal de pago ANTES de iniciar el turno
    setRoomForInitialPayment(selectedRoom);
    setDurationForPayment(duration);
    setShowPaymentModal(true);
  };

  const getExtendedDuration = () => {
    const extendedEnd = new Date(currentTime);
    if (currentTime.getHours() >= 22) {
      extendedEnd.setDate(extendedEnd.getDate() + 1);
    }
    extendedEnd.setHours(8, 0, 0, 0);
    return (extendedEnd - currentTime) / 3600000;
  };

  const handleExtendTime = async (room) => {
    const extraHours = prompt('¿Cuántas horas extra desea agregar?', '1');
    if (extraHours === null) return;

    const parsedExtraHours = Number(extraHours);
    if (!Number.isFinite(parsedExtraHours) || parsedExtraHours <= 0) {
      alert('Ingrese una cantidad de horas válida.');
      return;
    }

    try {
      await extendShift(room.shift_id, parsedExtraHours);
      addNotification(`⏰ Habitación ${room.room_number} extendida ${parsedExtraHours} hora(s)`, 'success');
      await loadRooms();
    } catch (error) {
      alert('Error al extender tiempo: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleCheckout = async (room) => {
    const confirmed = window.confirm(
      `¿Está seguro que desea detener el tiempo de la habitación ${room.room_number}?`
    );

    if (!confirmed) {
      return;
    }

    // Detener turno sin pedir pago (ya se pagó al iniciar)
    try {
      // Marcar como completado sin cambiar el método de pago (ya está registrado)
      await registerPayment(room.shift_id, room.payment_method || 'cash');
      loadRooms();
      addNotification('✋ Turno detenido', 'success');
    } catch (error) {
      alert('Error al detener turno');
    }
  };

  const handleConfirmPayment = async (paymentMethod) => {
    // Si es pago inicial (crear turno)
    if (roomForInitialPayment) {
      try {
        await createShift(roomForInitialPayment.id, durationForPayment);
        setSelectedRoom(null);
        setShowPaymentModal(false);
        setRoomForInitialPayment(null);
        addNotification('🎉 Turno iniciado correctamente', 'success');
      } catch (error) {
        alert('Error al iniciar turno');
      }
    }
    // Si es pago final (al terminar turno)
    else if (roomForCheckout) {
      try {
        await registerPayment(roomForCheckout.shift_id, paymentMethod);
        loadRooms();
        addNotification('💰 Pago registrado', 'success');
        setShowPaymentModal(false);
        setRoomForCheckout(null);
      } catch (error) {
        alert('Error al registrar pago');
      }
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

  const handleExpiredShift = (room) => {
    const confirmCleaning = window.confirm(
      `Turno habitación ${room.room_number} terminó. ¿Desea pasar a limpieza?`
    );

    if (!confirmCleaning) return;

    setRooms((prevRooms) =>
      prevRooms.map((r) =>
        r.id === room.id ? { ...r, status: 'cleaning' } : r
      )
    );

    if (!cleaningTimers.current[room.id]) {
      startCleaningCountdown(room);
    }
  };

  const openAmenities = (room) => {
    setAmenitiesRoom(room);
    setShowAmenities(true);
  };

  const closeAmenities = () => {
    setAmenitiesRoom(null);
    setShowAmenities(false);
  };

  const handleAmenityConsumed = ({ roomId, total }) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) =>
        room.id === roomId ? { ...room, shift_price: total } : room
      )
    );
    setAmenitiesRoom((prev) => prev ? { ...prev, shift_price: total } : prev);
    loadRooms();
  };

  const startCleaningCountdown = (room) => {
    setCleaningCountdowns((prev) => ({ ...prev, [room.id]: 30 }));

    const intervalId = setInterval(() => {
      setCleaningCountdowns((prev) => {
        const remaining = prev[room.id];
        if (!remaining || remaining <= 1) {
          clearInterval(intervalId);
          delete cleaningTimers.current[room.id];
          const next = { ...prev };
          delete next[room.id];
          finishCleaning(room);
          return next;
        }

        return { ...prev, [room.id]: remaining - 1 };
      });
    }, 1000);

    cleaningTimers.current[room.id] = intervalId;
  };

  const finishCleaning = async (room) => {
    const confirmDone = window.confirm(
      `Habitación ${room.room_number} limpia. ¿Poner en disponible?`
    );

    if (!confirmDone) {
      addNotification(`Habitación ${room.room_number} sigue en limpieza`, 'warning');
      return;
    }

    try {
      await markCleaned(room.id);
      loadRooms();
      addNotification(`✨ Habitación ${room.room_number} disponible`, 'success');
    } catch (error) {
      console.error(error);
      addNotification('Error al poner la habitación disponible', 'error');
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
  const latestReport = dailyReports[0] || {};
  const totalReports = dailyReports.length;
  const cumulativeIncome = dailyReports.reduce((sum, report) => sum + Number(report.total_income || 0), 0);

  const formatCurrency = (value) => {
    const number = Number(value || 0);
    return `$${number.toLocaleString('es-AR')}`;
  };

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
                          <button
                            className="btn-extra-hours"
                            type="button"
                            onClick={(e) => { e.stopPropagation(); handleExtendTime(room); }}
                          >
                            Hs extra
                          </button>
                          <button className="btn-free" onClick={(e) => { e.stopPropagation(); handleCheckout(room); }}>DETENER</button>
                          <button className="btn-amenities" onClick={(e) => { e.stopPropagation(); openAmenities(room); }}>MENU</button>
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
                        <div className="room-actions">
                          <button className="btn-clean" onClick={(e) => { e.stopPropagation(); handleExpiredShift(room); }}>FINALIZAR</button>
                          <button className="btn-amenities" onClick={(e) => { e.stopPropagation(); openAmenities(room); }}>MENU</button>
                        </div>
                      </div>
                    )}

                    {/* 3. ESTADO: EN LIMPIEZA */}
                    {isCleaning && (
                      <div className="room-cleaning">
                        <div className="room-status-badge text-cleaning">
                          <img src="/src/assets/LIMPIEZA.PNG" alt="Limpieza" className="status-icon" />
                          <span>LIMPIEZA</span>
                        </div>
                        <div className="room-actions">
                          <button
                            className="btn-clean"
                            onClick={(e) => { e.stopPropagation(); handleClean(room); }}
                            disabled={!!cleaningCountdowns[room.id]}
                          >
                            {cleaningCountdowns[room.id]
                              ? `LIMPIANDO ${cleaningCountdowns[room.id]}s`
                              : 'MARCAR LISTA'}
                          </button>
                          <button className="btn-amenities" onClick={(e) => { e.stopPropagation(); openAmenities(room); }}>MENU</button>
                        </div>
                      </div>
                    )}

                    {/* 4. ESTADO: DISPONIBLE */}
                    {room.status === 'available' && (
                      <div className="room-available">
                        <div className="room-status-badge text-available">
                          <img src="/src/assets/LIBRE.PNG" alt="Disponible" className="status-icon" />
                          <span>DISPONIBLE</span>
                        </div>
                        <div className="room-actions">
                          <button className="btn-start" onClick={(e) => { e.stopPropagation(); setSelectedRoom(room); }}>INICIAR</button>
                          <button className="btn-amenities" onClick={(e) => { e.stopPropagation(); openAmenities(room); }}>MENU</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {showAmenities && amenitiesRoom && (
              <div className="modal-overlay" onClick={closeAmenities}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <AmenityManager
                    key={`${amenitiesRoom?.id ?? 'room'}-${amenitiesRoom?.shift_id ?? 'no-shift'}`}
                    onClose={closeAmenities}
                    room={amenitiesRoom}
                    onConsumed={handleAmenityConsumed}
                  />
                </div>
              </div>
            )}
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
                  <form onSubmit={handleRoomSubmit} className="abm-form">
                    <div className="form-group">
                      <label>NÚMERO DE HABITACIÓN</label>
                      <input
                        type="number"
                        name="room_number"
                        value={roomForm.room_number}
                        onChange={handleRoomInputChange}
                        placeholder="Ej: 6"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>TIPO DE HABITACIÓN</label>
                      <select name="room_type" value={roomForm.room_type} onChange={handleRoomInputChange} required>
                        <option value="especial">ESPECIAL</option>
                        <option value="especial con hidro">ESPECIAL CON HIDRO</option>
                        <option value="premium">PREMIUM</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>PRECIO BASE ($)</label>
                      <input
                        type="number"
                        name="base_price"
                        value={roomForm.base_price}
                        onChange={handleRoomInputChange}
                        placeholder="Ej: 5000"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>PRECIO EXTENDIDO ($)</label>
                      <input
                        type="number"
                        name="extended_price"
                        value={roomForm.extended_price}
                        onChange={handleRoomInputChange}
                        placeholder="Ej: 54000"
                        min="0"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>PRECIO POR HORA EXTRA ($)</label>
                      <input
                        type="number"
                        name="price_per_extra_hour"
                        value={roomForm.price_per_extra_hour}
                        onChange={handleRoomInputChange}
                        placeholder="Ej: 2500"
                        min="0"
                        required
                        disabled={user?.role !== 'admin'}
                      />
                      {user?.role !== 'admin' && (
                        <small>Solo el administrador puede modificar este precio.</small>
                      )}
                    </div>

                    <div className="form-actions-abm">
                      <button type="submit" className="btn-confirm-abm">
                        {editingRoom ? 'ACTUALIZAR HABITACIÓN' : 'GUARDAR HABITACIÓN'}
                      </button>
                      <button type="button" onClick={resetRoomForm} className="btn-clear-abm">LIMPIAR</button>
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
                          <th>PRECIO/H EXTRA</th>
                          <th>ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rooms.map((room, index) => (
                          <tr key={room.id}>
                            <td className="table-index">{index + 1}</td>
                            <td className="table-room-num">Habitación {room.room_number}</td>
                            <td className="table-room-type">
                              <span className={`badge-type ${room.room_type?.replaceAll(' ', '-')}`}>
                                {room.room_type?.toUpperCase()}
                              </span>
                            </td>
                            <td className="table-room-price">${room.base_price?.toLocaleString()}</td>
                            <td className="table-room-price">${Number(room.price_per_extra_hour || 0).toLocaleString()}</td>
                            <td>
                              <div className="table-actions-btns">
                                <button
                                  type="button"
                                  className="btn-table-edit"
                                  title="Editar"
                                  onClick={() => handleEditRoom(room)}
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  className="btn-table-delete"
                                  title="Eliminar"
                                  onClick={() => handleDeleteRoom(room)}
                                >
                                  🗑️
                                </button>
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
          <div className="manage-users-page">
            <div className="manage-users-container">
              <div className="manage-users-header">
                <h2>⚙️ MANAGEMENT PANEL: USERS / STAFF</h2>
                <button onClick={() => setCurrentPage('rooms')} className="refresh-btn">
                  ⬅️ RETURN TO PANEL
                </button>
              </div>

              <div className="abm-layout">
                <div className="abm-form-section">
                  <h3>{editingUser ? 'Editar Staff' : 'Register / Modify Staff'}</h3>
                  <form onSubmit={handleUserSubmit} className="abm-form">
                    <div className="form-group">
                      <label>USER</label>
                      <input
                        type="text"
                        name="username"
                        value={userForm.username}
                        onChange={handleUserInputChange}
                        placeholder="Ej: juanperez"
                        required
                        disabled={Boolean(editingUser)}
                      />
                    </div>

                    {!editingUser && (
                      <div className="form-group">
                        <label>PASSWORD</label>
                        <input
                          type="password"
                          name="password"
                          value={userForm.password}
                          onChange={handleUserInputChange}
                          placeholder="Ingrese una contraseña"
                          required
                        />
                      </div>
                    )}

                    <div className="form-group">
                      <label>NAME/S</label>
                      <input type="text" name="first_name" value={userForm.first_name} onChange={handleUserInputChange} placeholder="Ej: JUAN" required />
                    </div>

                    <div className="form-group">
                      <label>LAST NAME</label>
                      <input type="text" name="last_name" value={userForm.last_name} onChange={handleUserInputChange} placeholder="Ej: PÉREZ" required />
                    </div>

                    <div className="form-group">
                      <label>SHIFT</label>
                      <select name="shift" value={userForm.shift} onChange={handleUserInputChange} required>
                        <option value="mañana">Mañana (06:00 - 14:00)</option>
                        <option value="tarde">Tarde (14:00 - 22:00)</option>
                        <option value="noche">Noche (22:00 - 06:00)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>DNI</label>
                      <input type="text" name="dni" value={userForm.dni} onChange={handleUserInputChange} placeholder="Ej: XX.XX.XX" required />
                    </div>

                    <div className="form-group">
                      <label>PHONE</label>
                      <input type="text" name="phone" value={userForm.phone} onChange={handleUserInputChange} placeholder="Ej: 1122334455" required />
                    </div>

                    <div className="form-group">
                      <label>ADDRESS</label>
                      <input type="text" name="address" value={userForm.address} onChange={handleUserInputChange} placeholder="Ej: SAN JUAN 350" required />
                    </div>

                    <div className="form-group">
                      <label>ROLE</label>
                      <select name="role" value={userForm.role} onChange={handleUserInputChange} required>
                        <option value="receptionist">Receptionist</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="form-actions-abm-vertical">
                      <button type="submit" className="btn-confirm-abm">{editingUser ? 'SAVE' : 'CREATE'}</button>
                      <button type="button" onClick={resetUserForm} className="btn-modify-abm">{editingUser ? 'CANCEL' : 'CLEAR'}</button>
                      {editingUser && (
                        <button type="button" onClick={() => handleDeleteUser(editingUser)} className="btn-free">DELETE</button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="abm-table-section">
                  <h3>List of Registered Users</h3>
                  {usersLoading ? (
                    <p className="table-hint-text">Cargando usuarios...</p>
                  ) : usersError ? (
                    <p className="table-hint-text">{usersError}</p>
                  ) : (
                    <div className="table-responsive-abm">
                      <table className="abm-table users-custom-table">
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Last Name</th>
                            <th>Shift</th>
                            <th>DNI</th>
                            <th>Role</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.length === 0 ? (
                            <tr>
                              <td colSpan="5" className="table-hint-text">No hay usuarios registrados.</td>
                            </tr>
                          ) : (
                            users.map((user) => (
                              <tr key={user.id} className="table-row-selectable" onClick={() => handleEditUser(user)}>
                                <td className="table-room-num">{user.first_name || '—'}</td>
                                <td>{user.last_name || '—'}</td>
                                <td className="table-subtext">{user.shift || '—'}</td>
                                <td className="table-index">{user.dni || '—'}</td>
                                <td>
                                  <span className={`badge-type ${user.role === 'admin' ? 'suite' : 'simple'}`}>
                                    {user.role === 'admin' ? 'Admin' : 'User'}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <p className="table-hint-text">💡 Click on a row in the table to load the data into the form so you can modify or delete it.</p>
                </div>
              </div>
            </div>
          </div>
        ) : currentPage === 'reports' ? (
          <div className="reports-page-wrapper">
            <div className="reports-page-header">
              <h2>📊 MÓDULO DE AUDITORÍA Y REPORTES GENERALES</h2>
              <button onClick={() => setCurrentPage('rooms')} className="refresh-btn">
                ⬅️ VOLVER AL PANEL
              </button>
            </div>

            <div className="reports-top-grid">
              <div className="reports-kpi-column">
                <div className="report-card-kpi">
                  <span className="kpi-title">Registros en daily_metrics</span>
                  <div className="kpi-value-box">
                    <span className="kpi-main-value">{totalReports}</span>
                  </div>
                </div>
                <div className="report-card-kpi">
                  <span className="kpi-title">Ingresos acumulados</span>
                  <div className="kpi-value-box">
                    <span className="kpi-main-value method-text">{formatCurrency(cumulativeIncome)}</span>
                  </div>
                </div>
              </div>

              <div className="report-card-box chart-box-container">
                <h3 className="chart-title">Último registro diario</h3>
                {dailyReportsLoading ? (
                  <p className="table-hint-text">Cargando reportes...</p>
                ) : dailyReportsError ? (
                  <p className="table-hint-text">{dailyReportsError}</p>
                ) : (
                  <div className="chart-native-body">
                    <div className="chart-row">
                      <span className="chart-label">Fecha</span>
                      <span className="table-room-num">{latestReport.date || '—'}</span>
                    </div>
                    <div className="chart-row">
                      <span className="chart-label">Turnos</span>
                      <span className="table-room-num">{latestReport.total_shifts || 0}</span>
                    </div>
                    <div className="chart-row">
                      <span className="chart-label">Ingreso</span>
                      <span className="table-room-price">{formatCurrency(latestReport.total_income)}</span>
                    </div>
                    <div className="chart-row">
                      <span className="chart-label">No-shows</span>
                      <span className="table-room-num">{latestReport.no_shows || 0}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="report-card-box sessions-box-container">
                <h3 className="chart-title">Detalle de métricas diarias</h3>
                {dailyReportsLoading ? (
                  <p className="table-hint-text">Cargando reportes...</p>
                ) : dailyReportsError ? (
                  <p className="table-hint-text">{dailyReportsError}</p>
                ) : (
                  <div className="table-responsive-abm compact-reports-table">
                    <table className="abm-table layout-table-reports">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Turnos</th>
                          <th>Ingreso</th>
                          <th>Efectivo</th>
                          <th>Tarjeta</th>
                          <th>Transferencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dailyReports.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="table-hint-text">No hay registros en daily_metrics.</td>
                          </tr>
                        ) : (
                          dailyReports.map((report) => (
                            <tr key={report.date}>
                              <td className="table-room-num">{report.date || '—'}</td>
                              <td>{report.total_shifts || 0}</td>
                              <td className="table-room-price">{formatCurrency(report.total_income)}</td>
                              <td>{formatCurrency(report.cash_income)}</td>
                              <td>{formatCurrency(report.card_income)}</td>
                              <td>{formatCurrency(report.transfer_income)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
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
            <p>Precio extendido: ${Number(selectedRoom.extended_price || 0).toLocaleString()}</p>

            <div className="duration-selector">
              <label>DURACIÓN:</label>
              <div className="duration-buttons">
                <button
                  className={`duration-btn ${duration === 2 ? 'active' : ''}`}
                  type="button"
                  onClick={() => setDuration(2)}
                >
                  2 HS
                </button>
                <button
                  className={`duration-btn ${duration !== 2 ? 'active' : ''}`}
                  type="button"
                  disabled={currentTime.getHours() >= 8 && currentTime.getHours() < 22}
                  onClick={() => setDuration(getExtendedDuration())}
                >
                  EXTENDIDO - ${Number(selectedRoom.extended_price || 0).toLocaleString()}
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

      {/* MODAL PARA SELECCIONAR MÉTODO DE PAGO */}
      {showPaymentModal && (roomForCheckout || roomForInitialPayment) && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>MÉTODO DE PAGO</h2>
            <p>Habitación {roomForCheckout?.room_number || roomForInitialPayment?.room_number}</p>
            {roomForInitialPayment && <p style={{ fontSize: '12px', color: '#9CA3AF' }}>Duración: {durationForPayment} horas</p>}

            <div className="payment-options">
              <button
                className="payment-btn cash"
                onClick={() => handleConfirmPayment('cash')}
              >
                💵 EFECTIVO
              </button>
              <button
                className="payment-btn card"
                onClick={() => handleConfirmPayment('card')}
              >
                💳 TARJETA
              </button>
              <button
                className="payment-btn transfer"
                onClick={() => handleConfirmPayment('transfer')}
              >
                🏦 TRANSFERENCIA
              </button>
            </div>

            <div className="modal-actions">
              <button 
                onClick={() => { 
                  setShowPaymentModal(false); 
                  setRoomForCheckout(null);
                  setRoomForInitialPayment(null);
                }} 
                className="btn-cancel"
              >
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