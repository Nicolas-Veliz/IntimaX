import React, { useState, useEffect } from 'react';

import { getUsers, createUser, updateUser, deleteUser } from '../services/api';

import { confirmAction, showAlert, showToast } from '../services/alerts';

import { useLanguage } from '../contexts/LanguageContext';

function UsersPanel() {

  const { translations: t, language } = useLanguage();

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

  const tx = (esText, enText) => {

    return language === 'en' ? enText : esText;

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

      setError(t.users.loadError);

    } finally {

      setLoading(false);

    }

  };

  const handleInputChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({

      ...prev,

      [name]: value

    }));

  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const wasEditing = Boolean(editingUser);

    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          ...formData,
          is_active: 1
        });
      } else {
        if (!formData.password) {
          showAlert(t.users.requiredPassword, 'warning');
          return;
        }

        await createUser(formData);
      }

      await loadUsers();
      resetForm();

      showToast(
        wasEditing
          ? tx('Usuario actualizado correctamente', 'User updated successfully')
          : tx('Usuario creado correctamente', 'User created successfully')
      );
    } catch (error) {
      showAlert(
        `${t.users.saveError}: ${
          error.response?.data?.message || error.message
        }`,
        'error'
      );
    }
  };

  const handleDelete = async (user) => {
    const confirmed = await confirmAction(
      `${tx('¿Eliminar a', 'Delete')} ${user.first_name} ${user.last_name}?`,
      {
        title: t.users.deleteUser,
        confirmButtonText: t.users.yesDelete
      }
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteUser(user.id);

      if (editingUser?.id === user.id) {
        resetForm();
      }

      await loadUsers();

      showToast(
        tx('Usuario eliminado correctamente', 'User deleted successfully')
      );
    } catch (error) {
      showAlert(
        `${t.users.deleteError}: ${
          error.response?.data?.message || error.message
        }`,
        'error'
      );
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

            <h2>

              ⚙️ {t.users.managementPanel}

            </h2>

            <button

              type="button"

              onClick={() => window.history.back()}

              className="refresh-btn"

            >

              ⬅️ {t.users.backToPanel}

            </button>

          </div>

          <div className="abm-layout">

            <div className="abm-form-section">

              <h3>

                {editingUser

                  ? t.users.editStaff

                  : t.users.registerStaff}

              </h3>

              <form

                onSubmit={handleSubmit}

                className="abm-form"

              >

                <div className="form-group">

                  <label>

                    {t.users.user}

                  </label>

                  <input

                    type="text"

                    name="username"

                    value={formData.username}

                    onChange={handleInputChange}

                    placeholder={t.users.usernamePlaceholder}

                    required

                    disabled={Boolean(editingUser)}

                  />

                </div>

                {!editingUser && (

                  <div className="form-group">

                    <label>

                      {t.users.password}

                    </label>

                    <input

                      type="password"

                      name="password"

                      value={formData.password}

                      onChange={handleInputChange}

                      placeholder={t.users.passwordPlaceholder}

                      required

                    />

                  </div>

                )}

                <div className="form-group">

                  <label>

                    {t.users.firstName}

                  </label>

                  <input

                    type="text"

                    name="first_name"

                    value={formData.first_name}

                    onChange={handleInputChange}

                    placeholder={t.users.firstNamePlaceholder}

                    required

                  />

                </div>

                <div className="form-group">

                  <label>

                    {t.users.lastName}

                  </label>

                  <input

                    type="text"

                    name="last_name"

                    value={formData.last_name}

                    onChange={handleInputChange}

                    placeholder={t.users.lastNamePlaceholder}

                    required

                  />

                </div>

                <div className="form-group">

                  <label>

                    {t.users.shift}

                  </label>

                  <select

                    name="shift"

                    value={formData.shift}

                    onChange={handleInputChange}

                    required

                  >

                    <option value="mañana">

                      {t.users.morning} (06:00 - 14:00)

                    </option>

                    <option value="tarde">

                      {t.users.afternoon} (14:00 - 22:00)

                    </option>

                    <option value="noche">

                      {t.users.night} (22:00 - 06:00)

                    </option>

                  </select>

                </div>

                <div className="form-group">

                  <label>

                    DNI

                  </label>

                  <input

                    type="text"

                    name="dni"

                    value={formData.dni}

                    onChange={handleInputChange}

                    placeholder={t.users.dniPlaceholder}

                    required

                  />

                </div>

                <div className="form-group">

                  <label>

                    {t.users.phone}

                  </label>

                  <input

                    type="text"

                    name="phone"

                    value={formData.phone}

                    onChange={handleInputChange}

                    placeholder={t.users.phonePlaceholder}

                    required

                  />

                </div>

                <div className="form-group">

                  <label>

                    {t.users.address}

                  </label>

                  <input

                    type="text"

                    name="address"

                    value={formData.address}

                    onChange={handleInputChange}

                    placeholder={t.users.addressPlaceholder}

                    required

                  />

                </div>

                <div className="form-group">

                  <label>

                    {t.users.role}

                  </label>

                  <select

                    name="role"

                    value={formData.role}

                    onChange={handleInputChange}

                    required

                  >

                    <option value="receptionist">

                      {t.users.receptionist}

                    </option>

                    <option value="supervisor">

                      {t.users.supervisor}

                    </option>

                    <option value="admin">

                      {t.users.admin}

                    </option>

                  </select>

                </div>

                <div className="form-actions-abm-vertical">

                  <button

                    type="submit"

                    className="btn-confirm-abm"

                  >

                    {editingUser

                      ? t.users.save

                      : t.users.create}

                  </button>

                  <button

                    type="button"

                    onClick={resetForm}

                    className="btn-modify-abm"

                  >

                    {editingUser

                      ? t.users.cancel

                      : t.users.clear}

                  </button>

                  {editingUser && (

                    <button

                      type="button"

                      onClick={() => handleDelete(editingUser)}

                      className="btn-free"

                    >

                      {t.users.delete}

                    </button>

                  )}

                </div>

              </form>

            </div>

            <div className="abm-table-section">

              <h3>

                {t.users.registeredUsers}

              </h3>

              {loading ? (

                <p className="table-hint-text">

                  {t.users.loadingUsers}

                </p>

              ) : error ? (

                <p className="table-hint-text">

                  {error}

                </p>

              ) : (

                <div className="table-responsive-abm">

                  <table className="abm-table users-custom-table">

                    <thead>

                      <tr>

                        <th>

                          {t.users.name}

                        </th>

                        <th>

                          {t.users.lastNameTable}

                        </th>

                        <th>

                          {t.users.shiftTable}

                        </th>

                        <th>

                          DNI

                        </th>

                        <th>

                          {t.users.permitRole}

                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {users.length === 0 ? (

                        <tr>

                          <td

                            colSpan="5"

                            className="table-hint-text"

                          >

                            {t.users.noUsers}

                          </td>

                        </tr>

                      ) : (

                        users.map((user) => (

                          <tr

                            key={user.id}

                            className="table-row-selectable"

                            onClick={() => handleEdit(user)}

                          >

                            <td className="table-room-num">

                              {user.first_name || '—'}

                            </td>

                            <td>

                              {user.last_name || '—'}

                            </td>

                            <td className="table-subtext">

                              {getShiftLabel(user.shift)}

                            </td>

                            <td className="table-index">

                              {user.dni || '—'}

                            </td>

                            <td>

                              <span

                                className={`badge-type ${

                                  user.role === 'admin'

                                    ? 'suite'

                                    : 'simple'

                                }`}

                              >

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

              <p className="table-hint-text">

                {t.users.tableHint}

              </p>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

export default UsersPanel;
