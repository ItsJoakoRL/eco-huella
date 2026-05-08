import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../ui/Button";
import ecoHuellaLogo from "../../assets/eco-huella-logo-generated.png";

const inputClasses = "signup-input";

const fieldLabels = {
  name: "Nombre completo",
  username: "Nombre de usuario",
  email: "Correo electronico",
  age: "Edad",
  birthDate: "Fecha de nacimiento",
  sex: "Sexo",
  city: "Ciudad",
  province: "Provincia",
  country: "Pais",
  occupation: "Ocupacion",
  householdSize: "Personas en el hogar",
  sustainabilityGoal: "Objetivo ambiental",
  password: "Contraseña",
  confirmPassword: "Confirmar contraseña",
};

const SignupPage = () => {
  const [formData, setFormData] = useState({
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
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,24}$/.test(formData.username)) {
      setError(
        "El nombre de usuario debe tener entre 3 y 24 caracteres y solo puede usar letras, numeros o guion bajo"
      );
      return;
    }

    const calculatedAge = calculateAge(formData.birthDate);
    if (!formData.birthDate || calculatedAge < 13) {
      setError("Debes ingresar una fecha de nacimiento valida y tener al menos 13 anos");
      return;
    }

    setIsLoading(true);

    try {
      await signup(formData.name, formData.email, formData.password, {
        username: formData.username,
        age: calculatedAge,
        birthDate: formData.birthDate,
        sex: formData.sex,
        city: formData.city,
        province: formData.province,
        country: formData.country,
        occupation: formData.occupation,
        householdSize: formData.householdSize
          ? Number(formData.householdSize)
          : undefined,
        sustainabilityGoal: formData.sustainabilityGoal,
      });
      navigate("/terminos-y-condiciones");
    } catch (err) {
      setError(err.response?.data?.message || "Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page eco-aurora">
      <header className="signup-brand-wrap">
        <Link to="/login" className="signup-brand animate-pop" aria-label="Eco Huella">
          <img src={ecoHuellaLogo} alt="" className="signup-brand-logo" />
        </Link>
      </header>

      <main className="signup-shell">
        <section className="signup-card animate-rise">
          <aside className="signup-aside">
            <div className="signup-aside-glow" />
            <div className="signup-aside-content">
              <div>
                <span className="signup-eyebrow">Perfil sustentable</span>
                <h1>Datos que hacen mas preciso tu impacto.</h1>
                <p>
                  Cuanto mejor entendemos tu contexto, mejores son las
                  recomendaciones para reducir tu huella.
                </p>
              </div>

              <div className="signup-feature-list">
                {[
                  ["location_on", "Ubicacion", "Factores locales y habitos"],
                  ["home", "Hogar", "Personas que comparten consumos"],
                  ["flag", "Objetivo", "Acciones alineadas a tu meta"],
                ].map(([icon, title, text]) => (
                  <div key={title} className="signup-feature hover-lift">
                    <span className="material-symbols-outlined">{icon}</span>
                    <div>
                      <strong>{title}</strong>
                      <small>{text}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="signup-content">
            <div className="signup-header">
              <div>
                <span>Crear cuenta</span>
                <h2>Registrarse</h2>
              </div>
              <Link to="/login" className="signup-login-link">
                Ya tienes una cuenta?
              </Link>
            </div>

            {error && <div className="signup-error">{error}</div>}

            <form onSubmit={handleSubmit} className="signup-form" autoComplete="off">
              <div className="signup-grid">
                {["name", "username", "email", "birthDate", "age", "sex", "city", "province", "country"].map(
                  (field) => (
                    <label key={field} className="signup-field">
                      {fieldLabels[field]}
                      {field === "sex" ? (
                        <select
                          name="signup_sex"
                          value={formData.sex}
                          onChange={(e) => handleChange("sex", e.target.value)}
                          className={inputClasses}
                          required
                        >
                          <option value="">Elegir sexo</option>
                          <option value="female">Mujer</option>
                          <option value="male">Hombre</option>
                          <option value="prefer_not_say">Prefiero no decir</option>
                        </select>
                      ) : (
                        <input
                          type={
                            field === "email"
                              ? "email"
                              : field === "birthDate"
                                ? "date"
                              : field === "age"
                                ? "number"
                                : "text"
                          }
                          name={`signup_${field}`}
                          autoComplete={
                            field === "email"
                              ? "off"
                              : field === "username"
                                ? "off"
                                : field === "name"
                                  ? "name"
                                  : "off"
                          }
                          min={field === "age" ? "13" : undefined}
                          max={field === "age" ? "120" : undefined}
                          value={
                            field === "age" && formData.birthDate
                              ? calculateAge(formData.birthDate)
                              : formData[field]
                          }
                          onChange={(e) => {
                            if (field === "birthDate") {
                              const nextAge = calculateAge(e.target.value);
                              setFormData((current) => ({
                                ...current,
                                birthDate: e.target.value,
                                age: nextAge || "",
                              }));
                              return;
                            }
                            handleChange(field, e.target.value);
                          }}
                          className={inputClasses}
                          placeholder="Completar campo"
                          disabled={field === "age" && Boolean(formData.birthDate)}
                          required={["name", "username", "email", "birthDate", "city", "province"].includes(
                            field
                          )}
                        />
                      )}
                    </label>
                  )
                )}
              </div>

              <div className="signup-context">
                <div className="signup-context-head">
                  <span className="material-symbols-outlined">
                    person_pin_circle
                  </span>
                  <div>
                    <h3>Contexto personal</h3>
                    <p>Estos datos ayudan a personalizar el diagnostico.</p>
                  </div>
                </div>

                <div className="signup-grid">
                  <label className="signup-field">
                    {fieldLabels.occupation}
                    <input
                      type="text"
                      value={formData.occupation}
                      onChange={(e) => handleChange("occupation", e.target.value)}
                      className={inputClasses}
                      placeholder="Estudiante, docente, profesional..."
                    />
                  </label>

                  <label className="signup-field">
                    {fieldLabels.householdSize}
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.householdSize}
                      onChange={(e) =>
                        handleChange("householdSize", e.target.value)
                      }
                      className={inputClasses}
                      placeholder="1"
                    />
                  </label>

                  <label className="signup-field signup-field-wide">
                    {fieldLabels.sustainabilityGoal}
                    <select
                      value={formData.sustainabilityGoal}
                      onChange={(e) =>
                        handleChange("sustainabilityGoal", e.target.value)
                      }
                      className={inputClasses}
                    >
                      <option value="">Elegir objetivo</option>
                      <option value="reduce_energy">
                        Reducir consumo de energia
                      </option>
                      <option value="move_better">
                        Moverme de forma mas sustentable
                      </option>
                      <option value="eat_better">Mejorar mi alimentacion</option>
                      <option value="waste_less">Generar menos residuos</option>
                      <option value="learn">Aprender y medir mi impacto</option>
                    </select>
                  </label>
                </div>
              </div>

              <div className="signup-grid">
                {["password", "confirmPassword"].map((field) => (
                  <label key={field} className="signup-field">
                    {fieldLabels[field]}
                    <span className="signup-password-input">
                      <input
                        type={showSignupPassword ? "text" : "password"}
                        name={`signup_${field}`}
                        value={formData[field]}
                        onChange={(e) => handleChange(field, e.target.value)}
                        className={inputClasses}
                        placeholder="Mínimo 6 caracteres"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        className="signup-password-toggle"
                        onClick={() => setShowSignupPassword((current) => !current)}
                        aria-label={
                          showSignupPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                        title={
                          showSignupPassword
                            ? "Ocultar contraseña"
                            : "Mostrar contraseña"
                        }
                      >
                        <span className="material-symbols-outlined">
                          {showSignupPassword ? "visibility" : "visibility_off"}
                        </span>
                      </button>
                    </span>
                  </label>
                ))}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="signup-submit eco-glow-button"
              >
                {isLoading ? "Registrando..." : "Crear una cuenta"}
              </Button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default SignupPage;
