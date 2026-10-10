import React, { useState, useEffect } from 'react';

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../services/api';

import {
  confirmAction,
  showAlert,
  showToast
} from '../services/alerts';

import { useLanguage } from '../contexts/LanguageContext';


function UsersPanel() {

  const { language, translations: t } = useLanguage();

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
    shift: 'mañana',
    role: 'receptionist'
  });


  const tx = (esText, enText) => {
    return language === 'en' ? enText : esText;
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


  const closeModal = () => {

    setShowModal(false);
    resetForm();

  };


  const loadUsers = async () => {

    try {

      const data = await getUsers();

      setUsers(
        Array.isArray(data)
          ? data
          : data.users || []
      );

    } catch (error) {

      console.error(
        'Error loading users:',
        error
      );

      showAlert(
        t.users.loadError,
        'error'
      );

    }

  };


  const handleSubmit = async (e) => {

    e.preventDefault();

    const wasEditing = Boolean(editingUser);

    try {

      if (editingUser) {

        await updateUser(
          editingUser.id,
          {
            ...formData,
            is_active: 1
          }
        );

      } else {

        if (!formData.password) {

          showAlert(
            t.users.requiredPassword,
            'warning'
          );

          return;
        }

        await createUser(formData);

      }


      setShowModal(false);

      resetForm();

      await loadUsers();


      showToast(
        wasEditing
          ? tx(
            'Usuario actualizado correctamente',
            'User updated successfully'
          )
          : tx(
            'Usuario creado correctamente',
            'User created successfully'
          )
      );

    } catch (error) {

      showAlert(
        `${t.users.saveError}: ${error.response?.data?.message ||
        error.message
        }`,
        'error'
      );

    }

  };


  const handleDelete = async (user) => {

    const confirmed = await confirmAction(
      `${tx(
        '¿Eliminar a',
        'Delete'
      )} ${user.first_name} ${user.last_name}?`,
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

      await loadUsers();

      showToast(
        tx(
          'Usuario eliminado correctamente',
          'User deleted successfully'
        )
      );

    } catch (error) {

      showAlert(
        `${t.users.deleteError}: ${error.response?.data?.message ||
        error.message
        }`,
        'error'
      );

    }

  };


  const handleEdit = (user) => {

    setEditingUser(user);

    setFormData({
      username: user.username || '',
      password: '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      dni: user.dni || '',
      phone: user.phone || '',
      address: user.address || '',
      shift: user.shift || 'mañana',
      role: user.role || 'receptionist'
    });

    setShowModal(true);

  };


  const openNewUserModal = () => {

    resetForm();
    setShowModal(true);

  };


  const getShiftLabel = (shift) => {

    if (shift === 'mañana') {
      return `🌅 ${t.users.morning}`;
    }

    if (shift === 'tarde') {
      return `☀️ ${t.users.afternoon}`;
    }

    return `🌙 ${t.users.night}`;

  };


  return (

    <div className="admin-panel users-panel">

      {/* ENCABEZADO */}

      <div className="panel-header">

        <h2>
          👥 {tx(
            'GESTIÓN DE RECEPCIONISTAS',
            'RECEPTIONIST MANAGEMENT'
          )}
        </h2>


        <button
          type="button"
          className="btn-primary"
          onClick={openNewUserModal}
        >
          + {tx(
            'NUEVO RECEPCIONISTA',
            'NEW RECEPTIONIST'
          )}
        </button>

      </div>


      {/* TABLA */}

      <div className="users-table-container">

        <table className="users-table">

          <thead>

            <tr>

              <th>
                {tx(
                  'Nombre Completo',
                  'Full Name'
                )}
              </th>

              <th>
                DNI
              </th>

              <th>
                {t.users.phone}
              </th>

              <th>
                {t.users.address}
              </th>

              <th>
                {t.users.shift}
              </th>

              <th>
                {tx(
                  'Estado',
                  'Status'
                )}
              </th>

              <th>
                {tx(
                  'Acciones',
                  'Actions'
                )}
              </th>

            </tr>

          </thead>


          <tbody>

            {users.length === 0 ? (

              <tr>

                <td
                  colSpan="7"
                  style={{
                    textAlign: 'center'
                  }}
                >
                  {t.users.noUsers}
                </td>

              </tr>

            ) : (

              users.map((user) => (

                <tr key={user.id}>

                  <td>
                    {user.first_name}{' '}
                    {user.last_name}
                  </td>


                  <td>
                    {user.dni || '—'}
                  </td>


                  <td>
                    {user.phone || '—'}
                  </td>


                  <td>
                    {user.address || '—'}
                  </td>


                  <td>

                    <span
                      className={`shift-badge ${user.shift}`}
                    >
                      {getShiftLabel(
                        user.shift
                      )}
                    </span>

                  </td>


                  <td>

                    <span
                      className={`status-badge ${user.is_active
                          ? 'active'
                          : 'inactive'
                        }`}
                    >
                      {user.is_active
                        ? tx(
                          'Activo',
                          'Active'
                        )
                        : tx(
                          'Inactivo',
                          'Inactive'
                        )}
                    </span>

                  </td>


                  <td className="actions">

                    <button
                      type="button"
                      className="btn-edit"
                      onClick={() =>
                        handleEdit(user)
                      }
                      title={t.common.edit}
                    >
                      ✏️
                    </button>


                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() =>
                        handleDelete(user)
                      }
                      title={t.common.delete}
                    >
                      🗑️
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>


      {/* MODAL CREAR / EDITAR */}

      {showModal && (

        <div
          className="modal-overlay"
          onClick={closeModal}
        >

          <div
            className="modal-content user-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <h2>

              {editingUser
                ? tx(
                  'EDITAR RECEPCIONISTA',
                  'EDIT RECEPTIONIST'
                )
                : tx(
                  'NUEVO RECEPCIONISTA',
                  'NEW RECEPTIONIST'
                )}

            </h2>


            <form onSubmit={handleSubmit}>

              {/* USUARIO / CONTRASEÑA */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    {t.users.user}*
                  </label>

                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        username: e.target.value
                      })
                    }
                    required
                    disabled={Boolean(editingUser)}
                  />

                </div>


                {!editingUser && (

                  <div className="form-group">

                    <label>
                      {t.users.password}*
                    </label>

                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password: e.target.value
                        })
                      }
                      required
                    />

                  </div>

                )}

              </div>


              {/* NOMBRE / APELLIDO */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    {t.users.firstName}*
                  </label>

                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        first_name: e.target.value
                      })
                    }
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    {t.users.lastName}*
                  </label>

                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        last_name: e.target.value
                      })
                    }
                    required
                  />

                </div>

              </div>


              {/* DNI / TELÉFONO */}

              <div className="form-row">

                <div className="form-group">

                  <label>
                    DNI*
                  </label>

                  <input
                    type="text"
                    value={formData.dni}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dni: e.target.value
                      })
                    }
                    required
                  />

                </div>


                <div className="form-group">

                  <label>
                    {t.users.phone}*
                  </label>

                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone: e.target.value
                      })
                    }
                    required
                  />

                </div>

              </div>


              {/* DIRECCIÓN */}

              <div className="form-group">

                <label>
                  {t.users.address}*
                </label>

                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: e.target.value
                    })
                  }
                  required
                />

              </div>


              {/* TURNO */}

              <div className="form-group">

                <label>
                  {t.users.shift}*
                </label>

                <select
                  value={formData.shift}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shift: e.target.value
                    })
                  }
                >

                  <option value="mañana">
                    🌅 {t.users.morning}
                    {' '}
                    (06:00 - 14:00)
                  </option>

                  <option value="tarde">
                    ☀️ {t.users.afternoon}
                    {' '}
                    (14:00 - 22:00)
                  </option>

                  <option value="noche">
                    🌙 {t.users.night}
                    {' '}
                    (22:00 - 06:00)
                  </option>

                </select>

              </div>


              {/* BOTONES */}

              <div className="modal-actions">

                <button
                  type="submit"
                  className="btn-confirm"
                >
                  {editingUser
                    ? tx(
                      'ACTUALIZAR',
                      'UPDATE'
                    )
                    : tx(
                      'CREAR USUARIO',
                      'CREATE USER'
                    )}
                </button>


                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                >
                  {t.users.cancel}
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