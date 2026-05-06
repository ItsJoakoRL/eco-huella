import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
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

  return (
    <div className="app-shell flex min-h-screen flex-col font-body text-on-surface">
      <header className="app-header">
        <nav className="app-nav">
          <button className="brand-lockup" onClick={() => navigate("/")}>
            <span className="brand-mark">
              <span className="material-symbols-outlined text-2xl">eco</span>
            </span>
            <span className="brand-text">
              <span className="brand-name">EcoHuella</span>
              <span className="brand-subtitle">Impacto sostenible</span>
            </span>
          </button>

          {user && (
            <div className="nav-actions">
              <div className="user-chip">
                <span className="user-avatar">{initials || "EH"}</span>
                <span className="text-sm font-semibold text-on-surface-variant">{user.name}</span>
              </div>

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
