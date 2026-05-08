import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import Button from "../ui/Button";
import ecoHuellaLogo from "../../assets/eco-huella-logo-generated.png";

const inputClasses = "signup-input";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recoveryStep, setRecoveryStep] = useState("email");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const openRecovery = () => {
    setRecoveryOpen(true);
    setRecoveryStep("email");
    setRecoveryEmail(email);
    setResetToken("");
    setNewPassword("");
    setConfirmNewPassword("");
    setRecoveryMessage("");
    setRecoveryError("");
  };

  const closeRecovery = () => {
    setRecoveryOpen(false);
    setRecoveryError("");
    setRecoveryMessage("");
  };

  const handleRecoveryRequest = async (e) => {
    e.preventDefault();
    setRecoveryError("");
    setRecoveryMessage("");
    setRecoveryLoading(true);

    try {
      const registeredEmail = recoveryEmail.trim().toLowerCase();
      const response = await authAPI.forgotPassword({ email: registeredEmail });
      setRecoveryEmail(registeredEmail);
      setResetToken("");
      setRecoveryMessage(response.data.message);
      setRecoveryStep("reset");
    } catch (err) {
      setRecoveryError(
        err.response?.data?.message || "No se pudo generar el código"
      );
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setRecoveryError("");
    setRecoveryMessage("");

    if (newPassword !== confirmNewPassword) {
      setRecoveryError("Las contraseñas no coinciden");
      return;
    }

    if (!/^\d{6}$/.test(resetToken)) {
      setRecoveryError("Ingresa el código de 6 dígitos que recibiste por correo");
      return;
    }

    setRecoveryLoading(true);

    try {
      await authAPI.resetPassword({
        email: recoveryEmail,
        token: resetToken,
        password: newPassword,
      });
      setPassword("");
      setEmail(recoveryEmail);
      setRecoveryMessage("Contraseña actualizada. Ya puedes iniciar sesión.");
      setRecoveryStep("done");
    } catch (err) {
      setRecoveryError(
        err.response?.data?.message || "No se pudo actualizar la contraseña"
      );
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "No se pudo conectar con el servidor. Verifica que el backend este encendido."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page eco-aurora">
      <header className="signup-brand-wrap">
        <Link to="/" className="signup-brand animate-pop" aria-label="Eco Huella">
          <img src={ecoHuellaLogo} alt="" className="signup-brand-logo" />
        </Link>
      </header>

      <main className="signup-shell">
        <section className="login-card animate-rise">
          <aside className="login-aside">
            <div className="signup-aside-glow" />
            <div className="login-aside-content">
              <div>
                <span className="signup-eyebrow">Bienvenido de vuelta</span>
                <h1>Tu huella sigue contando.</h1>
                <p>
                  Entra para continuar tu diagnóstico, revisar recomendaciones
                  y administrar datos si tienes permisos.
                </p>
              </div>

              <div className="login-insight-grid">
                <div className="login-insight hover-lift">
                  <span className="material-symbols-outlined">monitoring</span>
                  <strong>Dashboard</strong>
                  <small>Resultados y acciones sugeridas</small>
                </div>
                <div className="login-insight hover-lift">
                  <span className="material-symbols-outlined">shield_lock</span>
                  <strong>Sesión segura</strong>
                  <small>Token local para mantener acceso</small>
                </div>
              </div>
            </div>
          </aside>

          <div className="signup-content login-content">
            <div className="signup-header">
              <div>
                <span>Acceso</span>
                <h2>Iniciar sesión</h2>
              </div>
              <Link to="/signup" className="signup-login-link">
                No tienes cuenta?
              </Link>
            </div>

            {error && <div className="signup-error">{error}</div>}

            <div className="login-support-panel">
              <div>
                <strong>Accede a tu diagnóstico</strong>
                <p>
                  Usa tu correo o nombre de usuario para continuar tu
                  evaluación ambiental.
                </p>
              </div>
              <span className="material-symbols-outlined">eco</span>
            </div>

            <form onSubmit={handleSubmit} className="signup-form login-form" autoComplete="off">
              <input
                type="text"
                name="username"
                autoComplete="username"
                tabIndex="-1"
                aria-hidden="true"
                className="auth-autofill-decoy"
              />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                tabIndex="-1"
                aria-hidden="true"
                className="auth-autofill-decoy"
              />

              <label className="signup-field">
                Usuario o correo electrónico
                <input
                  type="text"
                  name="login_identifier_disabled_autofill"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                  placeholder="tu@gmail.com"
                  autoComplete="off"
                  required
                />
              </label>

              <label className="signup-field">
                Contraseña
                <span className="signup-password-input">
                <input
                  type={showLoginPassword ? "text" : "password"}
                  name="login_password_disabled_autofill"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  required
                />
                  <button
                    type="button"
                    className="signup-password-toggle"
                    onClick={() => setShowLoginPassword((current) => !current)}
                    aria-label={
                      showLoginPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                    title={
                      showLoginPassword
                        ? "Ocultar contraseña"
                        : "Mostrar contraseña"
                    }
                  >
                    <span className="material-symbols-outlined">
                      {showLoginPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </span>
              </label>

              <div className="login-options">
                <label className="login-check">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Mantenerme conectado
                </label>
                <button type="button" className="login-forgot" onClick={openRecovery}>
                  Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="signup-submit eco-glow-button"
              >
                {isLoading ? "Ingresando..." : "Entrar a EcoHuella"}
              </Button>
            </form>
          </div>
        </section>
      </main>

      {recoveryOpen && (
        <div className="recovery-overlay" role="dialog" aria-modal="true">
          <section className="recovery-modal animate-pop">
            <button
              type="button"
              className="recovery-close"
              onClick={closeRecovery}
              aria-label="Cerrar recuperacion"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="recovery-head">
              <span className="material-symbols-outlined">lock_reset</span>
              <div>
                <h2>Crear nueva contraseña</h2>
                <p>
                  Ingresa el correo que usaste al registrarte y te enviamos
                  un código de 6 dígitos para cambiar tu contraseña.
                </p>
              </div>
            </div>

            {recoveryError && <div className="signup-error">{recoveryError}</div>}
            {recoveryMessage && (
              <div className="recovery-success">{recoveryMessage}</div>
            )}

            {recoveryStep === "email" && (
              <form onSubmit={handleRecoveryRequest} className="recovery-form">
                <label className="signup-field">
                  Correo registrado
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className={inputClasses}
                    placeholder="tu@gmail.com"
                    required
                  />
                </label>

                <Button
                  type="submit"
                  disabled={recoveryLoading}
                  className="signup-submit eco-glow-button"
                >
                  {recoveryLoading ? "Enviando..." : "Enviar código"}
                </Button>
              </form>
            )}

            {recoveryStep === "reset" && (
              <form onSubmit={handlePasswordReset} className="recovery-form">
                <label className="signup-field">
                  Código de 6 dígitos
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    value={resetToken}
                    onChange={(e) =>
                      setResetToken(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className={inputClasses}
                    placeholder="123456"
                    required
                  />
                </label>

                <label className="signup-field">
                  Nueva contraseña
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClasses}
                    placeholder="Mínimo 6 caracteres"
                    required
                  />
                </label>

                <label className="signup-field">
                  Confirmar nueva contraseña
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={inputClasses}
                    placeholder="Repetir contraseña"
                    required
                  />
                </label>

                <Button
                  type="submit"
                  disabled={recoveryLoading}
                  className="signup-submit eco-glow-button"
                >
                  {recoveryLoading ? "Guardando..." : "Guardar contraseña"}
                </Button>
              </form>
            )}

            {recoveryStep === "done" && (
              <button
                type="button"
                className="admin-primary-button recovery-done-button"
                onClick={closeRecovery}
              >
                Volver al login
              </button>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
