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
  getById: (id) => api.get(`/documents/${id}`),
  create: (payload) => api.post("/documents", payload),
  update: (id, payload) => api.put(`/documents/${id}`, payload),
  delete: (id) => api.delete(`/documents/${id}`),
};

export default api;