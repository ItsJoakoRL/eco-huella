import React, { useEffect, useState } from "react";
import { usersAPI } from "../../services/api";

const roleLabels = {
  admin: "Administrador",
  user: "Usuario",
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "user",
    age: "",
    city: "",
    province: "",
    country: "Argentina",
    occupation: "",
    householdSize: "1",
    sustainabilityGoal: "",
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll();
      setUsers(response.data.users || []);
      setError("");
    } catch (err) {
      setError("No se pudieron cargar los usuarios.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await usersAPI.update(editingId, {
          ...formData,
          age: formData.age ? Number(formData.age) : undefined,
          householdSize: formData.householdSize
            ? Number(formData.householdSize)
            : undefined,
        });
      }
      resetForm();
      loadUsers();
    } catch (err) {
      setError("No se pudo guardar el usuario.");
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Seguro que quieres eliminar este usuario?")) return;

    try {
      await usersAPI.delete(id);
      loadUsers();
    } catch (err) {
      setError("No se pudo eliminar el usuario.");
      console.error(err);
    }
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      await usersAPI.changeRole(id, newRole);
      loadUsers();
    } catch (err) {
      setError("No se pudo cambiar el rol.");
      console.error(err);
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      age: user.age || "",
      city: user.city || "",
      province: user.province || "",
      country: user.country || "Argentina",
      occupation: user.occupation || "",
      householdSize: user.householdSize || "1",
      sustainabilityGoal: user.sustainabilityGoal || "",
    });
    setEditingId(user._id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "user",
      age: "",
      city: "",
      province: "",
      country: "Argentina",
      occupation: "",
      householdSize: "1",
      sustainabilityGoal: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="admin-section">
      <header className="admin-section-head">
        <div>
          <span className="admin-kicker">Gestion de cuentas</span>
          <h2>Usuarios</h2>
          <p>Controla accesos, permisos y datos visibles de cada cuenta.</p>
        </div>
        <span className="admin-count">{users.length} perfiles</span>
      </header>

      {error && <div className="admin-alert">{error}</div>}

      {showForm && (
        <form onSubmit={handleSubmit} className="admin-card admin-form animate-pop">
          <div className="admin-form-head">
            <span className="material-symbols-outlined">edit_square</span>
            <div>
              <h3>{editingId ? "Editar usuario" : "Nuevo usuario"}</h3>
              <p>Actualiza la informacion basica y el rol de acceso.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <label>
              Nombre
              <input
                type="text"
                value={formData.name}
                onChange={(event) =>
                  setFormData({ ...formData, name: event.target.value })
                }
                className="admin-input"
                required
              />
            </label>

            <label>
              Email
              <input
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData({ ...formData, email: event.target.value })
                }
                className="admin-input"
                required
              />
            </label>

            <label>
              Rol
              <select
                value={formData.role}
                onChange={(event) =>
                  setFormData({ ...formData, role: event.target.value })
                }
                className="admin-input"
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
            </label>

            <label>
              Edad
              <input
                type="number"
                min="13"
                max="120"
                value={formData.age}
                onChange={(event) =>
                  setFormData({ ...formData, age: event.target.value })
                }
                className="admin-input"
              />
            </label>

            <label>
              Ciudad
              <input
                type="text"
                value={formData.city}
                onChange={(event) =>
                  setFormData({ ...formData, city: event.target.value })
                }
                className="admin-input"
              />
            </label>

            <label>
              Provincia
              <input
                type="text"
                value={formData.province}
                onChange={(event) =>
                  setFormData({ ...formData, province: event.target.value })
                }
                className="admin-input"
              />
            </label>

            <label>
              Pais
              <input
                type="text"
                value={formData.country}
                onChange={(event) =>
                  setFormData({ ...formData, country: event.target.value })
                }
                className="admin-input"
              />
            </label>

            <label>
              Ocupacion
              <input
                type="text"
                value={formData.occupation}
                onChange={(event) =>
                  setFormData({ ...formData, occupation: event.target.value })
                }
                className="admin-input"
              />
            </label>

            <label>
              Personas en el hogar
              <input
                type="number"
                min="1"
                max="20"
                value={formData.householdSize}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    householdSize: event.target.value,
                  })
                }
                className="admin-input"
              />
            </label>

            <label>
              Objetivo ambiental
              <select
                value={formData.sustainabilityGoal}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    sustainabilityGoal: event.target.value,
                  })
                }
                className="admin-input"
              >
                <option value="">Sin definir</option>
                <option value="reduce_energy">Reducir energia</option>
                <option value="move_better">Movilidad sustentable</option>
                <option value="eat_better">Mejorar alimentacion</option>
                <option value="waste_less">Menos residuos</option>
                <option value="learn">Aprender y medir impacto</option>
              </select>
            </label>
          </div>

          <div className="admin-form-actions">
            <button type="submit" className="admin-primary-button">
              Guardar cambios
            </button>
            <button
              type="button"
              className="admin-secondary-button"
              onClick={resetForm}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="admin-card admin-table-card hover-lift">
        {loading ? (
          <div className="admin-loading">
            <span className="material-symbols-outlined animate-pulse-soft">
              progress_activity
            </span>
            Cargando usuarios...
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Datos personales</th>
                  <th>Rol</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr
                    key={user._id}
                    className="animate-rise"
                    style={{ animationDelay: `${index * 45}ms` }}
                  >
                    <td>
                      <div className="admin-user-cell">
                        <span className="admin-avatar">
                          {(user.name || "U").slice(0, 1).toUpperCase()}
                        </span>
                        <div>
                          <strong>{user.name}</strong>
                          <small>{roleLabels[user.role] || user.role}</small>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <div className="admin-user-details">
                        <span>
                          <span className="material-symbols-outlined">location_on</span>
                          {[user.city, user.province].filter(Boolean).join(", ") ||
                            "Ubicacion pendiente"}
                        </span>
                        <span>
                          <span className="material-symbols-outlined">cake</span>
                          {user.age ? `${user.age} anos` : "Edad pendiente"}
                        </span>
                        <span>
                          <span className="material-symbols-outlined">home</span>
                          {user.householdSize
                            ? `${user.householdSize} en el hogar`
                            : "Hogar pendiente"}
                        </span>
                        {user.occupation && (
                          <span>
                            <span className="material-symbols-outlined">work</span>
                            {user.occupation}
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <select
                        value={user.role}
                        onChange={(event) =>
                          handleChangeRole(user._id, event.target.value)
                        }
                        className={`admin-role-select ${user.role}`}
                      >
                        <option value="user">Usuario</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </td>
                    <td>
                      <div className="admin-actions">
                        <button
                          type="button"
                          className="admin-icon-button"
                          onClick={() => handleEdit(user)}
                          title="Editar usuario"
                        >
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button
                          type="button"
                          className="admin-icon-button danger"
                          onClick={() => handleDelete(user._id)}
                          title="Eliminar usuario"
                        >
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
