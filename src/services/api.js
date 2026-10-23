import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.PROD
    ? "https://ecohuella-api-dv7c.onrender.com/api"
    : "/api");

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Estos endpoints responden 401 por credenciales incorrectas, no por sesión vencida.
const PUBLIC_AUTH_PATHS = [
  "/auth/login",
  "/auth/signup",
  "/auth/forgot-password",
  "/auth/reset-password",
];

// Si el servidor rechaza el token en mitad de la sesión, se descarta y se avisa a la
// app (AuthContext) para que lleve al login en vez de seguir fallando en silencio.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    const sentToken = Boolean(error.config?.headers?.Authorization);
    const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) => requestUrl.startsWith(path));

    if (error.response?.status === 401 && sentToken && !isPublicAuthRequest) {
      localStorage.removeItem("token");
      window.dispatchEvent(new Event("auth:expired"));
    }

    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  forgotPassword: (data) => api.post("/auth/forgot-password", data),
  resetPassword: (data) => api.post("/auth/reset-password", data),
  getProfile: () => api.get("/auth/profile"),
  acceptTerms: (data) => api.post("/auth/accept-terms", data),
  updateProfile: (data) => api.put("/auth/profile", data),
};

// Questions APIs
export const questionsAPI = {
  getAll: (params) => api.get("/questions", { params }),
  getById: (id) => api.get(`/questions/${id}`),
  create: (data) => api.post("/questions", data),
  update: (id, data) => api.put(`/questions/${id}`, data),
  delete: (id) => api.delete(`/questions/${id}`),
};

// Parameters APIs
export const parametersAPI = {
  getAll: () => api.get("/parameters"),
  getByCategory: (category) => api.get(`/parameters/${category}`),
  update: (category, data) => api.put(`/parameters/${category}`, data),
  create: (data) => api.post("/parameters", data),
};

// Quiz Results APIs
export const quizResultsAPI = {
  getMyResults: () => api.get("/results"),
  getById: (id) => api.get(`/results/${id}`),
  save: (data) => api.post("/results", data),
  update: (id, data) => api.put(`/results/${id}`, data),
  delete: (id) => api.delete(`/results/${id}`),
  getAllResults: () => api.get("/results/admin/all"),
};

// User Management APIs (Admin)
export const usersAPI = {
  getAll: () => api.get("/admin/users"),
  getById: (id) => api.get(`/admin/users/${id}`),
  update: (id, data) => api.put(`/admin/users/${id}`, data),
  delete: (id) => api.delete(`/admin/users/${id}`),
  changeRole: (id, role) => api.patch(`/admin/users/${id}/role`, { role }),
};

export default api;
