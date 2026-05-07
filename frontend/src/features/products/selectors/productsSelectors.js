// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS — products
// ─────────────────────────────────────────────────────────────────────────────

// ── Data principale (liste paginée) ──────────────────────────────────────────
export const selectProductsData    = (state) => state?.products?.data    || [];
export const selectCurrentProduct  = (state) => state?.products?.current || null;

// ── Listes secondaires ────────────────────────────────────────────────────────
export const selectProductsByCategory    = (state) => state?.products?.byCategory    || [];
export const selectProductsByFournisseur = (state) => state?.products?.byFournisseur || [];
export const selectLowStockProducts      = (state) => state?.products?.lowStock      || [];
export const selectLowStockThreshold     = (state) => state?.products?.lowStockThreshold ?? 10;

// ── Metas secondaires ─────────────────────────────────────────────────────────
export const selectByCategoryMeta    = (state) => state?.products?.byCategoryMeta    || null;
export const selectByFournisseurMeta = (state) => state?.products?.byFournisseurMeta || null;
export const selectLowStockMeta      = (state) => state?.products?.lowStockMeta      || null;

// ── Stats ─────────────────────────────────────────────────────────────────────
export const selectProductsStats = (state) => state?.products?.stats || {
  total: 0, actifs: 0, inactifs: 0,
  stock_total: 0, stock_faible: 0, prix_moyen: 0,
};

// ── Pagination ────────────────────────────────────────────────────────────────
export const selectProductsPagination = (state) => ({
  currentPage: state?.products?.meta?.current_page || 1,
  lastPage:    state?.products?.meta?.last_page    || 1,
  total:       state?.products?.meta?.total        || 0,
  perPage:     state?.products?.meta?.per_page     || 10,
});

export const selectProductsTotal = (state) => {
  const metaTotal = state?.products?.meta?.total;
  return metaTotal !== undefined ? metaTotal : selectProductsData(state).length;
};

// ── Loading granulaire ────────────────────────────────────────────────────────
export const selectProductsLoadingStates            = (state) => state?.products?.loadingStates || {};
export const selectProductFetchLoading              = (state) => state?.products?.loadingStates?.fetch              || false;
export const selectProductFetchOneLoading           = (state) => state?.products?.loadingStates?.fetchOne           || false;
export const selectProductCreateLoading             = (state) => state?.products?.loadingStates?.create             || false;
export const selectProductUpdateLoading             = (state) => state?.products?.loadingStates?.update             || false;
export const selectProductDeleteLoading             = (state) => state?.products?.loadingStates?.delete             || false;
export const selectProductFetchByCategoryLoading    = (state) => state?.products?.loadingStates?.fetchByCategory    || false;
export const selectProductFetchByFournisseurLoading = (state) => state?.products?.loadingStates?.fetchByFournisseur || false;
export const selectProductFetchLowStockLoading      = (state) => state?.products?.loadingStates?.fetchLowStock      || false;

// Global : true si n'importe quelle opération tourne
export const selectProductsLoading = (state) =>
  Object.values(state?.products?.loadingStates || {}).some(Boolean);

// ── Error / Success ───────────────────────────────────────────────────────────
export const selectProductsError   = (state) => state?.products?.error   || null;
export const selectProductsSuccess = (state) => state?.products?.success || false;

// ── Utilitaire ────────────────────────────────────────────────────────────────
export const selectProductById = (state, id) =>
  selectProductsData(state).find((p) => p.id === id) || null;

// ── Aliases ───────────────────────────────────────────────────────────────────
export const selectProducts       = selectProductsData;
export const selectProductLoading = selectProductsLoading;
export const selectProductError   = selectProductsError;
export const selectProductSuccess = selectProductsSuccess;