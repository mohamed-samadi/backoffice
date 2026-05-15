import api from "../../api/api";
export const companiesApi = {
  // Liste paginée avec filtres
  getAll:           (params = {})        => api.get("/companies", { params }),
    
    // Détail
    getById:          (id)                 => api.get(`/companies/${id}`),  

    // CRUD
    create:           (payload)            => api.post("/companies", payload),
    update:           (id, payload)        => api.put(`/companies/${id}`, payload),
    delete:           (id)                 => api.delete(`/companies/${id}`),
};

export default api;