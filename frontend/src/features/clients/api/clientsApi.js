import api from "../../api/api";

export const clientsApi = {
    getAll : (params = {}) => api.get("/clients", { params }),
    getById: (id) => api.get(`/clients/${id}`),
    create: (payload) => api.post("/clients", payload),
    update: (id, payload) => api.put(`/clients/${id}`, payload),
    delete: (id) => api.delete(`/clients/${id}`),
    getActive: () => api.get("/clients/active"),
};
