import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const productsApi = {
  // ── Liste paginée avec filtres ─────────────────────────────────────────
  // ?search= ?category_id= ?fournisseur_id= ?actif= ?min_price= ?max_price=
  // ?sort_by= ?sort_order= ?per_page=
  getAll: (params = {}) => api.get("/products", { params }),

  // ── Détail produit (avec category + fournisseur chargés) ──────────────
  getById: (id) => api.get(`/products/${id}`),

  // ── CRUD — FormData obligatoire pour l'upload image ───────────────────
  create: (payload) =>
    api.post("/products", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  update: (id, payload) =>
    api.post(`/products/${id}`, payload, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: (id) => api.delete(`/products/${id}`),

  byCategory:    (categoryId, params = {}) =>
    api.get(`/products/category/${categoryId}`, { params }),

  byFournisseur: (fournisseurId, params = {}) =>
    api.get(`/products/fournisseur/${fournisseurId}`, { params }),

  lowStock: (params = {}) =>
    api.get("/products/stock/low", { params }),
};

export default api;