import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, isAdmin, checkingAuth, termsAccepted, termsPending } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center text-primary" role="status" aria-label="Verificando sesión">
        <span className="material-symbols-outlined animate-pulse-soft text-5xl">progress_activity</span>
      </div>
    );
  }

  if (termsPending || !termsAccepted) {
    return <Navigate to="/terminos-y-condiciones" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
