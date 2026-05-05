import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

export default function Layout({ children }) {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="bg-surface border-b border-outline">
        <nav className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div 
            onClick={() => navigate("/")}
            className="text-2xl font-black text-primary tracking-tighter font-headline cursor-pointer"
          >
            EcoHuella
          </div>
          
          <div className="flex items-center gap-4">
            {user && (
              <>
                <span className="text-sm text-on-surface-variant">
                  {user.name}
                </span>
                
                <Button 
                  size="sm"
                  variant="secondary"
                  onClick={() => navigate("/dashboard")}
                >
                  Dashboard
                </Button>

                {isAdmin && (
                  <Button 
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate("/admin")}
                  >
                    Admin
                  </Button>
                )}

                <Button 
                  size="sm"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Contenido Dinámico de la Página */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer (Desktop) */}
      <footer className="hidden md:block py-16 px-6 bg-surface-container-highest border-t border-outline-variant/10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="text-xl font-bold text-primary font-headline">EcoHuella</div>
          <div className="text-on-surface-variant text-sm">© 2026 EcoHuella. Diseñando un futuro regenerativo.</div>
        </div>
      </footer>
    </div>
  );
}