import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";
import { clearLegacyQuizAnswers, clearQuizAnswers } from "../utils/quizStorage";

const AuthContext = createContext();
const TERMS_STORAGE_KEY = "ecohuella_terms_accepted_v1";
const TERMS_PENDING_STORAGE_KEY = "ecohuella_terms_pending_user_v1";

const getUserId = (user) => user?.id || user?._id || null;

const getAcceptedTermsUsers = () => {
  try {
    const storedValue = localStorage.getItem(TERMS_STORAGE_KEY);
    const parsedValue = JSON.parse(storedValue || "[]");
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
};

const hasAcceptedTerms = (user) => {
  const userId = getUserId(user);
  return userId ? getAcceptedTermsUsers().includes(userId) : false;
};

const hasPendingTerms = (user) => {
  const userId = getUserId(user);
  return userId
    ? localStorage.getItem(TERMS_PENDING_STORAGE_KEY) === userId
    : false;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsPending, setTermsPending] = useState(false);

  // Verificar si el usuario está autenticado al cargar
  async function checkAuth() {
    try {
      const response = await authAPI.getProfile();
      setUser(response.data.user);
      setTermsAccepted(hasAcceptedTerms(response.data.user));
      setTermsPending(hasPendingTerms(response.data.user));
    } catch (err) {
      console.error("Error al verificar autenticación:", err);
      setToken(null);
      setTermsAccepted(false);
      setTermsPending(false);
      localStorage.removeItem("token");
    }
  };

  const signup = async (name, email, password, profile = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.signup({ name, email, password, ...profile });
      const userId = getUserId(response.data.user);
      setToken(response.data.token);
      setUser(response.data.user);
      setTermsAccepted(false);
      setTermsPending(true);
      clearLegacyQuizAnswers();
      clearQuizAnswers(response.data.user);
      if (userId) {
        localStorage.setItem(TERMS_PENDING_STORAGE_KEY, userId);
      }
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
        password: password.trim(),
      });
      setToken(response.data.token);
      setUser(response.data.user);
      setTermsAccepted(hasAcceptedTerms(response.data.user));
      setTermsPending(hasPendingTerms(response.data.user));
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
    setTermsAccepted(false);
    setTermsPending(false);
    localStorage.removeItem("token");
  }

  useEffect(() => {
    if (token) {
      checkAuth();
    }
  }, [token]);

  const acceptTerms = () => {
    const userId = getUserId(user);
    if (!userId) return;

    const acceptedUsers = getAcceptedTermsUsers();
    const nextAcceptedUsers = acceptedUsers.includes(userId)
      ? acceptedUsers
      : [...acceptedUsers, userId];

    localStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify(nextAcceptedUsers));
    localStorage.removeItem(TERMS_PENDING_STORAGE_KEY);
    setTermsAccepted(true);
    setTermsPending(false);
  };

  const rejectTerms = () => {
    const userId = getUserId(user);
    const acceptedUsers = getAcceptedTermsUsers().filter((id) => id !== userId);
    localStorage.setItem(TERMS_STORAGE_KEY, JSON.stringify(acceptedUsers));
    localStorage.removeItem(TERMS_PENDING_STORAGE_KEY);
    setTermsAccepted(false);
    setTermsPending(false);
    logout();
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.updateProfile(profileData);
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
    isAuthenticated: !!token,
    isAdmin: user?.role === "admin",
    termsAccepted,
    termsPending,
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
