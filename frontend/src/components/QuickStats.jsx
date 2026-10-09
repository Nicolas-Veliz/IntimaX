import React from 'react';
import './QuickStats.css';

import { useLanguage } from '../contexts/LanguageContext';

function QuickStats({ metrics }) {
  const { translations: t } = useLanguage();

  const totalRooms =
    metrics.current.occupied_rooms +
    metrics.current.cleaning_rooms +
    metrics.current.available_rooms;

  const occupancyRate =
    totalRooms > 0
      ? ((metrics.current.occupied_rooms / totalRooms) * 100).toFixed(1)
      : '0.0';

  return (
    <div className="quick-stats">

      <div className="stat-card">
        <div className="stat-icon">🏠</div>

        <div className="stat-info">
          <h3>{t.quickStats.occupancy}</h3>

          <div className="stat-number">
            {metrics.current.occupied_rooms}/{totalRooms}
          </div>

          <div className="stat-trend">
            {occupancyRate}% {t.quickStats.occupied}
          </div>
        </div>
      </div>


      <div className="stat-card">
        <div className="stat-icon">💰</div>

        <div className="stat-info">
          <h3>{t.quickStats.dailyCash}</h3>

          <div className="stat-number">
            ${metrics.daily?.total_income || 0}
          </div>

          <div className="stat-detail">
            {t.quickStats.cash}: ${metrics.daily?.cash_income || 0}
          </div>
        </div>
      </div>


      <div className="stat-card">
        <div className="stat-icon">🧹</div>

        <div className="stat-info">
          <h3>{t.quickStats.toClean}</h3>

          <div className="stat-number">
            {metrics.current.cleaning_rooms}
          </div>

          <div className="stat-trend">
            {t.quickStats.rooms}
          </div>
        </div>
      </div>


      <div className="stat-card">
        <div className="stat-icon">📈</div>

        <div className="stat-info">
          <h3>{t.quickStats.turnover}</h3>

          <div className="stat-number">
            {metrics.daily?.room_rotation_rate || 0}
          </div>

          <div className="stat-trend">
            {t.quickStats.timesPerDay}
          </div>
        </div>
      </div>

    </div>
  );
}

export default QuickStats;