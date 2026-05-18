import { createSelector } from "@reduxjs/toolkit";

const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_LOADING = Object.freeze({});

export const selectNotificationsData = (state) =>
  state?.notifications?.data || EMPTY_ARRAY;
export const selectNonLuesCount = (state) =>
  state?.notifications?.nonLuesCount ?? 0;
export const selectHasUnread = (state) =>
  (state?.notifications?.nonLuesCount ?? 0) > 0;

const selectNotificationsMeta = (state) => state?.notifications?.meta;

export const selectNotificationsPagination = createSelector(
  [selectNotificationsMeta],
  (meta) => ({
    currentPage: meta?.current_page || 1,
    lastPage: meta?.last_page || 1,
    total: meta?.total || 0,
    perPage: meta?.per_page || 20,
  }),
);

export const selectUnreadNotifications = createSelector(
  [selectNotificationsData],
  (data) => data.filter((notification) => !notification.lu),
);

export const selectReadNotifications = createSelector(
  [selectNotificationsData],
  (data) => data.filter((notification) => notification.lu),
);

export const selectNotifFetchLoading = (state) =>
  state?.notifications?.loadingStates?.fetch || false;
export const selectNotifMarkReadLoading = (state) =>
  state?.notifications?.loadingStates?.markRead || false;
export const selectNotifMarkAllLoading = (state) =>
  state?.notifications?.loadingStates?.markAllRead || false;
export const selectNotifDeleteLoading = (state) =>
  state?.notifications?.loadingStates?.delete || false;
export const selectNotifDeleteAllLoading = (state) =>
  state?.notifications?.loadingStates?.deleteAll || false;

const selectNotificationsLoadingStates = (state) =>
  state?.notifications?.loadingStates || EMPTY_LOADING;

export const selectNotificationsLoading = createSelector(
  [selectNotificationsLoadingStates],
  (loadingStates) => Object.values(loadingStates).some(Boolean),
);

export const selectNotificationsError = (state) =>
  state?.notifications?.error || null;
export const selectNotificationsSuccess = (state) =>
  state?.notifications?.success || false;
