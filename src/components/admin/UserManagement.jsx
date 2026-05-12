import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usersAPI } from "../../services/api";

const roleLabels = {
  admin: "Administrador",
  user: "Usuario",
};

const formatDateInput = (dateValue) => {
  if (!dateValue) return "";
  return new Date(dateValue).toISOString().slice(0, 10);
};

const calculateAge = (birthDate) => {
  if (!birthDate) return "";
  const today = new Date();
  const born = new Date(`${birthDate}T00:00:00`);
  let years = today.getFullYear() - born.getFullYear();
  const monthDiff = today.getMonth() - born.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < born.getDate())) {
    years -= 1;
  }
  return years;
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    role: "user",
    age: "",
    birthDate: "",
    sex: "",
    city: "",
    province: "",
    country: "Argentina",
    occupation: "",
    householdSize: "1",
    sustainabilityGoal: "",
    password: "",
    confirmPassword: "",
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
    const calculatedAge = calculateAge(formData.birthDate);

    if (formData.birthDate && (calculatedAge < 0 || calculatedAge > 120)) {
      setError("Ingresa una fecha de nacimiento valida.");
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      if (editingId) {
        const { confirmPassword, ...payload } = formData;
        await usersAPI.update(editingId, {
          ...payload,
          password: payload.password || undefined,
          age: payload.birthDate
            ? calculatedAge
            : formData.age
              ? Number(formData.age)
              : undefined,
          birthDate: payload.birthDate || undefined,
          householdSize: formData.householdSize
            ? Number(formData.householdSize)
            : undefined,
        });
      }
      resetForm();
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo guardar el usuario.");
      console.error(err);
    }
  };

  const requestDelete = (user) => {
    setPendingDeleteUser(user);
  };

  const cancelDelete = () => {
    setPendingDeleteUser(null);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteUser) return;
    try {
      await usersAPI.delete(pendingDeleteUser._id);
      setPendingDeleteUser(null);
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
      username: user.username || "",
      email: user.email || "",
      role: user.role || "user",
      age: user.age || "",
      birthDate: formatDateInput(user.birthDate),
      sex: user.sex || "",
      city: user.city || "",
      province: user.province || "",
      country: user.country || "Argentina",
      occupation: user.occupation || "",
      householdSize: user.householdSize || "1",
      sustainabilityGoal: user.sustainabilityGoal || "",
      password: "",
      confirmPassword: "",
    });
    setEditingId(user._id);
    setShowPassword(false);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      email: "",
      role: "user",
      age: "",
      birthDate: "",
      sex: "",
      city: "",
      province: "",
      country: "Argentina",
      occupation: "",
      householdSize: "1",
      sustainabilityGoal: "",
      password: "",
      confirmPassword: "",
    });
    setEditingId(null);
    setShowPassword(false);
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
              Nombre de usuario
              <input
                type="text"
                value={formData.username}
                onChange={(event) =>
                  setFormData({ ...formData, username: event.target.value })
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
              Fecha de nacimiento
              <input
                type="date"
                value={formData.birthDate}
                onChange={(event) => {
                  const nextAge = calculateAge(event.target.value);
                  setFormData({
                    ...formData,
                    birthDate: event.target.value,
                    age: nextAge || "",
                  });
                }}
                className="admin-input"
              />
            </label>

            <label>
              Edad
              <input
                type="number"
                min="0"
                max="120"
                value={formData.age}
                onChange={(event) =>
                  setFormData({ ...formData, age: event.target.value })
                }
                className="admin-input"
                disabled={Boolean(formData.birthDate)}
              />
            </label>

            <label>
              Sexo
              <select
                value={formData.sex}
                onChange={(event) =>
                  setFormData({ ...formData, sex: event.target.value })
                }
                className="admin-input"
              >
                <option value="">Sin definir</option>
                <option value="female">Mujer</option>
                <option value="male">Hombre</option>
                <option value="prefer_not_say">Prefiero no decir</option>
              </select>
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
              ¿Qué quiere mejorar?
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
                <option value="learn">Aprender sobre mi impacto</option>
                <option value="save_water">Cuidar el agua</option>
                <option value="reduce_energy">Ahorrar energia</option>
                <option value="eat_better">Mejorar mis habitos de alimentacion</option>
                <option value="waste_less">Generar menos residuos</option>
                <option value="move_better">Moverme de forma mas sustentable</option>
              </select>
            </label>

            <label>
              Nueva contraseña
              <span className="admin-password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(event) =>
                    setFormData({ ...formData, password: event.target.value })
                  }
                  className="admin-input"
                  placeholder="Dejar vacio para no cambiarla"
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </span>
            </label>

            <label>
              Confirmar contraseña
              <span className="admin-password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      confirmPassword: event.target.value,
                    })
                  }
                  className="admin-input"
                  placeholder="Repetir nueva contraseña"
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </span>
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
                          <small>
                            @{user.username || "sin_usuario"} -{" "}
                            {roleLabels[user.role] || user.role}
                          </small>
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
                          {user.age ? `${user.age} años` : "Edad pendiente"}
                        </span>
                        <span>
                          <span className="material-symbols-outlined">wc</span>
                          {user.sex === "female"
                            ? "Mujer"
                            : user.sex === "male"
                              ? "Hombre"
                              : "Sexo pendiente"}
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
                          onClick={() => requestDelete(user)}
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

      {pendingDeleteUser && createPortal(
        <div
          className="confirm-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Eliminar correo"
        >
          <div className="confirm-modal animate-pop">
            <span className="confirm-modal-icon material-symbols-outlined">delete</span>
            <h2>Seguro que quieres eliminar este correo?</h2>
            <p>
              Se eliminara la cuenta asociada a <strong>{pendingDeleteUser.email}</strong>.
              Esta accion no se puede deshacer.
            </p>
            <div className="confirm-modal-actions">
              <button type="button" className="admin-secondary-button" onClick={cancelDelete}>
                Cancelar
              </button>
              <button type="button" className="admin-primary-button danger" onClick={confirmDelete}>
                Eliminar
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserManagement;
