import api from "../../api/api";
export const creditsApi = {
  // Liste paginée avec filtres
  getAll:           (params = {})        => api.get("/credits", { params }),

  // Détail
  getById:          (id)                 => api.get(`/credits/${id}`),

  // CRUD
  create:           (payload)            => api.post("/credits", payload),
  update:           (id, payload)        => api.put(`/credits/${id}`, payload),
  delete:           (id)                 => api.delete(`/credits/${id}`),

  // Actions métier
  enregistrerPaiement: (id, montant)     => api.post(`/credits/${id}/paiement`, { montant_paiement: montant }),

  // Utilitaires
  generateNumero:   ()                   => api.get("/credits/generate-numero"),
  getEnRetard:      (params = {})        => api.get("/credits/en-retard", { params }),
  getByClient:      (clientId, params={})=> api.get(`/credits/client/${clientId}`, { params }),
};

export default api;