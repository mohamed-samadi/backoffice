import { createSelector } from "@reduxjs/toolkit";

const EMPTY_OBJECT = Object.freeze({});
const EMPTY_ARRAY = Object.freeze([]);

export const selectDashboardData = (state) => state.dashboard?.data || null;
export const selectDashboardLoading = (state) =>
  Boolean(state.dashboard?.loadingStates?.fetch);
export const selectDashboardError = (state) => state.dashboard?.error;

export const selectDashboardSummary = createSelector(
  [selectDashboardData],
  (data) => data?.summary || EMPTY_OBJECT,
);

export const selectDashboardFinance = createSelector(
  [selectDashboardData],
  (data) => data?.finance || EMPTY_OBJECT,
);

export const selectDashboardStock = createSelector(
  [selectDashboardData],
  (data) => data?.stock || EMPTY_OBJECT,
);

export const selectDashboardTasks = createSelector(
  [selectDashboardData],
  (data) => data?.tasks || EMPTY_OBJECT,
);

export const selectDashboardAnalytics = createSelector(
  [selectDashboardData],
  (data) => data?.analytics || EMPTY_OBJECT,
);

export const selectDashboardRecentDocuments = createSelector(
  [selectDashboardData],
  (data) => data?.recent_documents || EMPTY_ARRAY,
);

export const selectDashboardRecentUsers = createSelector(
  [selectDashboardData],
  (data) => data?.recent_users || EMPTY_ARRAY,
);

export const selectDashboardAlerts = createSelector(
  [selectDashboardData],
  (data) => data?.alerts || EMPTY_OBJECT,
);
