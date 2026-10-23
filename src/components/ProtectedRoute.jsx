import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./ui/Button";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const {
    isAuthenticated,
    isAdmin,
    checkingAuth,
    connectionError,
    retryAuth,
    termsAccepted,
    termsPending,
  } = useAuth();

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

  // Sin esto, al no poder cargar el perfil se redirigía a los términos y condiciones.
  if (connectionError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center" role="alert">
        <span className="material-symbols-outlined text-5xl text-primary">cloud_off</span>
        <h1 className="text-xl font-bold text-on-surface">No pudimos conectar con el servidor</h1>
        <p className="max-w-sm text-on-surface-variant">
          Tu sesión sigue guardada. Si el servidor se está iniciando puede tardar unos segundos:
          espera un momento y vuelve a intentarlo.
        </p>
        <Button onClick={retryAuth}>Reintentar</Button>
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
