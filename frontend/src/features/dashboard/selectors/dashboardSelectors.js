export const selectDashboardData = (state) => state.dashboard?.data;
export const selectDashboardLoading = (state) =>
  Boolean(state.dashboard?.loadingStates?.fetch);
export const selectDashboardError = (state) => state.dashboard?.error;

export const selectDashboardSummary = (state) =>
  selectDashboardData(state)?.summary || {};
export const selectDashboardFinance = (state) =>
  selectDashboardData(state)?.finance || {};
export const selectDashboardStock = (state) =>
  selectDashboardData(state)?.stock || {};
export const selectDashboardTasks = (state) =>
  selectDashboardData(state)?.tasks || {};
export const selectDashboardAnalytics = (state) =>
  selectDashboardData(state)?.analytics || {};
export const selectDashboardRecentDocuments = (state) =>
  selectDashboardData(state)?.recent_documents || [];
export const selectDashboardRecentUsers = (state) =>
  selectDashboardData(state)?.recent_users || [];
export const selectDashboardAlerts = (state) =>
  selectDashboardData(state)?.alerts || {};
