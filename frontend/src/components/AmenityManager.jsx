import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API } from '../services/api';

function AmenityManager({ onClose, room, onConsumed }) {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [roomConsumption, setRoomConsumption] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    min_stock_alert: '5',
    category: 'otros'
  });

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadAmenities();
    checkLowStock();
    loadRoomConsumption();
  }, [room?.id, room?.shift_id]);

  const loadAmenities = async () => {
    try {
      const response = await API.get('/amenities');
      setAmenities(response.data || []);
    } catch (error) {
      console.error('Error loading amenities:', error);
      setAmenities([]);
    } finally {
      setLoading(false);
    }
  };

  const checkLowStock = async () => {
    try {
      const response = await API.get('/amenities/low-stock');
      setLowStock(response.data || []);
    } catch (error) {
      console.error('Error checking low stock:', error);
      setLowStock([]);
    }
  };

  const loadRoomConsumption = async () => {
    if (!room?.shift_id) {
      setRoomConsumption([]);
      return;
    }

    try {
      const response = await API.get(`/amenities/consumption/${room.shift_id}`);
      setRoomConsumption(response.data || []);
    } catch (error) {
      console.error('Error loading room consumption:', error);
      setRoomConsumption([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = editingAmenity
        ? `/amenities/${editingAmenity.id}`
        : '/amenities';
      const method = editingAmenity ? 'put' : 'post';

      await API[method](url, formData);

      await loadAmenities();
      await checkLowStock();
      setShowForm(false);
      setEditingAmenity(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        min_stock_alert: '5',
        category: 'otros'
      });
    } catch (error) {
      console.error('Error saving amenity:', error);
      alert('Error al guardar el amenity');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este amenity?')) return;

    try {
      await API.delete(`/amenities/${id}`);
      await loadAmenities();
      await checkLowStock();
    } catch (error) {
      console.error('Error deleting amenity:', error);
      alert('Error al eliminar');
    }
  };

  const handleEdit = (amenity) => {
    setEditingAmenity(amenity);
    setFormData({
      name: amenity.name,
      description: amenity.description || '',
      price: amenity.price,
      stock: amenity.stock,
      min_stock_alert: amenity.min_stock_alert,
      category: amenity.category
    });
    setShowForm(true);
  };

  const getCategoryEmoji = (category) => {
    const emojis = {
      bebidas: '🥤',
      comidas: '🍕',
      higiene: '🧴',
      entretenimiento: '🎮',
      otros: '📦'
    };
    return emojis[category] || '📦';
  };

  const getCategoryName = (category) => {
    const names = {
      bebidas: 'Bebidas',
      comidas: 'Comidas',
      higiene: 'Higiene',
      entretenimiento: 'Entretenimiento',
      otros: 'Otros'
    };
    return names[category] || category;
  };

  const handleRemoveFromRoom = async (consumptionItem) => {
    if (!consumptionItem?.id) return;

    const confirmed = window.confirm(`¿Desea quitar ${consumptionItem.name} de la habitación ${room?.room_number}?`);
    if (!confirmed) return;

    try {
      setIsAdding(true);
      const response = await API.delete(`/amenities/consume/${consumptionItem.id}`);

      await loadAmenities();
      await checkLowStock();
      await loadRoomConsumption();

      if (onConsumed) {
        onConsumed({
          roomId: room.id,
          total: response.data.new_total,
          amenityName: consumptionItem.name,
        });
      }

      alert(`🗑️ ${consumptionItem.name} eliminado correctamente`);
    } catch (error) {
      console.error('Error removing amenity consumption:', error);
      alert('No se pudo eliminar el consumo');
    } finally {
      setIsAdding(false);
    }
  };

  const handleAddToRoom = async (amenity) => {
    if (!room?.shift_id) {
      alert('No hay un turno activo para esta habitación');
      return;
    }

    const confirmed = window.confirm(`¿Desea agregar ${amenity.name} a la habitación ${room.room_number}?`);
    if (!confirmed) return;

    try {
      setIsAdding(true);
      const response = await API.post('/amenities/consume', {
        shift_id: room.shift_id,
        room_id: room.id,
        amenity_id: amenity.id,
        quantity: 1
      });

      await loadAmenities();
      await checkLowStock();
      await loadRoomConsumption();

      if (onConsumed) {
        onConsumed({
          roomId: room.id,
          total: response.data.new_total,
          amenityName: amenity.name,
          amenityPrice: response.data.amenity_price
        });
      }

      openReceipt({
        roomNumber: room.room_number,
        roomType: room.room_type,
        roomPrice: room.shift_price ?? room.base_price ?? 0,
        amenityName: amenity.name,
        amenityPrice: response.data.amenity_price,
        total: response.data.new_total,
        date: new Date().toLocaleString('es-AR')
      });

      alert(`✅ ${amenity.name} agregado correctamente`);
    } catch (error) {
      console.error('Error consuming amenity:', error);
      alert('No se pudo agregar el amenity a la habitación');
    } finally {
      setIsAdding(false);
    }
  };

  const openReceipt = (receiptData) => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      alert('El navegador bloqueó la ventana de impresión');
      return;
    }

    const logoSvg = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="220" height="70" viewBox="0 0 220 70">
        <rect width="220" height="70" rx="10" fill="#0f0f10"/>
        <text x="110" y="34" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#E8BA6F" text-anchor="middle">INTIMAX</text>
        <text x="110" y="54" font-family="Arial, sans-serif" font-size="11" fill="#C8A46A" text-anchor="middle">HOTEL & RECREATION</text>
      </svg>
    `);

    printWindow.document.write(`
      <html>
        <head>
          <title>Comprobante INTIMAX</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
            .logo { width: 180px; }
            .box { border: 1px solid #ddd; border-radius: 10px; padding: 16px; margin-top: 12px; }
            .row { display: flex; justify-content: space-between; margin: 8px 0; }
            .total { font-size: 18px; font-weight: 700; color: #000; }
            .small { font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h2 style="margin: 0; color: #E8BA6F;">INTIMAX</h2>
              <div class="small">Comprobante de consumo</div>
            </div>
            <img class="logo" src="data:image/svg+xml;charset=utf-8,${logoSvg}" alt="INTIMAX logo" />
          </div>
          <div class="box">
            <div class="row"><strong>Habitación:</strong><span>${receiptData.roomNumber}</span></div>
            <div class="row"><strong>Tipo:</strong><span>${receiptData.roomType || '---'}</span></div>
            <div class="row"><strong>Fecha:</strong><span>${receiptData.date}</span></div>
            <div class="row"><strong>Precio habitación:</strong><span>$${Number(receiptData.roomPrice || 0).toLocaleString()}</span></div>
            <div class="row"><strong>Producto:</strong><span>${receiptData.amenityName}</span></div>
            <div class="row"><strong>Precio producto:</strong><span>$${Number(receiptData.amenityPrice || 0).toLocaleString()}</span></div>
            <hr />
            <div class="row total"><span>Total:</span><span>$${Number(receiptData.total || 0).toLocaleString()}</span></div>
          </div>
          <p class="small">Gracias por elegir INTIMAX.</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  if (loading) {
    return <div className="loading">Cargando amenities...</div>;
  }

  return (
    <div className="amenity-manager">
      <div className="amenity-header">
        <h2>🎁 AMENITIES</h2>
        <div className="header-actions">
          {room && (
            <div className="room-summary">
              <span>Hab. {room.room_number}</span>
              <span>Total actual: ${Number(room.shift_price ?? room.base_price ?? 0).toLocaleString()}</span>
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="low-stock-warning">
              ⚠️ {lowStock.length} producto(s) con bajo stock
            </div>
          )}
          {isAdmin && (
            <button
              className="btn-add-amenity"
              onClick={() => {
                setEditingAmenity(null);
                setFormData({
                  name: '',
                  description: '',
                  price: '',
                  stock: '',
                  min_stock_alert: '5',
                  category: 'otros'
                });
                setShowForm(true);
              }}
            >
              + Agregar
            </button>
          )}
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>
      </div>

      {roomConsumption.length > 0 && (
        <div className="room-consumption-box">
          <strong>Consumidos en esta habitación:</strong>
          <ul>
            {roomConsumption.map((item) => (
              <li key={item.id}>
                <span>{item.name} × {item.quantity} — ${Number(item.price_at_time * item.quantity).toLocaleString()}</span>
                <button className="btn-remove-consumption" onClick={() => handleRemoveFromRoom(item)}>
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="amenity-grid">
        {amenities.map((amenity) => (
          <div key={amenity.id} className={`amenity-card ${amenity.stock <= amenity.min_stock_alert ? 'low-stock' : ''}`}>
            <div className="amenity-icon">{getCategoryEmoji(amenity.category)}</div>
            <div className="amenity-info">
              <div className="amenity-name">{amenity.name}</div>
              <div className="amenity-category">{getCategoryName(amenity.category)}</div>
              <div className="amenity-price">${Number(amenity.price || 0).toLocaleString()}</div>
              <div className={`amenity-stock ${amenity.stock <= amenity.min_stock_alert ? 'alert' : ''}`}>
                Stock: {amenity.stock} {amenity.stock <= amenity.min_stock_alert && '⚠️'}
              </div>
              {amenity.description && (
                <div className="amenity-description">{amenity.description}</div>
              )}
            </div>
            <div className="amenity-actions">
              <button
                onClick={() => handleAddToRoom(amenity)}
                className="btn-add-to-room"
                disabled={isAdding || !room?.shift_id}
              >
                {isAdding ? 'Agregando...' : 'Agregar'}
              </button>
              {isAdmin && (
                <>
                  <button onClick={() => handleEdit(amenity)} className="btn-edit">✏️</button>
                  <button onClick={() => handleDelete(amenity.id)} className="btn-delete">🗑️</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && isAdmin && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingAmenity ? 'Editar' : 'Nuevo'} Amenity</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Precio *</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Stock *</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                    min="0"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Alerta de stock mínimo</label>
                  <input
                    type="number"
                    value={formData.min_stock_alert}
                    onChange={(e) => setFormData({ ...formData, min_stock_alert: e.target.value })}
                    min="1"
                  />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="bebidas">Bebidas</option>
                    <option value="comidas">Comidas</option>
                    <option value="higiene">Higiene</option>
                    <option value="entretenimiento">Entretenimiento</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingAmenity ? 'Actualizar' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .amenity-manager {
          background: rgba(0, 0, 0, 0.9);
          border-radius: 15px;
          padding: 20px;
          max-height: 80vh;
          overflow-y: auto;
          width: 100%;
          max-width: 1000px;
        }

        .amenity-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .amenity-header h2 {
          color: #fff;
          margin: 0;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
        }

        .room-summary {
          display: flex;
          gap: 10px;
          align-items: center;
          color: #fff;
          font-size: 13px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(232, 186, 111, 0.2);
          border-radius: 999px;
          padding: 8px 12px;
        }

        .room-consumption-box {
          background: rgba(232, 186, 111, 0.12);
          border: 1px solid rgba(232, 186, 111, 0.25);
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 14px;
          color: #f6e7bf;
        }

        .room-consumption-box ul {
          margin: 8px 0 0 18px;
          padding: 0;
        }

        .low-stock-warning {
          background: #ffc107;
          color: #000;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          font-size: 14px;
        }

        .btn-add-amenity {
          background: #00ff88;
          color: #000;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }

        .btn-close {
          background: #e94560;
          color: #fff;
          border: none;
          padding: 8px 15px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 18px;
        }

        .amenity-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 15px;
        }

        .amenity-card {
          background: rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 15px;
          transition: all 0.3s;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .amenity-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        }

        .amenity-card.low-stock {
          border-left: 4px solid #ffc107;
        }

        .amenity-icon {
          font-size: 32px;
          background: rgba(255, 255, 255, 0.1);
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }

        .amenity-info {
          flex: 1;
        }

        .amenity-name {
          color: #fff;
          font-weight: bold;
          font-size: 16px;
        }

        .amenity-category {
          color: #aaa;
          font-size: 12px;
        }

        .amenity-price {
          color: #00ff88;
          font-weight: bold;
          font-size: 14px;
          margin-top: 5px;
        }

        .amenity-stock {
          color: #aaa;
          font-size: 12px;
        }

        .amenity-stock.alert {
          color: #ffc107;
          font-weight: bold;
        }

        .amenity-description {
          color: #888;
          font-size: 11px;
          margin-top: 5px;
        }

        .amenity-actions {
          display: flex;
          gap: 8px;
        }

        .btn-edit, .btn-delete, .btn-add-to-room {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          padding: 5px 10px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-add-to-room {
          background: #00ff88;
          color: #000;
          font-weight: bold;
        }

        .btn-add-to-room:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-edit:hover { background: #17a2b8; }
        .btn-delete:hover { background: #e94560; }

        .form-group {
          margin-bottom: 12px;
        }

        .form-group label {
          display: block;
          color: #aaa;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .form-group input, .form-group textarea, .form-group select {
          width: 100%;
          padding: 10px;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          color: #fff;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 15px;
        }

        .btn-submit {
          background: #00ff88;
          color: #000;
          border: none;
          padding: 10px 25px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
        }

        .btn-cancel {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          border: none;
          padding: 10px 25px;
          border-radius: 8px;
          cursor: pointer;
        }

        .loading {
          color: #fff;
          text-align: center;
          padding: 40px;
        }

        @media (max-width: 768px) {
          .amenity-grid {
            grid-template-columns: 1fr;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
          .amenity-header {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}

export default AmenityManager;