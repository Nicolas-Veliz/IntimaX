import React, { useState, useEffect } from 'react';

function RoomTile({ room, onClick, onCheckout, onClean }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (room.end_time && room.status === 'occupied') {
      const updateTimer = () => {
        const end = new Date(room.end_time);
        const now = new Date();
        const diff = end - now;
        
        if (diff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        } else {
          const hours = Math.floor(diff / 3600000);
          const minutes = Math.floor((diff % 3600000) / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);
          setTimeLeft({ hours, minutes, seconds });
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [room.end_time, room.status]);

  const getColor = () => {
    if (room.status === 'available') return '#4caf50';
    if (room.status === 'occupied') return '#f44336';
    if (room.status === 'cleaning') return '#ffc107';
    return '#9e9e9e';
  };

  const getStatusText = () => {
    if (room.status === 'available') return 'Disponible';
    if (room.status === 'occupied') return 'Ocupado';
    if (room.status === 'cleaning') return 'Limpieza';
    return 'Mantenimiento';
  };

  return (
    <div
      onClick={room.status === 'available' ? onClick : undefined}
      style={{
        background: getColor(),
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
        cursor: room.status === 'available' ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        position: 'relative'
      }}
      onMouseEnter={e => {
        if (room.status === 'available') {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
      }}
    >
      <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{room.room_number}</div>
      <div style={{ marginTop: '10px', fontSize: '14px', fontWeight: 'bold' }}>{getStatusText()}</div>
      
      {timeLeft && room.status === 'occupied' && (
        <div style={{ 
          marginTop: '10px', 
          fontSize: '16px', 
          fontWeight: 'bold',
          background: 'rgba(0,0,0,0.2)',
          padding: '5px',
          borderRadius: '5px'
        }}>
          ⏱️ {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </div>
      )}
      
      {room.status === 'occupied' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCheckout();
          }}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: 'white',
            color: '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          💰 Cobrar
        </button>
      )}
      
      {room.status === 'cleaning' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClean();
          }}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            background: 'white',
            color: '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          ✨ Marcar Limpia
        </button>
      )}
    </div>
  );
}

export default RoomTile;