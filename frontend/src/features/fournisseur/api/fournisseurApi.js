import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const fournisseurApi = {
  // Récupérer tous les fournisseurs avec filtres/pagination
  getAll: (params = {}) => api.get("/fournisseurs", { params }),

  // Recherche rapide (backend-side)
  search: (query) => api.get("/fournisseurs/search", { params: { q: query } }),

  // Détails d'un fournisseur
  getById: (id) => api.get(`/fournisseurs/${id}`),

  getActive: () => api.get("/fournisseurs/active"),

  // Créer un fournisseur
  create: (payload) => api.post("/fournisseurs", payload),

  // Mettre à jour un fournisseur
  update: (id, payload) => api.put(`/fournisseurs/${id}`, payload),

  // Supprimer un fournisseur
  delete: (id) => api.delete(`/fournisseurs/${id}`),
};

export default api;