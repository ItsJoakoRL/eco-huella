import { useAuth } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import ProfileModal from "../profile/ProfileModal";
import UniversityBadge from "../ui/UniversityBadge";

export default function Layout({ children }) {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const initials = user?.name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const avatarStyle = {
    "--avatar-zoom": user?.avatarZoom || 1,
    "--avatar-offset-x": `${user?.avatarOffsetX || 0}%`,
    "--avatar-offset-y": `${user?.avatarOffsetY || 0}%`,
  };

  return (
    <div className="app-shell flex min-h-screen flex-col font-body text-on-surface">
      <div className="app-nature-layer" aria-hidden="true">
        <span className="nature-glyph glyph-leaf material-symbols-outlined">eco</span>
        <span className="nature-glyph glyph-water material-symbols-outlined">water_drop</span>
        <span className="nature-glyph glyph-park material-symbols-outlined">park</span>
        <span className="nature-glyph glyph-bolt material-symbols-outlined">energy_savings_leaf</span>
      </div>
      <header className="app-header">
        <nav className={`app-nav${isAdmin ? " app-nav-admin" : ""}`}>
          <div className="nav-brand-group">
            <button className="brand-lockup" type="button" onClick={() => navigate("/")} aria-label="Ir al inicio">
              <span className="brand-mark">
                <span className="material-symbols-outlined text-2xl">eco</span>
              </span>
              <span className="brand-text">
                <span className="brand-name">EcoHuella</span>
                <span className="brand-subtitle">Impacto sostenible</span>
              </span>
            </button>

            <UniversityBadge variant="header" />
          </div>

          {user && (
            <div className="nav-actions">
              <button className="user-chip user-chip-button" onClick={() => setIsProfileOpen(true)}>
                <span className="user-avatar">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name || "Perfil"} style={avatarStyle} />
                  ) : (
                    initials || "EH"
                  )}
                </span>
                <span className="text-sm font-semibold text-on-surface-variant">{user.name}</span>
              </button>

              <button className="nav-pill" onClick={() => navigate("/")}>
                <span className="material-symbols-outlined text-xl">home</span>
                Inicio
              </button>

              <button className="nav-pill" onClick={() => navigate("/encuestas")}>
                <span className="material-symbols-outlined text-xl">assignment</span>
                Encuestas
              </button>

              <button className="nav-pill" onClick={() => navigate("/dashboard")}>
                <span className="material-symbols-outlined text-xl">monitoring</span>
                Dashboard
              </button>

              {isAdmin && (
                <button className="nav-pill" onClick={() => navigate("/admin")}>
                  <span className="material-symbols-outlined text-xl">admin_panel_settings</span>
                  Admin
                </button>
              )}

              <button className="nav-pill primary eco-glow-button" onClick={handleLogout}>
                <span className="material-symbols-outlined text-xl">logout</span>
                Salir
              </button>
            </div>
          )}

          {/* Visitante: la portada es pública y desde acá puede entrar o registrarse. */}
          {!isAuthenticated && (
            <div className="nav-actions">
              <Link className="nav-pill" to="/login">
                <span className="material-symbols-outlined text-xl">login</span>
                Iniciar sesión
              </Link>
              <Link className="nav-pill primary eco-glow-button" to="/signup">
                <span className="material-symbols-outlined text-xl">person_add</span>
                Crear cuenta
              </Link>
            </div>
          )}
        </nav>
      </header>

      {user && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      <main className="grow">{children}</main>

      <footer className="app-footer">
        <div className="app-footer-inner app-footer-grid">
          <div>
            <div className="font-headline text-xl font-black tracking-tight text-primary">EcoHuella</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Diseñando un futuro regenerativo
            </div>
          </div>

          <UniversityBadge variant="footer" />

          <div className="app-footer-meta">
            <span>© 2026 EcoHuella</span>
            <Link to="/terminos-y-condiciones">Términos y condiciones</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
