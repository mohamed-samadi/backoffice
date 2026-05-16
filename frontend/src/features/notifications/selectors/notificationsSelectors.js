// ── Data ──────────────────────────────────────────────────────────────────
export const selectNotificationsData  = (state) => state?.notifications?.data         || [];
export const selectNonLuesCount       = (state) => state?.notifications?.nonLuesCount ?? 0;
export const selectHasUnread          = (state) => (state?.notifications?.nonLuesCount ?? 0) > 0;

// ── Pagination ────────────────────────────────────────────────────────────
export const selectNotificationsPagination = (state) => ({
  currentPage: state?.notifications?.meta?.current_page || 1,
  lastPage:    state?.notifications?.meta?.last_page    || 1,
  total:       state?.notifications?.meta?.total        || 0,
  perPage:     state?.notifications?.meta?.per_page     || 20,
});

// ── Filtrées localement ───────────────────────────────────────────────────
export const selectUnreadNotifications = (state) =>
  selectNotificationsData(state).filter((n) => !n.lu);

export const selectReadNotifications = (state) =>
  selectNotificationsData(state).filter((n) => n.lu);

// ── Loading granulaire ────────────────────────────────────────────────────
export const selectNotifFetchLoading      = (state) => state?.notifications?.loadingStates?.fetch       || false;
export const selectNotifMarkReadLoading   = (state) => state?.notifications?.loadingStates?.markRead    || false;
export const selectNotifMarkAllLoading    = (state) => state?.notifications?.loadingStates?.markAllRead || false;
export const selectNotifDeleteLoading     = (state) => state?.notifications?.loadingStates?.delete      || false;
export const selectNotifDeleteAllLoading  = (state) => state?.notifications?.loadingStates?.deleteAll   || false;

export const selectNotificationsLoading = (state) =>
  Object.values(state?.notifications?.loadingStates || {}).some(Boolean);

// ── Error / Success ───────────────────────────────────────────────────────
export const selectNotificationsError   = (state) => state?.notifications?.error   || null;
export const selectNotificationsSuccess = (state) => state?.notifications?.success || false;