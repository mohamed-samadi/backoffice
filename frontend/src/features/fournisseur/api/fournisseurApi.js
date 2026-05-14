import api from "../../api/api";
export const fournisseurApi = {
  // Récupérer tous les fournisseurs avec filtres/pagination
  getAll: (params = {}) => api.get("/fournisseurs", { params }),
  
  // Recherche rapide (backend-side)
  search: (query) => api.get("/fournisseurs/search", { params: { q: query } }),

  // Détails d'un fournisseur
  getById: (id) => api.get(`/fournisseurs/${id}`),

  getActive: () => api.get("/fournisseurs/active"),

  // Récupérer les villes des fournisseurs
  getVilles: () => api.get("/fournisseurs/villes"),

  // Créer un fournisseur
  create: (payload) => api.post("/fournisseurs", payload),

  // Mettre à jour un fournisseur
  update: (id, payload) => api.put(`/fournisseurs/${id}`, payload),

  // Supprimer un fournisseur
  delete: (id) => api.delete(`/fournisseurs/${id}`),
};

export default api;