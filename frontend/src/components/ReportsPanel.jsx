import React, { useState, useEffect } from 'react';
import { getActivityReport, getUsers } from '../services/api';

function ReportsPanel() {
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    user_id: ''
  });

  useEffect(() => {
    loadReport();
    loadUsers();
  }, []);

  const loadReport = async () => {
    try {
      const data = await getActivityReport(filters);
      setLogs(data.logs || []);
      setSummary(data.summary || []);
    } catch (error) {
      console.error('Error loading report:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '--';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes} minutos`;
  };

  return (
    <div className="admin-panel reports-panel">
      <h2>📊 REPORTES DE ACTIVIDAD</h2>
      
      {/* Filtros */}
      <div className="filters-bar">
        <div className="filter-group">
          <label>Fecha desde:</label>
          <input type="date" value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value})} />
        </div>
        <div className="filter-group">
          <label>Fecha hasta:</label>
          <input type="date" value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value})} />
        </div>
        <div className="filter-group">
          <label>Recepcionista:</label>
          <select value={filters.user_id} onChange={e => setFilters({...filters, user_id: e.target.value})}>
            <option value="">Todos</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.first_name} {user.last_name}</option>
            ))}
          </select>
        </div>
        <button className="btn-filter" onClick={loadReport}>🔍 FILTRAR</button>
      </div>
      
      {/* Resumen por usuario */}
      <div className="summary-section">
        <h3>📈 RESUMEN POR RECEPCIONISTA</h3>
        <div className="summary-grid">
          {summary.map(user => (
            <div key={user.id} className="summary-card">
              <div className="summary-avatar">
                {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
              </div>
              <div className="summary-info">
                <h4>{user.first_name} {user.last_name}</h4>
                <p>🔄 {user.total_logins || 0} ingresos</p>
                <p>⏱️ Promedio: {formatDuration(user.avg_session_seconds)}</p>
                <p>📅 Último: {user.last_activity ? new Date(user.last_activity).toLocaleString() : 'Nunca'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Tabla de logs detallados */}
      <div className="logs-section">
        <h3>📋 REGISTRO DETALLADO</h3>
        <div className="logs-table-container">
          <table className="logs-table">
            <thead>
              <tr>
                <th>Recepcionista</th>
                <th>Acción</th>
                <th>Fecha y Hora</th>
                <th>Duración</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id}>
                  <td>{log.first_name} {log.last_name}</td>
                  <td>
                    <span className={`action-badge ${log.action}`}>
                      {log.action === 'login' ? '🔓 INGRESO' : '🔒 SALIDA'}
                    </span>
                  </td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.action === 'logout' ? formatDuration(log.session_duration) : '--'}</td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>No hay registros en el período seleccionado</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ReportsPanel;