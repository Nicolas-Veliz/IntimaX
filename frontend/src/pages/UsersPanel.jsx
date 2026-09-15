import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../services/api';

function UsersPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
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
    loadUsers();
  }, []);

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
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
      setLoading(true);
      setError('');
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : data.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
      setError('No se pudieron cargar los usuarios desde la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id, { ...formData, is_active: 1 });
      } else {
        if (!formData.password) {
          alert('La contraseña es obligatoria para crear un usuario.');
          return;
        }
        await createUser(formData);
      }

      await loadUsers();
      resetForm();
    } catch (error) {
      alert('Error al guardar usuario: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`¿Eliminar a ${user.first_name} ${user.last_name}?`)) {
      try {
        await deleteUser(user.id);
        if (editingUser?.id === user.id) {
          resetForm();
        }
        await loadUsers();
      } catch (error) {
        alert('Error al eliminar usuario: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
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

  return (
    <div className="admin-panel users-panel">
      <div className="manage-users-page">
        <div className="manage-users-container">
          <div className="manage-users-header">
            <h2>⚙️ MANAGEMENT PANEL: USERS / STAFF</h2>
            <button type="button" onClick={() => window.history.back()} className="refresh-btn">
              ⬅️ RETURN TO PANEL
            </button>
          </div>

          <div className="abm-layout">
            <div className="abm-form-section">
              <h3>{editingUser ? 'Edit Staff' : 'Register / Modify Staff'}</h3>
              <form onSubmit={handleSubmit} className="abm-form">
                <div className="form-group">
                  <label>USER</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
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
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Ingrese una contraseña"
                      required
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>NAME/S</label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    placeholder="Ej: JUAN"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>LAST NAME</label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    placeholder="Ej: PÉREZ"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>SHIFT</label>
                  <select name="shift" value={formData.shift} onChange={handleInputChange} required>
                    <option value="mañana">Mañana (06:00 - 14:00)</option>
                    <option value="tarde">Tarde (14:00 - 22:00)</option>
                    <option value="noche">Noche (22:00 - 06:00)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>DNI</label>
                  <input
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                    placeholder="Ej: XX.XX.XX"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>PHONE</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Ej: 1122334455"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>ADDRESS</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ej: SAN JUAN 350"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>ROLE</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} required>
                    <option value="receptionist">Receptionist</option>
                    <option value="supervisor">Supervisor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-actions-abm-vertical">
                  <button type="submit" className="btn-confirm-abm">
                    {editingUser ? 'SAVE' : 'CREATE'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-modify-abm">
                    {editingUser ? 'CANCEL' : 'CLEAR'}
                  </button>
                  {editingUser && (
                    <button type="button" onClick={() => handleDelete(editingUser)} className="btn-free">
                      DELETE
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="abm-table-section">
              <h3>List of Registered Users</h3>
              {loading ? (
                <p className="table-hint-text">Cargando usuarios...</p>
              ) : error ? (
                <p className="table-hint-text">{error}</p>
              ) : (
                <div className="table-responsive-abm">
                  <table className="abm-table users-custom-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Last Name</th>
                        <th>Shift</th>
                        <th>DNI</th>
                        <th>Permit (Role)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="table-hint-text">No hay usuarios registrados.</td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr
                            key={user.id}
                            className="table-row-selectable"
                            onClick={() => handleEdit(user)}
                          >
                            <td className="table-room-num">{user.first_name || '—'}</td>
                            <td>{user.last_name || '—'}</td>
                            <td className="table-subtext">{user.shift || '—'}</td>
                            <td className="table-index">{user.dni || '—'}</td>
                            <td>
                              <span className={`badge-type ${user.role === 'admin' ? 'suite' : 'simple'}`}>
                                {user.role === 'admin' ? 'Admin.' : 'Usuario'}
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
    </div>
  );
}

export default UsersPanel;