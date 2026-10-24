import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { clearLegacyQuizAnswers, clearQuizAnswers } from "../utils/quizStorage";
import { TERMS_VERSION } from "../../backend/shared/terms";
import { HEAVY_AVATAR_CHARS, compressAvatarUrl } from "../utils/imageTools";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  // true mientras se confirma con el servidor una sesión guardada: evita redirigir
  // (a términos o al dashboard) antes de saber quién es el usuario.
  const [checkingAuth, setCheckingAuth] = useState(() => Boolean(localStorage.getItem("token")));
  // true si no se pudo confirmar la sesión por un problema de red o del servidor (no
  // porque el token sea inválido): la sesión se conserva y se puede reintentar.
  const [connectionError, setConnectionError] = useState(false);
  const [error, setError] = useState(null);

  // La aceptación de los términos la guarda el servidor (fecha y versión), no el
  // navegador: vale en cualquier dispositivo y queda constancia. Si cambia el texto
  // (TERMS_VERSION), hay que volver a aceptarlos.
  const termsAccepted = Boolean(user) && user.termsVersion === TERMS_VERSION;

  // Verificar si el usuario está autenticado al cargar
  async function checkAuth() {
    setConnectionError(false);
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.user);
    } catch (err) {
      console.error("Error al verificar autenticación:", err);
      const status = err.response?.status;
      if (status === 401 || status === 404) {
        // El servidor respondió y la sesión no vale (token vencido o cuenta borrada).
        setToken(null);
        localStorage.removeItem("token");
      } else {
        // Sin respuesta (red caída, servidor arrancando) o error del servidor: la
        // sesión puede ser válida, así que no se cierra.
        setConnectionError(true);
      }
    } finally {
      setCheckingAuth(false);
    }
  };

  const retryAuth = () => {
    setCheckingAuth(true);
    checkAuth();
  };

  const signup = async (name, email, password, profile = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.signup({ name, email, password, ...profile });
      setToken(response.data.token);
      setUser(response.data.user);
      clearLegacyQuizAnswers();
      clearQuizAnswers(response.data.user);
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error en el registro";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.login({
        email: email.trim(),
        password,
      });
      setToken(response.data.token);
      setUser(response.data.user);
      localStorage.setItem("token", response.data.token);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error en el inicio de sesión";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
  }

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token]);

  // Las fotos de perfil guardadas antes de que se achicaran al subirlas pueden pesar varios MB
  // y viajan en cada login y carga de la app: se vuelven a guardar livianas, una vez por sesión.
  const avatarUrl = user?.avatarUrl;
  useEffect(() => {
    if (!avatarUrl || avatarUrl.length < HEAVY_AVATAR_CHARS || !avatarUrl.startsWith("data:image/")) return;
    if (sessionStorage.getItem("ecohuella_avatar_slimmed")) return;
    sessionStorage.setItem("ecohuella_avatar_slimmed", "1");

    (async () => {
      try {
        const slim = await compressAvatarUrl(avatarUrl);
        if (slim.length >= avatarUrl.length) return;
        const response = await authAPI.updateProfile({ avatarUrl: slim });
        setUser(response.data.user);
      } catch (err) {
        console.error("No se pudo achicar la foto de perfil:", err);
      }
    })();
  }, [avatarUrl]);

  // El cliente HTTP avisa con este evento cuando el servidor rechaza el token en
  // mitad de la sesión (venció, cambiaron la contraseña, borraron la cuenta).
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener("auth:expired", handleSessionExpired);
    return () => window.removeEventListener("auth:expired", handleSessionExpired);
  }, []);

  // Devuelve true si el servidor registró la aceptación; si no, no se da por aceptada.
  const acceptTerms = async () => {
    try {
      const response = await authAPI.acceptTerms({ version: TERMS_VERSION });
      setUser(response.data.user);
      return true;
    } catch (err) {
      console.error("No se pudo registrar la aceptación de los términos:", err);
      return false;
    }
  };

  const rejectTerms = () => {
    logout();
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.updateProfile(profileData);
      if (response.data.token) {
        // Al cambiar la contraseña el servidor invalida el token viejo y manda uno nuevo.
        localStorage.setItem("token", response.data.token);
        setToken(response.data.token);
      }
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error al actualizar perfil";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    checkingAuth,
    connectionError,
    retryAuth,
    isAuthenticated: !!token,
    isAdmin: user?.role === "admin",
    termsAccepted,
    acceptTerms,
    rejectTerms,
    signup,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
};
