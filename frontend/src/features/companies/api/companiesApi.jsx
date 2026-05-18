import api from "../../api/api";

const isFormData = (payload) => typeof FormData !== "undefined" && payload instanceof FormData;

export const companiesApi = {
  // Liste paginée avec filtres
  getAll:           (params = {})        => api.get("/companies", { params }),
    
    // Détail
    getById:          (id)                 => api.get(`/companies/${id}`),  

    // CRUD
    create:           (payload)            => api.post("/companies", payload),
    update:           (id, payload) => {
      if (isFormData(payload)) {
        const formData = payload;
        formData.set("_method", "PUT");
        return api.post(`/companies/${id}`, formData);
      }

      return api.put(`/companies/${id}`, payload);
    },
    delete:           (id)                 => api.delete(`/companies/${id}`),
};

export default api;