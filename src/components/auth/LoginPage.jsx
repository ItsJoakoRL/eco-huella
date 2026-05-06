import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
import Button from "../ui/Button";

const inputClasses = "signup-input";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
      const response = await authAPI.forgotPassword({ email: recoveryEmail });
      setResetToken(response.data.resetToken || "");
      setRecoveryMessage(response.data.message);
      setRecoveryStep("reset");
    } catch (err) {
      setRecoveryError(
        err.response?.data?.message || "No se pudo generar el codigo"
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
      setRecoveryError("Las contrasenas no coinciden");
      return;
    }

    setRecoveryLoading(true);

    try {
      await authAPI.resetPassword({
        token: resetToken,
        password: newPassword,
      });
      setPassword("");
      setEmail(recoveryEmail);
      setRecoveryMessage("Contrasena actualizada. Ya puedes iniciar sesion.");
      setRecoveryStep("done");
    } catch (err) {
      setRecoveryError(
        err.response?.data?.message || "No se pudo actualizar la contrasena"
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
      setError(err.response?.data?.message || "Usuario o contrasena incorrectos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page eco-aurora">
      <header className="signup-brand-wrap">
        <Link to="/" className="signup-brand animate-pop">
          EH
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
                  Entra para continuar tu diagnostico, revisar recomendaciones
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
                  <strong>Sesion segura</strong>
                  <small>Token local para mantener acceso</small>
                </div>
              </div>
            </div>
          </aside>

          <div className="signup-content login-content">
            <div className="signup-header">
              <div>
                <span>Acceso</span>
                <h2>Iniciar sesion</h2>
              </div>
              <Link to="/signup" className="signup-login-link">
                No tienes cuenta?
              </Link>
            </div>

            {error && <div className="signup-error">{error}</div>}

            <div className="login-support-panel">
              <div>
                <strong>Accede a tu diagnostico</strong>
                <p>
                  Usa el correo con el que te registraste para continuar tu
                  evaluacion ambiental.
                </p>
              </div>
              <span className="material-symbols-outlined">eco</span>
            </div>

            <form onSubmit={handleSubmit} className="signup-form login-form">
              <label className="signup-field">
                Usuario o correo electronico
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClasses}
                  placeholder="tu@email.com"
                  required
                />
              </label>

              <label className="signup-field">
                Contrasena
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClasses}
                  placeholder="Minimo 6 caracteres"
                  required
                />
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
                  Olvidaste tu contrasena?
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
                <h2>Crear nueva contrasena</h2>
                <p>
                  Te generamos un codigo temporal para validar el cambio de
                  contrasena.
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
                  Correo electronico
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className={inputClasses}
                    placeholder="tu@email.com"
                    required
                  />
                </label>

                <Button
                  type="submit"
                  disabled={recoveryLoading}
                  className="signup-submit eco-glow-button"
                >
                  {recoveryLoading ? "Generando..." : "Generar codigo"}
                </Button>
              </form>
            )}

            {recoveryStep === "reset" && (
              <form onSubmit={handlePasswordReset} className="recovery-form">
                {resetToken && (
                  <label className="signup-field">
                    Codigo de recuperacion
                    <input
                      type="text"
                      value={resetToken}
                      onChange={(e) => setResetToken(e.target.value)}
                      className={inputClasses}
                      required
                    />
                  </label>
                )}

                <label className="signup-field">
                  Nueva contrasena
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClasses}
                    placeholder="Minimo 6 caracteres"
                    required
                  />
                </label>

                <label className="signup-field">
                  Confirmar nueva contrasena
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className={inputClasses}
                    placeholder="Repetir contrasena"
                    required
                  />
                </label>

                <Button
                  type="submit"
                  disabled={recoveryLoading}
                  className="signup-submit eco-glow-button"
                >
                  {recoveryLoading ? "Guardando..." : "Guardar contrasena"}
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
