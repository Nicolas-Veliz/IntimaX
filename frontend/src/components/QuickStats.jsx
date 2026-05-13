import React from 'react';
import './QuickStats.css';

function QuickStats({ metrics }) {
  const totalRooms = metrics.current.occupied_rooms + metrics.current.cleaning_rooms + metrics.current.available_rooms;
  const occupancyRate = ((metrics.current.occupied_rooms / totalRooms) * 100).toFixed(1);
  
  return (
    <div className="quick-stats">
      <div className="stat-card">
        <div className="stat-icon">🏠</div>
        <div className="stat-info">
          <h3>Ocupación</h3>
          <div className="stat-number">{metrics.current.occupied_rooms}/{totalRooms}</div>
          <div className="stat-trend">{occupancyRate}% ocupado</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">💰</div>
        <div className="stat-info">
          <h3>Caja del día</h3>
          <div className="stat-number">${metrics.daily?.total_income || 0}</div>
          <div className="stat-detail">
            Efectivo: ${metrics.daily?.cash_income || 0}
          </div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">🧹</div>
        <div className="stat-info">
          <h3>Por limpiar</h3>
          <div className="stat-number">{metrics.current.cleaning_rooms}</div>
          <div className="stat-trend">habitaciones</div>
        </div>
      </div>
      
      <div className="stat-card">
        <div className="stat-icon">📈</div>
        <div className="stat-info">
          <h3>Rotación</h3>
          <div className="stat-number">{metrics.daily?.room_rotation_rate || 0}</div>
          <div className="stat-trend">veces/día</div>
        </div>
      </div>
    </div>
  );
}

export default QuickStats;