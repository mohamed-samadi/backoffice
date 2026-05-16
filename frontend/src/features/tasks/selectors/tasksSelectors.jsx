import { createSelector } from "@reduxjs/toolkit";

// Fallbacks stables - meme reference -> pas de rerender
const EMPTY_ARRAY   = [];
const EMPTY_LOADING = {};
const DEFAULT_STATS = { total: 0, todo: 0, in_progress: 0, completed: 0, urgent: 0, overdue: 0 };

// Tasks
export const selectTasksData        = (state) => state?.tasks?.data             || EMPTY_ARRAY;
export const selectCurrentTask      = (state) => state?.tasks?.current          || null;
export const selectOverdueTasks     = (state) => state?.tasks?.overdueTasks     || EMPTY_ARRAY;
export const selectOverdueTasksMeta = (state) => state?.tasks?.overdueTasksMeta || null;

// Pas de createSelector : retourne la reference du slice ou le fallback constant
export const selectTasksStats = (state) => state?.tasks?.stats || DEFAULT_STATS;

// MEMOÏSE - transforme meta en objet shape different
const selectTasksMeta = (state) => state?.tasks?.meta;

export const selectTasksPagination = createSelector(
  selectTasksMeta,
  (meta) => ({
    currentPage: meta?.current_page || 1,
    lastPage:    meta?.last_page    || 1,
    total:       meta?.total        || 0,
    perPage:     meta?.per_page     || 10,
  })
);

export const selectTasksTotal = (state) => {
  const metaTotal = state?.tasks?.meta?.total;
  return metaTotal !== undefined ? metaTotal : selectTasksData(state).length;
};

// Loading granulaire
export const selectTasksLoadingStates        = (state) => state?.tasks?.loadingStates || EMPTY_LOADING;
export const selectTaskFetchLoading          = (state) => state?.tasks?.loadingStates?.fetch            || false;
export const selectTaskFetchOneLoading       = (state) => state?.tasks?.loadingStates?.fetchOne         || false;
export const selectTaskCreateLoading         = (state) => state?.tasks?.loadingStates?.create           || false;
export const selectTaskUpdateLoading         = (state) => state?.tasks?.loadingStates?.update           || false;
export const selectTaskDeleteLoading         = (state) => state?.tasks?.loadingStates?.delete           || false;
export const selectTaskUpdateStatusLoading   = (state) => state?.tasks?.loadingStates?.updateStatus     || false;
export const selectTaskFetchOverdueLoading   = (state) => state?.tasks?.loadingStates?.fetchOverdue     || false;
export const selectTaskCategoryFetchLoading  = (state) => state?.tasks?.loadingStates?.fetchCategories  || false;
export const selectTaskCategoryCreateLoading = (state) => state?.tasks?.loadingStates?.createCategory   || false;
export const selectTaskCategoryUpdateLoading = (state) => state?.tasks?.loadingStates?.updateCategory   || false;
export const selectTaskCategoryDeleteLoading = (state) => state?.tasks?.loadingStates?.deleteCategory   || false;

// MEMOÏSE - derive un booleen depuis loadingStates
export const selectTasksLoading = createSelector(
  selectTasksLoadingStates,
  (loadingStates) => Object.values(loadingStates).some(Boolean)
);

// Error / Success
export const selectTasksError   = (state) => state?.tasks?.error   || null;
export const selectTasksSuccess = (state) => state?.tasks?.success  || false;

// Categories
export const selectTaskCategories       = (state) => state?.tasks?.categories       || EMPTY_ARRAY;
export const selectActiveTaskCategories = (state) => state?.tasks?.activeCategories || EMPTY_ARRAY;

// Utilitaires - factory pattern pour memorisation par id
export const selectTaskById = (id) =>
  createSelector(selectTasksData, (data) => data.find((t) => t.id === id) || null);

export const selectTaskCategoryById = (id) =>
  createSelector(selectTaskCategories, (cats) => cats.find((c) => c.id === id) || null);

// Aliases
export const selectTasks       = selectTasksData;
export const selectTaskLoading = selectTasksLoading;
export const selectTaskError   = selectTasksError;
export const selectTaskSuccess = selectTasksSuccess;