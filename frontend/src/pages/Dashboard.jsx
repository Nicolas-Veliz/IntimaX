import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RoomTile from '../components/RoomTile';
import QuickStats from '../components/QuickStats';
import ExtendTimeModal from '../components/ExtendTimeModal';
import CashRegister from '../components/CashRegister';
import { getRooms, createShift, extendShift, registerPayment, confirmNoShow, getTodayMetrics } from '../services/api';
import io from 'socket.io-client';
import './Dashboard.css';

const socket = io('http://localhost:3000');

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [extendingShift, setExtendingShift] = useState(null);
  const [duration, setDuration] = useState(2);
  const [notifications, setNotifications] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [showCashRegister, setShowCashRegister] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    loadRooms();
    loadMetrics();
    
    socket.emit('join_reception');
    
    socket.on('shift_created', () => {
      loadRooms();
      loadMetrics();
      addNotification('Nuevo turno iniciado', 'success');
    });
    
    socket.on('shift_extended', (shift) => {
      loadRooms();
      addNotification(`Habitación ${shift.room_number} - Tiempo extendido`, 'info');
    });
    
    socket.on('room_needs_cleaning', (data) => {
      loadRooms();
      addNotification(`Habitación ${data.room_id} necesita limpieza`, 'warning');
    });
    
    socket.on('room_cleaned', () => {
      loadRooms();
      loadMetrics();
      addNotification('Habitación limpia y disponible', 'success');
    });
    
    socket.on('no_show_confirmed', () => {
      loadRooms();
      addNotification('No-show confirmado, habitación liberada', 'info');
    });
    
    return () => {
      socket.off('shift_created');
      socket.off('shift_extended');
      socket.off('room_needs_cleaning');
      socket.off('room_cleaned');
      socket.off('no_show_confirmed');
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

  const handleRoomClick = (room) => {
    if (room.status === 'available') {
      setSelectedRoom(room);
    } else if (room.status === 'occupied') {
      // Preguntar si quiere extender o cobrar
      if (window.confirm(`Habitación ${room.room_number} - ¿Desea extender tiempo o cobrar?`)) {
        setExtendingShift(room);
      }
    }
  };

  const handleStartShift = async () => {
    try {
      await createShift(selectedRoom.id, duration);
      setSelectedRoom(null);
      setDuration(2);
    } catch (error) {
      alert(error.response?.data?.message || 'Error al iniciar turno');
    }
  };

  const handleExtendTime = async (shiftId, extraHours) => {
    try {
      await extendShift(shiftId, extraHours);
      setExtendingShift(null);
    } catch (error) {
      alert('Error al extender tiempo');
    }
  };

  const handleCheckout = async (room) => {
    const method = prompt('Método de pago:\n1. Efectivo\n2. Tarjeta\n3. Transferencia', '1');
    let payment_method = '';
    
    switch(method) {
      case '1': payment_method = 'cash'; break;
      case '2': payment_method = 'card'; break;
      case '3': payment_method = 'transfer'; break;
      default: return;
    }
    
    try {
      await registerPayment(room.shift_id, payment_method);
      loadRooms();
      loadMetrics();
      addNotification(`Habitación ${room.room_number} - Pago registrado`, 'success');
    } catch (error) {
      alert('Error al registrar pago');
    }
  };

  const handleNoShow = async (room) => {
    if (window.confirm(`¿Confirmar que el cliente de la habitación ${room.room_number} no ingresó?`)) {
      try {
        await confirmNoShow(room.shift_id);
      } catch (error) {
        alert('Error al confirmar no-show');
      }
    }
  };

  const addNotification = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  return (
    <div className="dashboard telo-dashboard">
      <div className="header">
        <h1>🏨 Sistema de Gestión - Albergue Transitorio</h1>
        <div className="user-info">
          <span>👤 {user?.full_name || user?.username} ({user?.role})</span>
          <button onClick={() => setShowCashRegister(true)} className="cash-btn">
            💰 Caja
          </button>
          <button onClick={logout} className="logout-btn">🚪 Salir</button>
        </div>
      </div>
      
      {metrics && <QuickStats metrics={metrics} />}
      
      <div className="rooms-container">
        <h2>🏠 Habitaciones</h2>
        <div className="rooms-grid">
          {rooms.map(room => (
            <RoomTile
              key={room.id}
              room={room}
              onClick={() => handleRoomClick(room)}
              onCheckout={() => handleCheckout(room)}
              onNoShow={() => handleNoShow(room)}
            />
          ))}
        </div>
      </div>
      
      {selectedRoom && (
        <div className="modal">
          <div className="modal-content">
            <h2>Habitación {selectedRoom.room_number}</h2>
            <p>Tipo: {selectedRoom.room_type} - ${selectedRoom.base_price}</p>
            <label>⏱️ Duración (horas):</label>
            <div className="duration-buttons">
              <button onClick={() => setDuration(2)} className={duration === 2 ? 'active' : ''}>
                2 hs - ${selectedRoom.base_price}
              </button>
              <button onClick={() => setDuration(4)} className={duration === 4 ? 'active' : ''}>
                4 hs - ${selectedRoom.base_price}
              </button>
              <button onClick={() => setDuration(6)} className={duration === 6 ? 'active' : ''}>
                6 hs - ${selectedRoom.base_price + (selectedRoom.price_per_extra_hour * 2)}
              </button>
            </div>
            <div className="modal-buttons">
              <button onClick={handleStartShift} className="btn-primary">
                Iniciar Turno
              </button>
              <button onClick={() => setSelectedRoom(null)} className="btn-secondary">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {extendingShift && (
        <ExtendTimeModal
          shift={extendingShift}
          onExtend={handleExtendTime}
          onClose={() => setExtendingShift(null)}
        />
      )}
      
      {showCashRegister && (
        <CashRegister onClose={() => setShowCashRegister(false)} />
      )}
      
      <div className="notifications">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            {notification.message}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;