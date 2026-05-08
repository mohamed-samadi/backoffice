import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});

export const documentsApi = {
  getAll: (params = {}) => api.get("/documents", { params }),
  getStats: (params = {}) => api.get("/documents/stats", { params }),
  getActiveClients: () => api.get("/clients/active"),
  getSelectableProducts: (params = {}) =>
    api.get("/products", {
      params: {
        per_page: 100,
        actif: 1,
        sort_by: "nom",
        sort_order: "asc",
        ...params,
      },
    }),
  getById: (id) => api.get(`/documents/${id}`),
  create: (payload) => api.post("/documents", payload),
  update: (id, payload) => api.put(`/documents/${id}`, payload),
  delete: (id) => api.delete(`/documents/${id}`),
};

export default api;