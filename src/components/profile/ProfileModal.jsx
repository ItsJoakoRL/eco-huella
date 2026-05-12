import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const initialProfileForm = {
  name: "",
  username: "",
  email: "",
  age: "",
  birthDate: "",
  sex: "",
  city: "",
  province: "",
  country: "Argentina",
  occupation: "",
  householdSize: "1",
  sustainabilityGoal: "",
  avatarUrl: "",
  avatarZoom: 1,
  avatarOffsetX: 0,
  avatarOffsetY: 0,
  password: "",
  confirmPassword: "",
};

const MAX_PROFILE_PHOTO_SIZE = 8 * 1024 * 1024;

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

export default function ProfileModal({ isOpen, onClose }) {
  const { user, updateProfile, loading } = useAuth();
  const [formData, setFormData] = useState(initialProfileForm);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || !isOpen) return;

    setFormData({
      name: user.name || "",
      username: user.username || "",
      email: user.email || "",
      age: user.age || "",
      birthDate: formatDateInput(user.birthDate),
      sex: user.sex || "",
      city: user.city || "",
      province: user.province || "",
      country: user.country || "Argentina",
      occupation: user.occupation || "",
      householdSize: user.householdSize || "1",
      sustainabilityGoal: user.sustainabilityGoal || "",
      avatarUrl: user.avatarUrl || "",
      avatarZoom: user.avatarZoom || 1,
      avatarOffsetX: user.avatarOffsetX || 0,
      avatarOffsetY: user.avatarOffsetY || 0,
      password: "",
      confirmPassword: "",
    });
    setShowPassword(false);
  }, [user, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setMessage("");
      setError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!message) return;

    const hideMessage = window.setTimeout(() => {
      setMessage("");
    }, 5000);

    return () => window.clearTimeout(hideMessage);
  }, [message]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Selecciona una imagen valida.");
      return;
    }

    if (file.size > MAX_PROFILE_PHOTO_SIZE) {
      setError("La foto no puede superar 8 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((current) => ({
        ...current,
        avatarUrl: reader.result,
        avatarZoom: 1,
        avatarOffsetX: 0,
        avatarOffsetY: 0,
      }));
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!/^[a-zA-Z0-9_]{3,24}$/.test(formData.username)) {
      setError("El nombre de usuario debe tener 3 a 24 caracteres y solo letras, numeros o guion bajo.");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    const calculatedAge = calculateAge(formData.birthDate);
    if (formData.birthDate && (calculatedAge < 0 || calculatedAge > 120)) {
      setError("Ingresa una fecha de nacimiento valida.");
      return;
    }

    try {
      const { confirmPassword, ...payload } = formData;
      await updateProfile({
        ...payload,
        age: payload.birthDate
          ? calculatedAge
          : payload.age
            ? Number(payload.age)
            : undefined,
        birthDate: payload.birthDate || undefined,
        sex: payload.sex,
        householdSize: payload.householdSize ? Number(payload.householdSize) : undefined,
        avatarZoom: Number(payload.avatarZoom) || 1,
        avatarOffsetX: Number(payload.avatarOffsetX) || 0,
        avatarOffsetY: Number(payload.avatarOffsetY) || 0,
        password: payload.password || undefined,
      });
      setMessage("Perfil actualizado correctamente.");
      updateField("password", "");
      updateField("confirmPassword", "");
    } catch (err) {
      setError(err.response?.data?.message || "No se pudo actualizar el perfil.");
    }
  };

  const displayInitials = (formData.name || user?.name || "EH")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const avatarStyle = {
    "--avatar-zoom": formData.avatarZoom,
    "--avatar-offset-x": `${formData.avatarOffsetX}%`,
    "--avatar-offset-y": `${formData.avatarOffsetY}%`,
  };

  return (
    <div className="profile-modal-backdrop" role="dialog" aria-modal="true" aria-label="Editar perfil">
      <form className="profile-modal animate-pop" onSubmit={handleSubmit}>
        <div className="profile-modal-head">
          <div className="profile-avatar-editor">
            <span className="profile-avatar-preview">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Foto de perfil" style={avatarStyle} />
              ) : (
                displayInitials
              )}
            </span>
            <label className="profile-photo-button">
              <span className="material-symbols-outlined">photo_camera</span>
              Cambiar foto
              <input type="file" accept="image/*" onChange={handleAvatarChange} />
            </label>
            {formData.avatarUrl && (
              <div className="profile-photo-controls">
                <label>
                  Zoom
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.05"
                    value={formData.avatarZoom}
                    onChange={(event) => updateField("avatarZoom", event.target.value)}
                  />
                </label>
                <label>
                  Horizontal
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={formData.avatarOffsetX}
                    onChange={(event) => updateField("avatarOffsetX", event.target.value)}
                  />
                </label>
                <label>
                  Vertical
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={formData.avatarOffsetY}
                    onChange={(event) => updateField("avatarOffsetY", event.target.value)}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="profile-title">
            <span className="dashboard-eyebrow">Mi perfil</span>
            <h2>Editar cuenta</h2>
            <p>Cambia tus datos, correo, contraseña y foto de perfil.</p>
          </div>

          <button type="button" className="profile-close-button" onClick={onClose} aria-label="Cerrar">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {message && (
          <div className="profile-toast success" role="status">
            <span className="material-symbols-outlined">check_circle</span>
            {message}
          </div>
        )}

        <div className="profile-modal-body">
          {error && <div className="profile-alert error">{error}</div>}

          <div className="profile-form-grid">
            <label>
              Nombre completo
              <input className="admin-input" value={formData.name} onChange={(event) => updateField("name", event.target.value)} required />
            </label>

            <label>
              Nombre de usuario
              <input className="admin-input" value={formData.username} onChange={(event) => updateField("username", event.target.value)} required />
            </label>

            <label>
              Gmail
              <input className="admin-input" type="email" value={formData.email} onChange={(event) => updateField("email", event.target.value)} required />
            </label>

            <label>
              Fecha de nacimiento
              <input className="admin-input" type="date" value={formData.birthDate} onChange={(event) => {
                const nextAge = calculateAge(event.target.value);
                setFormData((current) => ({
                  ...current,
                  birthDate: event.target.value,
                  age: nextAge || "",
                }));
              }} />
            </label>

            <label>
              Edad
              <input className="admin-input" type="number" min="0" max="120" value={formData.age} onChange={(event) => updateField("age", event.target.value)} disabled={Boolean(formData.birthDate)} />
            </label>

            <label>
              Sexo
              <select className="admin-input" value={formData.sex} onChange={(event) => updateField("sex", event.target.value)}>
                <option value="">Sin definir</option>
                <option value="female">Mujer</option>
                <option value="male">Hombre</option>
                <option value="prefer_not_say">Prefiero no decir</option>
              </select>
            </label>

            <label>
              Ciudad
              <input className="admin-input" value={formData.city} onChange={(event) => updateField("city", event.target.value)} />
            </label>

            <label>
              Provincia
              <input className="admin-input" value={formData.province} onChange={(event) => updateField("province", event.target.value)} />
            </label>

            <label>
              Pais
              <input className="admin-input" value={formData.country} onChange={(event) => updateField("country", event.target.value)} />
            </label>

            <label>
              Ocupacion
              <input className="admin-input" value={formData.occupation} onChange={(event) => updateField("occupation", event.target.value)} />
            </label>

            <label>
              Personas en el hogar
              <input className="admin-input" type="number" min="1" max="20" value={formData.householdSize} onChange={(event) => updateField("householdSize", event.target.value)} />
            </label>

            <label>
              Objetivo ambiental
              <select className="admin-input" value={formData.sustainabilityGoal} onChange={(event) => updateField("sustainabilityGoal", event.target.value)}>
                <option value="">Sin definir</option>
                <option value="reduce_energy">Reducir energia</option>
                <option value="move_better">Movilidad sustentable</option>
                <option value="eat_better">Mejorar alimentacion</option>
                <option value="waste_less">Menos residuos</option>
                <option value="learn">Aprender y medir impacto</option>
              </select>
            </label>

            <label>
              Nueva contraseña
              <span className="admin-password-input">
                <input
                  className="admin-input"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  placeholder="Dejar vacio para no cambiarla"
                  onChange={(event) => updateField("password", event.target.value)}
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <span className="material-symbols-outlined">{showPassword ? "visibility" : "visibility_off"}</span>
                </button>
              </span>
            </label>

            <label>
              Confirmar contraseña
              <span className="admin-password-input">
                <input
                  className="admin-input"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  placeholder="Repetir nueva contraseña"
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                />
                <button
                  type="button"
                  className="admin-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <span className="material-symbols-outlined">{showPassword ? "visibility" : "visibility_off"}</span>
                </button>
              </span>
            </label>
          </div>
        </div>

        <div className="profile-actions">
          <button type="button" className="admin-secondary-button" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className="admin-primary-button eco-glow-button" disabled={loading}>
            {loading ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
