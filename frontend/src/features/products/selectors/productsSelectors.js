import { createSelector } from "@reduxjs/toolkit";

// Fallbacks stables - meme reference -> pas de rerender
const EMPTY_ARRAY   = [];
const EMPTY_LOADING = {};
const DEFAULT_STATS = {
  total: 0, actifs: 0, inactifs: 0,
  stock_total: 0, stock_faible: 0, prix_moyen: 0,
};

// Data principale
export const selectProductsData         = (state) => state?.products?.data             || EMPTY_ARRAY;
export const selectCurrentProduct       = (state) => state?.products?.current          || null;

// Listes secondaires
export const selectProductsByCategory    = (state) => state?.products?.byCategory       || EMPTY_ARRAY;
export const selectProductsByFournisseur = (state) => state?.products?.byFournisseur    || EMPTY_ARRAY;
export const selectLowStockProducts      = (state) => state?.products?.lowStock         || EMPTY_ARRAY;
export const selectLowStockThreshold     = (state) => state?.products?.lowStockThreshold ?? 10;

// Metas secondaires (valeurs primitives ou null -> pas de probleme de reference)
export const selectByCategoryMeta     = (state) => state?.products?.byCategoryMeta     || null;
export const selectByFournisseurMeta  = (state) => state?.products?.byFournisseurMeta  || null;
export const selectLowStockMeta       = (state) => state?.products?.lowStockMeta       || null;

// Stats - fallback constant stable, pas de createSelector
export const selectProductsStats = (state) => state?.products?.stats || DEFAULT_STATS;

// Pagination - MEMOÏSE car retourne un objet construit
const selectProductsMeta = (state) => state?.products?.meta;

export const selectProductsPagination = createSelector(
  selectProductsMeta,
  (meta) => ({
    currentPage: meta?.current_page || 1,
    lastPage:    meta?.last_page    || 1,
    total:       meta?.total        || 0,
    perPage:     meta?.per_page     || 10,
  })
);

export const selectProductsTotal = (state) => {
  const metaTotal = state?.products?.meta?.total;
  return metaTotal !== undefined ? metaTotal : selectProductsData(state).length;
};

// Loading granulaire
export const selectProductsLoadingStates            = (state) => state?.products?.loadingStates || EMPTY_LOADING;
export const selectProductFetchLoading              = (state) => state?.products?.loadingStates?.fetch               || false;
export const selectProductFetchOneLoading           = (state) => state?.products?.loadingStates?.fetchOne            || false;
export const selectProductCreateLoading             = (state) => state?.products?.loadingStates?.create              || false;
export const selectProductUpdateLoading             = (state) => state?.products?.loadingStates?.update              || false;
export const selectProductDeleteLoading             = (state) => state?.products?.loadingStates?.delete              || false;
export const selectProductFetchByCategoryLoading    = (state) => state?.products?.loadingStates?.fetchByCategory     || false;
export const selectProductFetchByFournisseurLoading = (state) => state?.products?.loadingStates?.fetchByFournisseur  || false;
export const selectProductFetchLowStockLoading      = (state) => state?.products?.loadingStates?.fetchLowStock       || false;

// Global - MEMOÏSE car derive un booleen depuis un objet
export const selectProductsLoading = createSelector(
  selectProductsLoadingStates,
  (loadingStates) => Object.values(loadingStates).some(Boolean)
);

// Error / Success
export const selectProductsError   = (state) => state?.products?.error   || null;
export const selectProductsSuccess = (state) => state?.products?.success  || false;

// Utilitaire - factory pattern pour memorisation par id
export const selectProductById = (id) =>
  createSelector(selectProductsData, (data) => data.find((p) => p.id === id) || null);

// Aliases
export const selectProducts       = selectProductsData;
export const selectProductLoading = selectProductsLoading;
export const selectProductError   = selectProductsError;
export const selectProductSuccess = selectProductsSuccess;