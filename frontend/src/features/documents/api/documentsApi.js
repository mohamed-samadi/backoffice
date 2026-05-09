import api from "../../api/api";
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
  generateNumero: (type) => api.get("/documents/generate-sku", { params: { type } }),
  getById: (id) => api.get(`/documents/${id}`),
  create: (payload) => api.post("/documents", payload),
  update: (id, payload) => api.put(`/documents/${id}`, payload),
  delete: (id) => api.delete(`/documents/${id}`),
};

export default api;