import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ProfileModal from "../profile/ProfileModal";

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
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
      <header className="app-header">
        <nav className="app-nav">
          <div className="brand-lockup" aria-label="EcoHuella">
            <span className="brand-mark">
              <span className="material-symbols-outlined text-2xl">eco</span>
            </span>
            <span className="brand-text">
              <span className="brand-name">EcoHuella</span>
              <span className="brand-subtitle">Impacto sostenible</span>
            </span>
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
        </nav>
      </header>

      {user && (
        <ProfileModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      <main className="flex-grow">{children}</main>

      <footer className="app-footer hidden md:block">
        <div className="app-footer-inner">
          <div>
            <div className="font-headline text-xl font-black tracking-tight text-primary">EcoHuella</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Disenando un futuro regenerativo
            </div>
          </div>
          <div className="text-sm text-on-surface-variant">2026 EcoHuella</div>
        </div>
      </footer>
    </div>
  );
}
