import axios from "axios";

function normalizeBackendOrigin(url) {
  if (!url || typeof url !== "string") return "";
  return url.replace(/\/+$/, "").replace(/\/api\/?$/, "");
}

function getBackendOrigin() {
  if (typeof window !== "undefined" && window.__VITE_API_URL__) {
    return normalizeBackendOrigin(window.__VITE_API_URL__);
  }

  if (import.meta.env.VITE_BACKEND_URL) {
    return normalizeBackendOrigin(import.meta.env.VITE_BACKEND_URL);
  }

  if (import.meta.env.VITE_API_URL) {
    return normalizeBackendOrigin(import.meta.env.VITE_API_URL);
  }

  // Dev default: use Vite proxy (same-origin) to avoid CSRF/XSRF issues.
  return "";
}

const backendOrigin = getBackendOrigin();
const apiBaseUrl = backendOrigin ? `${backendOrigin}/api` : "/api";
const csrfCookieUrl = backendOrigin
  ? `${backendOrigin}/sanctum/csrf-cookie`
  : "/sanctum/csrf-cookie";

const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true, // ✅ envoie les cookies HTTP-only automatiquement
  // Axios n'envoie pas toujours le header X-XSRF-TOKEN en cross-origin.
  // L'activer évite les 419 lorsque l'API est sur un autre port/domaine.
  withXSRFToken: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Rediriger vers login si session expirée
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  // ✅ Étape 1 obligatoire avant login — récupère le cookie CSRF
  getCsrfCookie: () =>
    axios.get(csrfCookieUrl, {
      withCredentials: true,
    }),

  login: (credentials) => api.post("/login", credentials),
  register: (payload) => api.post("/register", payload),
  logout: () => api.post("/logout"),
  me: () => api.get("/me"),
  updateProfile: (payload) => api.put("/me", payload),
};

export default api;
