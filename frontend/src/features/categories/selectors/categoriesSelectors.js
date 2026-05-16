import { createSelector } from "@reduxjs/toolkit";

// Fallbacks stables - meme reference -> pas de rerender
const EMPTY_ARRAY   = [];
const EMPTY_LOADING = {};
const DEFAULT_STATS = { total: 0, actifs: 0, inactifs: 0 };

// Data principale
export const selectCategoriesData     = (state) => state?.categories?.data            || EMPTY_ARRAY;
export const selectCurrentCategory    = (state) => state?.categories?.current         || null;
export const selectActiveList         = (state) => state?.categories?.activeList      || EMPTY_ARRAY;
export const selectActiveWithCount    = (state) => state?.categories?.activeWithCount || EMPTY_ARRAY;

// Stats - fallback constant stable, pas de createSelector
export const selectCategoriesStats = (state) => state?.categories?.stats || DEFAULT_STATS;

// Pagination - MEMOÏSE car retourne un objet construit
const selectCategoriesMeta = (state) => state?.categories?.meta;

export const selectCategoriesPagination = createSelector(
  selectCategoriesMeta,
  (meta) => ({
    currentPage: meta?.current_page || 1,
    lastPage:    meta?.last_page    || 1,
    total:       meta?.total        || 0,
    perPage:     meta?.per_page     || 10,
  })
);

export const selectCategoriesTotal = (state) => {
  const metaTotal = state?.categories?.meta?.total;
  return metaTotal !== undefined ? metaTotal : selectCategoriesData(state).length;
};

// Loading granulaire
export const selectCategoriesLoadingStates       = (state) => state?.categories?.loadingStates || EMPTY_LOADING;
export const selectCategoryFetchLoading          = (state) => state?.categories?.loadingStates?.fetch           || false;
export const selectCategoryFetchOneLoading       = (state) => state?.categories?.loadingStates?.fetchOne        || false;
export const selectCategoryCreateLoading         = (state) => state?.categories?.loadingStates?.create          || false;
export const selectCategoryUpdateLoading         = (state) => state?.categories?.loadingStates?.update          || false;
export const selectCategoryDeleteLoading         = (state) => state?.categories?.loadingStates?.delete          || false;
export const selectCategoryFetchActiveLoading    = (state) => state?.categories?.loadingStates?.fetchActive     || false;
export const selectCategoryFetchWithCountLoading = (state) => state?.categories?.loadingStates?.fetchWithCount  || false;
export const selectCategoryBulkUpdateLoading     = (state) => state?.categories?.loadingStates?.bulkUpdate      || false;

// Global - MEMOÏSE car derive un booleen depuis un objet
export const selectCategoriesLoading = createSelector(
  selectCategoriesLoadingStates,
  (loadingStates) => Object.values(loadingStates).some(Boolean)
);

// Error / Success
export const selectCategoriesError   = (state) => state?.categories?.error   || null;
export const selectCategoriesSuccess = (state) => state?.categories?.success  || false;

// Utilitaire - factory pattern pour memorisation par id
export const selectCategoryById = (id) =>
  createSelector(selectCategoriesData, (data) => data.find((c) => c.id === id) || null);

// Aliases
export const selectCategories       = selectCategoriesData;
export const selectCategoryLoading  = selectCategoriesLoading;
export const selectCategoryError    = selectCategoriesError;
export const selectCategorySuccess  = selectCategoriesSuccess;