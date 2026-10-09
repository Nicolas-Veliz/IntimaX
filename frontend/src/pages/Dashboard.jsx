import React, { useState, useEffect, useRef } from 'react';

import { useAuth } from '../contexts/AuthContext';

import { getRooms, createRoom, updateRoom, deleteRoom, createShift, registerPayment, markCleaned, extendShift, getTodayMetrics, getDailyMetricsReport, getUsers, createUser, updateUser, deleteUser } from '../services/api';

import io from 'socket.io-client';

import './Dashboard.css';

import Navbar from '../components/Navbar';

import Footer from '../components/Footer';

import AmenityManager from '../components/AmenityManager';

import { confirmAction, requestNumber, showAlert, showToast } from '../services/alerts';

import { useLanguage } from '../contexts/LanguageContext';

const socket = io('http\://localhost:3000');

function Dashboard() {

  const { translations: t, language } = useLanguage();

  const [rooms, setRooms] = useState([]);

  const [selectedRoom, setSelectedRoom] = useState(null);

  const [duration, setDuration] = useState(2);

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

  // Textos específicos del Dashboard que dependen del idioma actual.

  const tx = (esText, enText) => language === 'en' ? enText : esText;

  const locale = language === 'en' ? 'en-US' : 'es-AR';

  const getRoomTypeLabel = (roomType) => {

    const roomTypes = {

      especial: tx('ESPECIAL', 'SPECIAL'),

      'especial con hidro': tx('ESPECIAL CON HIDRO', 'SPECIAL WITH HYDRO'),

      premium: 'PREMIUM'

    };

    return roomTypes[roomType] || String(roomType || '').toUpperCase();

  };

  const getShiftLabel = (shift) => {

    const shifts = {

      mañana: t.users.morning,

      tarde: t.users.afternoon,

      noche: t.users.night

    };

    return shifts[shift] || shift || '—';

  };

  const getRoleLabel = (role) => {

    const roles = {

      admin: t.users.admin,

      supervisor: t.users.supervisor,

      receptionist: t.users.receptionist,

      user: t.users.userRole

    };

    return roles[role] || role || '—';

  };

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

      addNotification(tx('✅ Nuevo turno iniciado', '✅ New shift started'), 'success');

    });

    socket.on('shift_extended', () => {

      loadRooms();

      addNotification(tx('⏰ Tiempo extendido', '⏰ Time extended'), 'success');

    });

    socket.on('room_needs_cleaning', () => {

      loadRooms();

      addNotification(tx('🧹 Habitación necesita limpieza', '🧹 Room needs cleaning'), 'warning');

    });

    socket.on('room_cleaned', () => {

      loadRooms();

      loadMetrics();

      addNotification(tx('✨ Habitación limpia y disponible', '✨ Room clean and available'), 'success');

    });

    return () => {

      clearInterval(timer);

      Object.values(cleaningTimers.current).forEach(clearInterval);

      socket.off('shift_created');

      socket.off('shift_extended');

      socket.off('room_needs_cleaning');

      socket.off('room_cleaned');

    };

  }, [language]);

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

      setUsersError(t.users.loadError);

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
    const wasEditing = Boolean(editingUser);

    try {

      if (editingUser) {

        await updateUser(editingUser.id, { ...userForm, is_active: 1 });

      } else {

        if (!userForm.password) {

          showAlert(t.users.requiredPassword, 'warning');

          return;

        }

        await createUser(userForm);

      }

      await loadUsers();
      resetUserForm();

      showToast(
        wasEditing
          ? tx('Usuario actualizado correctamente', 'User updated successfully')
          : tx('Usuario creado correctamente', 'User created successfully')
      );

    } catch (error) {

      showAlert(`${t.users.saveError}: ${error.response?.data?.message || error.message}`, 'error');

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

    if (await confirmAction(`${tx('¿Eliminar a', 'Delete')} ${user.first_name} ${user.last_name}?`, {

      title: t.users.deleteUser,

      confirmButtonText: t.users.yesDelete

    })) {

      try {

        await deleteUser(user.id);

        if (editingUser?.id === user.id) {

          resetUserForm();

        }

        await loadUsers();

        showToast(
          tx('Usuario eliminado correctamente', 'User deleted successfully')
        );

      } catch (error) {

        showAlert(`${t.users.deleteError}: ${error.response?.data?.message || error.message}`, 'error');

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

      setDailyReportsError(tx('No se pudieron cargar los reportes desde la base de datos.', 'Reports could not be loaded from the database.'));

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
    const wasEditing = Boolean(editingRoom);

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

      showToast(
        wasEditing
          ? tx('Habitación actualizada correctamente', 'Room updated successfully')
          : tx('Habitación creada correctamente', 'Room created successfully')
      );

    } catch (error) {

      showAlert(`${tx('Error al guardar habitación', 'Error saving room')}: ${error.response?.data?.message || error.message}`, 'error');

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

    if (!await confirmAction(`${tx('¿Eliminar la habitación', 'Delete room')} ${room.room_number}?`, {

      title: tx('Eliminar habitación', 'Delete room'),

      confirmButtonText: t.users.yesDelete

    })) return;

    try {

      await deleteRoom(room.id);

      if (editingRoom?.id === room.id) {

        resetRoomForm();

      }

      await loadRooms();

      showToast(
        `${tx('Habitación', 'Room')} ${room.room_number} ${tx(
          'eliminada correctamente',
          'deleted successfully'
        )}`
      );

    } catch (error) {

      showAlert(`${tx('Error al eliminar habitación', 'Error deleting room')}: ${error.response?.data?.message || error.message}`, 'error');

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

    const extraHours = await requestNumber({

      title: `${tx('Extender habitación', 'Extend room')} ${room.room_number}`,

      text: tx('¿Cuántas horas extra desea agregar?', 'How many extra hours would you like to add?'),

      value: 1

    });

    if (extraHours === null) return;

    try {

      await extendShift(room.shift_id, extraHours);

      addNotification(`⏰ ${tx('Habitación', 'Room')} ${room.room_number} ${tx('extendida', 'extended by')} ${extraHours} ${tx('hora(s)', 'hour(s)')}`, 'success');

      await loadRooms();

    } catch (error) {

      showAlert(`${tx('Error al extender tiempo', 'Error extending time')}: ${error.response?.data?.message || error.message}`, 'error');

    }

  };

  const handleCheckout = async (room) => {

    const confirmed = await confirmAction(

      `${tx('¿Está seguro que desea detener el tiempo de la habitación', 'Are you sure you want to stop the timer for room')} ${room.room_number}?`,

      { title: tx('Detener turno', 'Stop shift'), confirmButtonText: tx('Sí, detener', 'Yes, stop') }

    );

    if (!confirmed) {

      return;

    }

    // Detener turno sin pedir pago (ya se pagó al iniciar)

    try {

      // Marcar como completado sin cambiar el método de pago (ya está registrado)

      await registerPayment(room.shift_id, room.payment_method || 'cash');

      loadRooms();

      addNotification(tx('✋ Turno detenido', '✋ Shift stopped'), 'success');

    } catch (error) {

      showAlert(tx('Error al detener turno', 'Error stopping shift'), 'error');

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

        addNotification(tx('🎉 Turno iniciado correctamente', '🎉 Shift started successfully'), 'success');

      } catch (error) {

        showAlert(tx('Error al iniciar turno', 'Error starting shift'), 'error');

      }

    }

    // Si es pago final (al terminar turno)

    else if (roomForCheckout) {

      try {

        await registerPayment(roomForCheckout.shift_id, paymentMethod);

        loadRooms();

        addNotification(tx('💰 Pago registrado', '💰 Payment registered'), 'success');

        setShowPaymentModal(false);

        setRoomForCheckout(null);

      } catch (error) {

        showAlert(tx('Error al registrar pago', 'Error registering payment'), 'error');

      }

    }

  };

  const handleClean = async (room) => {

    try {

      await markCleaned(room.id);

      loadRooms();

      addNotification(tx('✨ Habitación limpia', '✨ Room cleaned'), 'success');

    } catch (error) {

      showAlert(tx('Error al marcar limpieza', 'Error marking room as cleaned'), 'error');

    }

  };

  const handleExpiredShift = async (room) => {

    const confirmCleaning = await confirmAction(

      `${tx('El turno de la habitación', 'The shift for room')} ${room.room_number} ${tx('terminó. ¿Desea pasar a limpieza?', 'has ended. Send it to cleaning?')}`,

      { title: tx('Turno finalizado', 'Shift finished'), confirmButtonText: tx('Pasar a limpieza', 'Send to cleaning') }

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

    const confirmDone = await confirmAction(

      `${tx('Habitación', 'Room')} ${room.room_number} ${tx('limpia. ¿Poner en disponible?', 'is clean. Set as available?')}`,

      { title: tx('Limpieza finalizada', 'Cleaning finished'), confirmButtonText: tx('Poner disponible', 'Set as available') }

    );

    if (!confirmDone) {

      addNotification(`${tx('Habitación', 'Room')} ${room.room_number} ${tx('sigue en limpieza', 'is still being cleaned')}`, 'warning');

      return;

    }

    try {

      await markCleaned(room.id);

      loadRooms();

      addNotification(`✨ ${tx('Habitación', 'Room')} ${room.room_number} ${tx('disponible', 'available')}`, 'success');

    } catch (error) {

      console.error(error);

      addNotification(tx('Error al poner la habitación disponible', 'Error setting room as available'), 'error');

    }

  };

  const addNotification = (message, type) => {

    showToast(message, type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'success');

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

    return `$${number.toLocaleString(locale)}`;

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

                <span className="stat-label">{t.dashboard.totalRooms}</span>

                <span className="stat-value">{totalRooms}</span>

              </div>

              <div className="stat-item">

                <span className="stat-label">{t.dashboard.occupiedRooms}</span>

                <span className="stat-value occupied">{occupiedRooms}</span>

              </div>

              <div className="stat-item">

                <span className="stat-label">{t.dashboard.availableRooms}</span>

                <span className="stat-value available">{availableRooms}</span>

              </div>

              <div className="stat-item">

                <span className="stat-label">{t.dashboard.incomeToday}</span>

                <span className="stat-value">${Number(metrics?.daily?.total_income || 0).toLocaleString(locale) || 0}</span>

              </div>

            </div>

            {/* ENCABEZADO CON SU CONTENEDOR DE ACCIONES GRUPALES */}

            <div className="rooms-header">

              <h2>{t.dashboard.rooms}</h2>

              <div

                className="header-actions-group"

                style={{

                  marginLeft: 'auto',

                  display: 'flex',

                  justifyContent: 'flex-end'

                }}

              >

                <button

                  onClick={() => setCurrentPage('manage-rooms')}

                  className="manage-rooms-btn"

                >

                  {'⚙️ '} {t.dashboard.administer}

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

                    <div className="room-type">{getRoomTypeLabel(room.room_type)}</div>

                    {/* 1. ESTADO: OCUPADO PERO CON TIEMPO CORRIENDO */}

                    {isOccupied && timeLeft && !timeLeft.expired && (

                      <>

                        <div className="room-timer">{formatTimer(timeLeft)}</div>

                        <div className="room-status-badge text-occupied">

                          <img src="/src/assets/OCUPADO.PNG" alt={t.dashboard.occupied} className="status-icon" />

                          <span>{t.dashboard.occupied}</span>

                        </div>

                        <div className="room-actions">

                          <button

                            className="btn-extra-hours"

                            type="button"

                            onClick={(e) => { e.stopPropagation(); handleExtendTime(room); }}

                          >

                            {tx('Hs extra', 'Extra hrs')}

                          </button>

                          <button className="btn-free" onClick={(e) => { e.stopPropagation(); handleCheckout(room); }}>{tx('DETENER', 'STOP')}</button>

                          <button className="btn-amenities" onClick={(e) => { e.stopPropagation(); openAmenities(room); }}>{tx('MENÚ', 'MENU')}</button>

                        </div>

                      </>

                    )}

                    {/* 2. ESTADO: OCUPADO Y TIEMPO EXPIRADO */}

                    {isOccupied && timeLeft?.expired && (

                      <div className="room-expired">

                        <div className="room-status-badge text-expired">

                          <img src="/src/assets/OCUPADO.PNG" alt={t.dashboard.timeExpired} className="status-icon" />

                          <span>{t.dashboard.timeExpired}</span>

                        </div>

                        <div className="room-actions">

                          <button className="btn-clean" onClick={(e) => { e.stopPropagation(); handleExpiredShift(room); }}>{t.dashboard.finish}</button>

                          <button className="btn-amenities" onClick={(e) => { e.stopPropagation(); openAmenities(room); }}>{tx('MENÚ', 'MENU')}</button>

                        </div>

                      </div>

                    )}

                    {/* 3. ESTADO: EN LIMPIEZA */}

                    {isCleaning && (

                      <div className="room-cleaning">

                        <div className="room-status-badge text-cleaning">

                          <img src="/src/assets/LIMPIEZA.PNG" alt={t.dashboard.cleaning} className="status-icon" />

                          <span>{t.dashboard.cleaning}</span>

                        </div>

                        <div className="room-actions">

                          <button

                            className="btn-clean"

                            onClick={(e) => {

                              e.stopPropagation();

                              handleClean(room);

                            }}

                            disabled={!!cleaningCountdowns[room.id]}

                          >

                            {cleaningCountdowns[room.id]

                              ? `${t.dashboard.cleaningInProgress} ${cleaningCountdowns[room.id]}s`

                              : t.dashboard.markReady}

                          </button>

                          <button className="btn-amenities" onClick={(e) => { e.stopPropagation(); openAmenities(room); }}>{tx('MENÚ', 'MENU')}</button>

                        </div>

                      </div>

                    )}

                    {/* 4. ESTADO: DISPONIBLE */}

                    {room.status === 'available' && (

                      <div className="room-available">

                        <div className="room-status-badge text-available">

                          <img src="/src/assets/LIBRE.PNG" alt={t.dashboard.available} className="status-icon" />

                          <span>{t.dashboard.available}</span>

                        </div>

                        <div className="room-actions">

                          <button className="btn-start" onClick={(e) => { e.stopPropagation(); setSelectedRoom(room); }}>{t.dashboard.start}</button>

                          <button className="btn-amenities" onClick={(e) => { e.stopPropagation(); openAmenities(room); }}>{tx('MENÚ', 'MENU')}</button>

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

                <h2>⚙️ {tx('PANEL DE GESTIÓN: HABITACIONES', 'MANAGEMENT PANEL: ROOMS')}</h2>

                <button onClick={() => setCurrentPage('rooms')} className="refresh-btn">

                  {'⬅️ '} {t.users.backToPanel}

                </button>

              </div>

              <div className="abm-layout">

                {/* COLUMNA IZQUIERDA: FORMULARIO DE ALTA / MODIFICACIÓN */}

                <div className="abm-form-section">

                  <h3>{tx('Añadir / Editar Habitación', 'Add / Edit Room')}</h3>

                  <form onSubmit={handleRoomSubmit} className="abm-form">

                    <div className="form-group">

                      <label>{tx('NÚMERO DE HABITACIÓN', 'ROOM NUMBER')}</label>

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

                      <label>{tx('TIPO DE HABITACIÓN', 'ROOM TYPE')}</label>

                      <select name="room_type" value={roomForm.room_type} onChange={handleRoomInputChange} required>

                        <option value="especial">{tx('ESPECIAL', 'SPECIAL')}</option>

                        <option value="especial con hidro">{tx('ESPECIAL CON HIDRO', 'SPECIAL WITH HYDRO')}</option>

                        <option value="premium">PREMIUM</option>

                      </select>

                    </div>

                    <div className="form-group">

                      <label>{tx('PRECIO BASE ($)', 'BASE PRICE ($)')}</label>

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

                      <label>{tx('PRECIO EXTENDIDO ($)', 'EXTENDED PRICE ($)')}</label>

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

                      <label>{tx('PRECIO POR HORA EXTRA ($)', 'PRICE PER EXTRA HOUR ($)')}</label>

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

                        <small>{tx('Solo el administrador puede modificar este precio.', 'Only the administrator can modify this price.')}</small>

                      )}

                    </div>

                    <div className="form-actions-abm">

                      <button type="submit" className="btn-confirm-abm">

                        {editingRoom ? tx('ACTUALIZAR HABITACIÓN', 'UPDATE ROOM') : tx('GUARDAR HABITACIÓN', 'SAVE ROOM')}

                      </button>

                      <button type="button" onClick={resetRoomForm} className="btn-clear-abm">{t.users.clear}</button>

                    </div>

                  </form>

                </div>

                {/* COLUMNA DERECHA: LISTADO CON ACCIONES DE MODIFICACIÓN / ELIMINACIÓN */}

                <div className="abm-table-section">

                  <h3>{tx('Habitaciones Registradas', 'Registered Rooms')} ({rooms.length})</h3>

                  <div className="table-responsive-abm">

                    <table className="abm-table">

                      <thead>

                        <tr>

                          <th># {tx('ACCIÓN', 'ACTION')}</th>

                          <th>{tx('HABITACIÓN', 'ROOM')}</th>

                          <th>{tx('TIPO', 'TYPE')}</th>

                          <th>{tx('PRECIO BASE', 'BASE PRICE')}</th>

                          <th>{tx('PRECIO/H EXTRA', 'EXTRA HOUR PRICE')}</th>

                          <th>{tx('ACCIONES', 'ACTIONS')}</th>

                        </tr>

                      </thead>

                      <tbody>

                        {rooms.map((room, index) => (

                          <tr key={room.id}>

                            <td className="table-index">{index + 1}</td>

                            <td className="table-room-num">{tx('Habitación', 'Room')} {room.room_number}</td>

                            <td className="table-room-type">

                              <span className={`badge-type ${room.room_type?.replaceAll(' ', '-')}`}>

                                {getRoomTypeLabel(room.room_type)}

                              </span>

                            </td>

                            <td className="table-room-price">${room.base_price?.toLocaleString(locale)}</td>

                            <td className="table-room-price">${Number(room.price_per_extra_hour || 0).toLocaleString(locale)}</td>

                            <td>

                              <div className="table-actions-btns">

                                <button

                                  type="button"

                                  className="btn-table-edit"

                                  title={t.common.edit}

                                  onClick={() => handleEditRoom(room)}

                                >

                                  ✏️

                                </button>

                                <button

                                  type="button"

                                  className="btn-table-delete"

                                  title={t.common.delete}

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

                <h2>⚙️ {t.users.managementPanel}</h2>

                <button onClick={() => setCurrentPage('rooms')} className="refresh-btn">

                  {'⬅️ '} {t.users.backToPanel}

                </button>

              </div>

              <div className="abm-layout">

                <div className="abm-form-section">

                  <h3>{editingUser ? t.users.editStaff : t.users.registerStaff}</h3>

                  <form onSubmit={handleUserSubmit} className="abm-form">

                    <div className="form-group">

                      <label>{t.users.user}</label>

                      <input

                        type="text"

                        name="username"

                        value={userForm.username}

                        onChange={handleUserInputChange}

                        placeholder={t.users.usernamePlaceholder}

                        required

                        disabled={Boolean(editingUser)}

                      />

                    </div>

                    {!editingUser && (

                      <div className="form-group">

                        <label>{t.users.password}</label>

                        <input

                          type="password"

                          name="password"

                          value={userForm.password}

                          onChange={handleUserInputChange}

                          placeholder={t.users.passwordPlaceholder}

                          required

                        />

                      </div>

                    )}

                    <div className="form-group">

                      <label>{t.users.firstName}</label>

                      <input type="text" name="first_name" value={userForm.first_name} onChange={handleUserInputChange} placeholder={t.users.firstNamePlaceholder} required />

                    </div>

                    <div className="form-group">

                      <label>{t.users.lastName}</label>

                      <input type="text" name="last_name" value={userForm.last_name} onChange={handleUserInputChange} placeholder={t.users.lastNamePlaceholder} required />

                    </div>

                    <div className="form-group">

                      <label>{t.users.shift}</label>

                      <select name="shift" value={userForm.shift} onChange={handleUserInputChange} required>

                        <option value="mañana">{t.users.morning} (06:00 - 14:00)</option>

                        <option value="tarde">{t.users.afternoon} (14:00 - 22:00)</option>

                        <option value="noche">{t.users.night} (22:00 - 06:00)</option>

                      </select>

                    </div>

                    <div className="form-group">

                      <label>DNI</label>

                      <input type="text" name="dni" value={userForm.dni} onChange={handleUserInputChange} placeholder="Ej: XX.XX.XX" required />

                    </div>

                    <div className="form-group">

                      <label>{t.users.phone}</label>

                      <input type="text" name="phone" value={userForm.phone} onChange={handleUserInputChange} placeholder={t.users.phonePlaceholder} required />

                    </div>

                    <div className="form-group">

                      <label>{t.users.address}</label>

                      <input type="text" name="address" value={userForm.address} onChange={handleUserInputChange} placeholder={t.users.addressPlaceholder} required />

                    </div>

                    <div className="form-group">

                      <label>{t.users.role}</label>

                      <select name="role" value={userForm.role} onChange={handleUserInputChange} required>

                        <option value="receptionist">{t.users.receptionist}</option>

                        <option value="supervisor">{t.users.supervisor}</option>

                        <option value="admin">{t.users.admin}</option>

                      </select>

                    </div>

                    <div className="form-actions-abm-vertical">

                      <button type="submit" className="btn-confirm-abm">{editingUser ? t.users.save : t.users.create}</button>

                      <button type="button" onClick={resetUserForm} className="btn-modify-abm">{editingUser ? t.users.cancel : t.users.clear}</button>

                      {editingUser && (

                        <button type="button" onClick={() => handleDeleteUser(editingUser)} className="btn-free">{t.users.delete}</button>

                      )}

                    </div>

                  </form>

                </div>

                <div className="abm-table-section">

                  <h3>{t.users.registeredUsers}</h3>

                  {usersLoading ? (

                    <p className="table-hint-text">{t.users.loadingUsers}</p>

                  ) : usersError ? (

                    <p className="table-hint-text">{usersError}</p>

                  ) : (

                    <div className="table-responsive-abm">

                      <table className="abm-table users-custom-table">

                        <thead>

                          <tr>

                            <th>{t.users.name}</th>

                            <th>{t.users.lastNameTable}</th>

                            <th>{t.users.shiftTable}</th>

                            <th>DNI</th>

                            <th>{t.users.role}</th>

                          </tr>

                        </thead>

                        <tbody>

                          {users.length === 0 ? (

                            <tr>

                              <td colSpan="5" className="table-hint-text">{t.users.noUsers}</td>

                            </tr>

                          ) : (

                            users.map((user) => (

                              <tr key={user.id} className="table-row-selectable" onClick={() => handleEditUser(user)}>

                                <td className="table-room-num">{user.first_name || '—'}</td>

                                <td>{user.last_name || '—'}</td>

                                <td className="table-subtext">{getShiftLabel(user.shift)}</td>

                                <td className="table-index">{user.dni || '—'}</td>

                                <td>

                                  <span className={`badge-type ${user.role === 'admin' ? 'suite' : 'simple'}`}>

                                    {getRoleLabel(user.role)}

                                  </span>

                                </td>

                              </tr>

                            ))

                          )}

                        </tbody>

                      </table>

                    </div>

                  )}

                  <p className="table-hint-text">{t.users.tableHint}</p>

                </div>

              </div>

            </div>

          </div>

        ) : currentPage === 'reports' ? (

          <div className="reports-page-wrapper">

            <div className="reports-page-header">

              <h2>📊 {tx('MÓDULO DE AUDITORÍA Y REPORTES GENERALES', 'GENERAL AUDIT & REPORTS MODULE')}</h2>

              <button onClick={() => setCurrentPage('rooms')} className="refresh-btn">

                {'⬅️ '} {t.users.backToPanel}

              </button>

            </div>

            <div className="reports-top-grid">

              <div className="reports-kpi-column">

                <div className="report-card-kpi">

                  <span className="kpi-title">{tx('Registros en daily_metrics', 'Records in daily_metrics')}</span>

                  <div className="kpi-value-box">

                    <span className="kpi-main-value">{totalReports}</span>

                  </div>

                </div>

                <div className="report-card-kpi">

                  <span className="kpi-title">{tx('Ingresos acumulados', 'Accumulated income')}</span>

                  <div className="kpi-value-box">

                    <span className="kpi-main-value method-text">{formatCurrency(cumulativeIncome)}</span>

                  </div>

                </div>

              </div>

              <div className="report-card-box chart-box-container">

                <h3 className="chart-title">{tx('Último registro diario', 'Latest daily record')}</h3>

                {dailyReportsLoading ? (

                  <p className="table-hint-text">{t.reports.loading}</p>

                ) : dailyReportsError ? (

                  <p className="table-hint-text">{dailyReportsError}</p>

                ) : (

                  <div className="chart-native-body">

                    <div className="chart-row">

                      <span className="chart-label">{t.reports.date}</span>

                      <span className="table-room-num">{latestReport.date || '—'}</span>

                    </div>

                    <div className="chart-row">

                      <span className="chart-label">{t.reports.shiftsTitle}</span>

                      <span className="table-room-num">{latestReport.total_shifts || 0}</span>

                    </div>

                    <div className="chart-row">

                      <span className="chart-label">{t.reports.income}</span>

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

                <h3 className="chart-title">{tx('Detalle de métricas diarias', 'Daily metrics details')}</h3>

                {dailyReportsLoading ? (

                  <p className="table-hint-text">{t.reports.loading}</p>

                ) : dailyReportsError ? (

                  <p className="table-hint-text">{dailyReportsError}</p>

                ) : (

                  <div className="table-responsive-abm compact-reports-table">

                    <table className="abm-table layout-table-reports">

                      <thead>

                        <tr>

                          <th>{t.reports.date}</th>

                          <th>{t.reports.shiftsTitle}</th>

                          <th>{t.reports.income}</th>

                          <th>{t.reports.cash}</th>

                          <th>{t.reports.card}</th>

                          <th>{t.reports.transfer}</th>

                        </tr>

                      </thead>

                      <tbody>

                        {dailyReports.length === 0 ? (

                          <tr>

                            <td colSpan="6" className="table-hint-text">{tx('No hay registros en daily_metrics.', 'There are no records in daily_metrics.')}</td>

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

              {tx('Podés visualizar los canales de atención y medios de soporte técnico directamente en el pie de página de Intimax System.', 'You can view support channels and technical assistance options directly in the Intimax System footer.')}

            </p>

          </div>

        )}

      </main>

      {/* MODAL PARA INICIAR TURNO */}

      {selectedRoom && (

        <div className="modal-overlay" onClick={() => setSelectedRoom(null)}>

          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <h2>{tx('HABITACIÓN', 'ROOM')} {selectedRoom.room_number}</h2>

            <p>{tx('Tipo', 'Type')}: {getRoomTypeLabel(selectedRoom.room_type)}</p>

            <p>{tx('Precio base', 'Base price')}: ${Number(selectedRoom.base_price || 0).toLocaleString(locale)}</p>

            <p>{tx('Precio extendido', 'Extended price')}: ${Number(selectedRoom.extended_price || 0).toLocaleString(locale)}</p>

            <div className="duration-selector">

              <label>{t.dashboard.duration.toUpperCase()}:</label>

              <div className="duration-buttons">

                <button

                  className={`duration-btn ${duration === 2 ? 'active' : ''}`}

                  type="button"

                  onClick={() => setDuration(2)}

                >

                  {2} {tx('HS', 'HRS')}

                </button>

                <button

                  className={`duration-btn ${duration !== 2 ? 'active' : ''}`}

                  type="button"

                  disabled={currentTime.getHours() >= 8 && currentTime.getHours() < 22}

                  onClick={() => setDuration(getExtendedDuration())}

                >

                  {tx('EXTENDIDO', 'EXTENDED')} - ${Number(selectedRoom.extended_price || 0).toLocaleString(locale)}

                </button>

              </div>

            </div>

            <div className="modal-actions">

              <button onClick={handleStartShift} className="btn-confirm">

                {t.dashboard.startShift.toUpperCase()}

              </button>

              <button onClick={() => setSelectedRoom(null)} className="btn-cancel">

                {t.dashboard.cancel.toUpperCase()}

              </button>

            </div>

          </div>

        </div>

      )}

      {/* MODAL PARA SELECCIONAR MÉTODO DE PAGO */}

      {showPaymentModal && (roomForCheckout || roomForInitialPayment) && (

        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>

          <div className="modal-content" onClick={(e) => e.stopPropagation()}>

            <h2>{t.dashboard.paymentMethod.toUpperCase()}</h2>

            <p>{tx('Habitación', 'Room')} {roomForCheckout?.room_number || roomForInitialPayment?.room_number}</p>

            {roomForInitialPayment && <p style={{ fontSize: '12px', color: '#9CA3AF' }}>{t.dashboard.duration}: {durationForPayment} {t.dashboard.hours}</p>}

            <div className="payment-options">

              <button

                className="payment-btn cash"

                onClick={() => handleConfirmPayment('cash')}

              >

                {'💵 '} {t.dashboard.cash.toUpperCase()}

              </button>

              <button

                className="payment-btn card"

                onClick={() => handleConfirmPayment('card')}

              >

                {'💳 '} {t.dashboard.card.toUpperCase()}

              </button>

              <button

                className="payment-btn transfer"

                onClick={() => handleConfirmPayment('transfer')}

              >

                {'🏦 '} {t.dashboard.transfer.toUpperCase()}

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

                {t.dashboard.cancel.toUpperCase()}

              </button>

            </div>

          </div>

        </div>

      )}

    </div>

  );

}

export default Dashboard;
