// ── Tasks ─────────────────────────────────────────────────────────────────
export const selectTasksData       = (state) => state?.tasks?.data        || [];
export const selectCurrentTask     = (state) => state?.tasks?.current     || null;
export const selectOverdueTasks    = (state) => state?.tasks?.overdueTasks || [];
export const selectOverdueTasksMeta= (state) => state?.tasks?.overdueTasksMeta || null;

export const selectTasksStats = (state) => state?.tasks?.stats || {
  total: 0, todo: 0, in_progress: 0, completed: 0, urgent: 0, overdue: 0,
};

export const selectTasksPagination = (state) => ({
  currentPage: state?.tasks?.meta?.current_page || 1,
  lastPage:    state?.tasks?.meta?.last_page    || 1,
  total:       state?.tasks?.meta?.total        || 0,
  perPage:     state?.tasks?.meta?.per_page     || 10,
});

export const selectTasksTotal = (state) => {
  const metaTotal = state?.tasks?.meta?.total;
  return metaTotal !== undefined ? metaTotal : selectTasksData(state).length;
};

// ── Loading granulaire ────────────────────────────────────────────────────
export const selectTasksLoadingStates            = (state) => state?.tasks?.loadingStates || {};
export const selectTaskFetchLoading              = (state) => state?.tasks?.loadingStates?.fetch                 || false;
export const selectTaskFetchOneLoading           = (state) => state?.tasks?.loadingStates?.fetchOne              || false;
export const selectTaskCreateLoading             = (state) => state?.tasks?.loadingStates?.create                || false;
export const selectTaskUpdateLoading             = (state) => state?.tasks?.loadingStates?.update                || false;
export const selectTaskDeleteLoading             = (state) => state?.tasks?.loadingStates?.delete                || false;
export const selectTaskUpdateStatusLoading       = (state) => state?.tasks?.loadingStates?.updateStatus          || false;
export const selectTaskFetchOverdueLoading       = (state) => state?.tasks?.loadingStates?.fetchOverdue          || false;
export const selectTaskCategoryFetchLoading      = (state) => state?.tasks?.loadingStates?.fetchCategories       || false;
export const selectTaskCategoryCreateLoading     = (state) => state?.tasks?.loadingStates?.createCategory        || false;
export const selectTaskCategoryUpdateLoading     = (state) => state?.tasks?.loadingStates?.updateCategory        || false;
export const selectTaskCategoryDeleteLoading     = (state) => state?.tasks?.loadingStates?.deleteCategory        || false;

export const selectTasksLoading = (state) =>
  Object.values(state?.tasks?.loadingStates || {}).some(Boolean);

// ── Error / Success ───────────────────────────────────────────────────────
export const selectTasksError   = (state) => state?.tasks?.error   || null;
export const selectTasksSuccess = (state) => state?.tasks?.success || false;

// ── Categories ────────────────────────────────────────────────────────────
export const selectTaskCategories       = (state) => state?.tasks?.categories       || [];
export const selectActiveTaskCategories = (state) => state?.tasks?.activeCategories || [];

// ── Utilitaires ───────────────────────────────────────────────────────────
export const selectTaskById         = (state, id) => selectTasksData(state).find((t) => t.id === id) || null;
export const selectTaskCategoryById = (state, id) => selectTaskCategories(state).find((c) => c.id === id) || null;

// ── Aliases ───────────────────────────────────────────────────────────────
export const selectTasks        = selectTasksData;
export const selectTaskLoading  = selectTasksLoading;
export const selectTaskError    = selectTasksError;
export const selectTaskSuccess  = selectTasksSuccess;