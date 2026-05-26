import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';

function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    dni: '',
    phone: '',
    address: '',
    shift: 'mañana'
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id, formData);
      } else {
        await createUser(formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({
        username: '', password: '', first_name: '', last_name: '',
        dni: '', phone: '', address: '', shift: 'mañana'
      });
      loadUsers();
    } catch (error) {
      alert('Error al guardar usuario: ' + error.response?.data?.message);
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`¿Eliminar a ${user.first_name} ${user.last_name}?`)) {
      try {
        await deleteUser(user.id);
        loadUsers();
      } catch (error) {
        alert('Error al eliminar usuario');
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: '',
      first_name: user.first_name,
      last_name: user.last_name,
      dni: user.dni,
      phone: user.phone,
      address: user.address,
      shift: user.shift
    });
    setShowModal(true);
  };

  return (
    <div className="admin-panel users-panel">
      <div className="panel-header">
        <h2>👥 GESTIÓN DE RECEPCIONISTAS</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + NUEVO RECEPCIONISTA
        </button>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>DNI</th>
              <th>Teléfono</th>
              <th>Dirección</th>
              <th>Turno</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.first_name} {user.last_name}</td>
                <td>{user.dni}</td>
                <td>{user.phone}</td>
                <td>{user.address}</td>
                <td>
                  <span className={`shift-badge ${user.shift}`}>
                    {user.shift === 'mañana' ? '🌅 Mañana' : 
                     user.shift === 'tarde' ? '☀️ Tarde' : '🌙 Noche'}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                    {user.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="actions">
                  <button className="btn-edit" onClick={() => handleEdit(user)}>✏️</button>
                  <button className="btn-delete" onClick={() => handleDelete(user)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content user-modal" onClick={e => e.stopPropagation()}>
            <h2>{editingUser ? 'EDITAR RECEPCIONISTA' : 'NUEVO RECEPCIONISTA'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Usuario*</label>
                  <input type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required disabled={editingUser} />
                </div>
                {!editingUser && (
                  <div className="form-group">
                    <label>Contraseña*</label>
                    <input type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                  </div>
                )}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre*</label>
                  <input type="text" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Apellido*</label>
                  <input type="text" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>DNI*</label>
                  <input type="text" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Teléfono*</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                </div>
              </div>
              
              <div className="form-group">
                <label>Dirección*</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
              </div>
              
              <div className="form-group">
                <label>Turno*</label>
                <select value={formData.shift} onChange={e => setFormData({...formData, shift: e.target.value})}>
                  <option value="mañana">🌅 Mañana (06:00 - 14:00)</option>
                  <option value="tarde">☀️ Tarde (14:00 - 22:00)</option>
                  <option value="noche">🌙 Noche (22:00 - 06:00)</option>
                </select>
              </div>
              
              <div className="modal-actions">
                <button type="submit" className="btn-confirm">
                  {editingUser ? 'ACTUALIZAR' : 'CREAR USUARIO'}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  CANCELAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPanel;