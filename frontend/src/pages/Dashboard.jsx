import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import RoomTile from '../components/RoomTile';
import { getRooms, createShift, registerPayment, markCleaned, getTodayMetrics } from '../services/api';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [duration, setDuration] = useState(2);
  const [notifications, setNotifications] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const { user } = useAuth();
  
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'supervisor';

  useEffect(() => {
    loadRooms();
    loadMetrics();
    
    socket.emit('join_reception');
    
    socket.on('shift_created', () => {
      loadRooms();
      loadMetrics();
      addNotification('✅ Nuevo turno iniciado', 'success');
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
      socket.off('shift_created');
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
      addNotification('💰 Pago registrado exitosamente', 'success');
    } catch (error) {
      alert('Error al registrar pago');
    }
  };

  const handleClean = async (room) => {
    try {
      await markCleaned(room.id);
      loadRooms();
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

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
  const cleaningRooms = rooms.filter(r => r.status === 'cleaning').length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;

  // Panel para ADMIN/GERENTE (con múltiples páginas)
  const renderAdminPanel = () => {
    switch(currentPage) {
      case 'dashboard':
        return (
          <>
            {/* Stats Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ background: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3>📊 Ocupación</h3>
                <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{occupiedRooms}/{totalRooms}</div>
                <small>hab totales</small>
              </div>
              <div style={{ background: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3>🟢 Disponibles</h3>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'green' }}>{availableRooms}</div>
                <small>para usar</small>
              </div>
              <div style={{ background: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3>🧹 Por Limpiar</h3>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'orange' }}>{cleaningRooms}</div>
                <small>en limpieza</small>
              </div>
              <div style={{ background: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3>💰 Ingresos Hoy</h3>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: 'green' }}>
                  ${metrics?.daily?.total_income?.toLocaleString() || 0}
                </div>
                <small>efectivo + tarjeta</small>
              </div>
            </div>

            {/* Rooms Grid */}
            <div style={{
              background: 'white',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0 }}>🏠 Habitaciones</h2>
                <button 
                  onClick={loadRooms}
                  style={{ padding: '8px 16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                  🔄 Actualizar
                </button>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '20px'
              }}>
                {rooms.map(room => (
                  <RoomTile
                    key={room.id}
                    room={room}
                    onClick={() => room.status === 'available' && setSelectedRoom(room)}
                    onCheckout={() => handleCheckout(room)}
                    onClean={() => handleClean(room)}
                  />
                ))}
              </div>
            </div>
          </>
        );
      
      case 'rooms':
        return (
          <div style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2>🏨 Gestión de Habitaciones</h2>
            <p>Administra todas las habitaciones del establecimiento</p>
            <hr style={{ margin: '20px 0' }} />
            <button style={{ padding: '10px 20px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
              + Agregar Nueva Habitación
            </button>
            <div style={{ marginTop: '20px' }}>
              <h3>Listado completo:</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f2f2f2' }}>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>N°</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Tipo</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Precio Base</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Estado</th>
                    <th style={{ padding: '10px', border: '1px solid #ddd' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map(room => (
                    <tr key={room.id}>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{room.room_number}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{room.room_type}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>${room.base_price}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>{room.status}</td>
                      <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                        <button style={{ marginRight: '5px', padding: '5px 10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '3px' }}>Editar</button>
                        <button style={{ padding: '5px 10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '3px' }}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'reports':
        return (
          <div style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2>📈 Reportes y Estadísticas</h2>
            <p>Análisis detallado del negocio</p>
            <hr style={{ margin: '20px 0' }} />
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', marginTop: '20px' }}>
              <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                <h3>📊 Ingresos por día</h3>
                <div style={{ height: '200px', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '5px' }}>
                  [Gráfico de barras]
                </div>
                <p style={{ marginTop: '10px' }}>Total mes: ${(metrics?.daily?.total_income * 30 || 0).toLocaleString()}</p>
              </div>
              
              <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                <h3>⏰ Horas pico</h3>
                <div style={{ height: '200px', background: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '5px' }}>
                  [Gráfico de líneas]
                </div>
                <p style={{ marginTop: '10px' }}>Mayor actividad: 20:00 - 00:00 hs</p>
              </div>
              
              <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                <h3>🔄 Rotación de habitaciones</h3>
                <div style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center', margin: '20px 0' }}>
                  {metrics?.daily?.room_rotation_rate || 2.5}x
                </div>
                <p>Veces que se usa cada habitación por día</p>
              </div>
              
              <div style={{ padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
                <h3>💳 Métodos de pago</h3>
                <div>Efectivo: 65%</div>
                <div>Tarjeta: 25%</div>
                <div>Transferencia: 10%</div>
              </div>
            </div>
            
            <div style={{ marginTop: '20px', padding: '15px', background: '#f9f9f9', borderRadius: '8px' }}>
              <h3>📅 Reporte del día {new Date().toLocaleDateString()}</h3>
              <table style={{ width: '100%', marginTop: '10px' }}>
                <tr><td>Total turnos:</td><td><strong>{metrics?.daily?.total_shifts || 0}</strong></td></tr>
                <tr><td>Ingreso total:</td><td><strong>${metrics?.daily?.total_income?.toLocaleString() || 0}</strong></td></tr>
                <tr><td>Extensiones realizadas:</td><td><strong>{metrics?.daily?.extensions_total || 0}</strong></td></tr>
                <tr><td>No-shows:</td><td><strong>{metrics?.daily?.no_shows || 0}</strong></td></tr>
              </table>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div style={{ background: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <h2>⚙️ Configuración del Sistema</h2>
            <p>Parámetros generales del negocio</p>
            <hr style={{ margin: '20px 0' }} />
            
            <div style={{ maxWidth: '600px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h3>💰 Precios generales</h3>
                <label>Precio hora extra: </label>
                <input type="number" defaultValue="5000" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ddd', borderRadius: '5px' }} />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3>🧹 Tiempo de limpieza</h3>
                <label>Minutos por habitación: </label>
                <input type="number" defaultValue="20" style={{ marginLeft: '10px', padding: '5px', border: '1px solid #ddd', borderRadius: '5px' }} />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <h3>👥 Gestión de Usuarios</h3>
                <button style={{ padding: '8px 16px', background: '#4caf50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                  + Agregar Nuevo Empleado
                </button>
                <div style={{ marginTop: '10px' }}>
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>admin</td><td>Administrador</td><td>Activo</td><td><button>Editar</button></td></tr>
                      <tr><td>recepcion</td><td>Recepcionista</td><td>Activo</td><td><button>Editar</button></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return <div>Página no encontrada</div>;
    }
  };

  // Panel para EMPLEADOS/RECEPCIONISTAS (solo dashboard simple)
  const renderEmployeePanel = () => {
    return (
      <div style={{ padding: '20px', minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        {/* Header simple para empleados */}
        <div style={{
          background: 'white',
          borderRadius: '10px',
          padding: '15px 20px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div>
            <h2 style={{ margin: 0 }}>🏨 Telo Management</h2>
            <small>Sistema para Recepción</small>
          </div>
          <div>
            <span style={{ marginRight: '15px' }}>👤 {user?.full_name || user?.username}</span>
          </div>
        </div>

        {/* Stats Cards simplificadas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <div style={{ background: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
            <h3>📊 Ocupación</h3>
            <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{occupiedRooms}/{totalRooms}</div>
          </div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
            <h3>🟢 Disponibles</h3>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'green' }}>{availableRooms}</div>
          </div>
          <div style={{ background: 'white', padding: '15px', borderRadius: '10px', textAlign: 'center' }}>
            <h3>🧹 Por Limpiar</h3>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: 'orange' }}>{cleaningRooms}</div>
          </div>
        </div>

        {/* Rooms Grid para empleados (más grande, más visible) */}
        <div style={{
          background: 'white',
          borderRadius: '10px',
          padding: '20px'
        }}>
          <h3 style={{ marginBottom: '20px' }}>🏠 Estado de Habitaciones</h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {rooms.map(room => (
              <RoomTile
                key={room.id}
                room={room}
                onClick={() => room.status === 'available' && setSelectedRoom(room)}
                onCheckout={() => handleCheckout(room)}
                onClean={() => handleClean(room)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {isAdminOrManager ? renderAdminPanel() : renderEmployeePanel()}

      {/* Modal para nuevo turno (común para ambos) */}
      {selectedRoom && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '10px',
            minWidth: '320px'
          }}>
            <h2>Habitación {selectedRoom.room_number}</h2>
            <p>Tipo: {selectedRoom.room_type}</p>
            <p>Precio base: ${selectedRoom.base_price.toLocaleString()}</p>
            
            <label style={{ display: 'block', marginTop: '15px' }}>⏱️ Duración:</label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '10px',
                margin: '10px 0',
                border: '1px solid #ddd',
                borderRadius: '5px',
                fontSize: '16px'
              }}
            >
              <option value={2}>2 horas - ${selectedRoom.base_price.toLocaleString()}</option>
              <option value={4}>4 horas - ${selectedRoom.base_price.toLocaleString()}</option>
              <option value={6}>6 horas - ${(selectedRoom.base_price + (selectedRoom.price_per_extra_hour * 2)).toLocaleString()}</option>
            </select>
            
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button
                onClick={handleStartShift}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Iniciar Turno
              </button>
              <button
                onClick={() => setSelectedRoom(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#95a5a6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificaciones */}
      <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 2000 }}>
        {notifications.map(n => (
          <div
            key={n.id}
            style={{
              background: n.type === 'success' ? '#4caf50' : n.type === 'warning' ? '#ff9800' : '#2196f3',
              color: 'white',
              padding: '12px 20px',
              margin: '5px',
              borderRadius: '5px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              animation: 'slideIn 0.3s ease-out',
              minWidth: '250px'
            }}
          >
            {n.message}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        button:hover {
          transform: translateY(-2px);
          transition: transform 0.2s;
        }
      `}</style>
    </Layout>
  );
}

export default Dashboard;