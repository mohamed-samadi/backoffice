import api from "../../api/api";
export const documentsApi = {
  getAll: (params = {}) => api.get("/documents", { params }),
  getStats: (params = {}) => api.get("/documents/stats", { params }),
  getById: (id) => api.get(`/documents/${id}`),
  create: (payload) => api.post("/documents", payload),
  update: (id, payload) => api.put(`/documents/${id}`, payload),
  delete: (id) => api.delete(`/documents/${id}`),
};

export default api;