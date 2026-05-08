import api from "../../api/api";

export const categoriesApi = {
  // Liste paginée avec filtres (search, status, sort_by, sort_order, per_page)
  // La recherche passe par ce endpoint via ?search= — pas de /search séparé
  getAll: (params = {}) => api.get("/categories", { params }),

  // Liste légère pour dropdowns/selects — sans pagination ni withCount
  getActive: () => api.get("/categories/active"),

  withProductCount: () => api.get("/categories/with-count"),

  // Détails d'une catégorie (avec ses produits + products_count)
  getById: (id) => api.get(`/categories/${id}`),

  create: (payload) => api.post("/categories", payload),
  update: (id, payload) => api.put(`/categories/${id}`, payload),
  delete: (id) => api.delete(`/categories/${id}`),

  // Bulk update statut
  bulkUpdateStatus: (ids, isActive) =>
    api.post("/categories/bulk-status", { ids, is_active: isActive }),
};

export default api;