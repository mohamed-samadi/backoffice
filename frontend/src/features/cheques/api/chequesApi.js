import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const chequesApi = {
  // ── CRUD ──────────────────────────────────────────────────────────────
  getAll:  (params = {}) => api.get("/cheques", { params }),
  getById: (id)          => api.get(`/cheques/${id}`),
    getByClient: (clientId, params = {}) =>
      api.get(`/cheques/client/${clientId}`, { params }),
  // FormData obligatoire (upload image chèque)
  create: (payload) =>
    api.post("/cheques", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id, payload) =>
    api.post(`/cheques/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id) => api.delete(`/cheques/${id}`),

  // ── Actions métier ─────────────────────────────────────────────────────
  encaisser:     (id) => api.patch(`/cheques/${id}/encaisser`),
  marquerImpaye: (id) => api.patch(`/cheques/${id}/impaye`),
  annuler:       (id) => api.patch(`/cheques/${id}/annuler`),

  // ── Routes spéciales ──────────────────────────────────────────────────
  echeancesProches: (jours = 7) =>
    api.get("/cheques/echeances-proches", { params: { jours } }),
};

export default api;