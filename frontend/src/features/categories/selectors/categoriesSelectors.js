// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS — categories
// ─────────────────────────────────────────────────────────────────────────────

// ─── Data principale (liste paginée) ─────────────────────────────────────────
export const selectCategoriesData       = (state) => state?.categories?.data        || [];
export const selectCurrentCategory      = (state) => state?.categories?.current     || null;
export const selectActiveList           = (state) => state?.categories?.activeList  || [];
export const selectActiveWithCount      = (state) => state?.categories?.activeWithCount || [];

// ─── Stats (retournées par index()) ──────────────────────────────────────────
export const selectCategoriesStats      = (state) => state?.categories?.stats || { total: 0, actifs: 0, inactifs: 0 };

// ─── Pagination ───────────────────────────────────────────────────────────────
export const selectCategoriesPagination = (state) => ({
  currentPage: state?.categories?.meta?.current_page || 1,
  lastPage:    state?.categories?.meta?.last_page    || 1,
  total:       state?.categories?.meta?.total        || 0,
  perPage:     state?.categories?.meta?.per_page     || 10,
});

export const selectCategoriesTotal = (state) => {
  const metaTotal = state?.categories?.meta?.total;
  return metaTotal !== undefined ? metaTotal : selectCategoriesData(state).length;
};

// ─── Loading granulaire ───────────────────────────────────────────────────────
export const selectCategoriesLoadingStates   = (state) => state?.categories?.loadingStates || {};
export const selectCategoryFetchLoading      = (state) => state?.categories?.loadingStates?.fetch        || false;
export const selectCategoryFetchOneLoading   = (state) => state?.categories?.loadingStates?.fetchOne     || false;
export const selectCategoryCreateLoading     = (state) => state?.categories?.loadingStates?.create       || false;
export const selectCategoryUpdateLoading     = (state) => state?.categories?.loadingStates?.update       || false;
export const selectCategoryDeleteLoading     = (state) => state?.categories?.loadingStates?.delete       || false;
export const selectCategoryFetchActiveLoading    = (state) => state?.categories?.loadingStates?.fetchActive    || false;
export const selectCategoryFetchWithCountLoading = (state) => state?.categories?.loadingStates?.fetchWithCount || false;
export const selectCategoryBulkUpdateLoading     = (state) => state?.categories?.loadingStates?.bulkUpdate    || false;

// Global : true si n'importe quelle opération tourne
export const selectCategoriesLoading = (state) =>
  Object.values(state?.categories?.loadingStates || {}).some(Boolean);

// ─── Error / Success ──────────────────────────────────────────────────────────
export const selectCategoriesError   = (state) => state?.categories?.error   || null;
export const selectCategoriesSuccess = (state) => state?.categories?.success || false;

// ─── Utilitaire ───────────────────────────────────────────────────────────────
export const selectCategoryById = (state, id) =>
  selectCategoriesData(state).find((c) => c.id === id) || null;

// ─── Aliases ──────────────────────────────────────────────────────────────────
export const selectCategories        = selectCategoriesData;
export const selectCategoryLoading   = selectCategoriesLoading;
export const selectCategoryError     = selectCategoriesError;
export const selectCategorySuccess   = selectCategoriesSuccess;