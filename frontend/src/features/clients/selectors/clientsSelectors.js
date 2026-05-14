// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS — clients
// ─────────────────────────────────────────────────────────────────────────────
import { createSelector } from "@reduxjs/toolkit";

// ── Data principale (liste paginée) ──────────────────────────────────────────
export const selectClientsData = (state) => state?.clients?.data || [];
export const selectCurrentClient = (state) => state?.clients?.current || null;

// ── Liste active légère (selects — chèques, tâches, documents…) ──────────────
export const selectActiveClients = (state) =>
  state?.clients?.activeClients || [];

// ── Stats (retournées par index()) ────────────────────────────────────────────
export const selectClientsStats = (state) =>
  state?.clients?.stats || {
    total: 0,
    actifs: 0,
    inactifs: 0,
  };

// ── Pagination ────────────────────────────────────────────────────────────────
export const selectClientsPagination = (state) => ({
  currentPage: state?.clients?.meta?.current_page || 1,
  lastPage: state?.clients?.meta?.last_page || 1,
  total: state?.clients?.meta?.total || 0,
  perPage: state?.clients?.meta?.per_page || 10,
});

export const selectClientsTotal = (state) => {
  const metaTotal = state?.clients?.meta?.total;
  return metaTotal !== undefined ? metaTotal : selectClientsData(state).length;
};

// ── Loading granulaire ────────────────────────────────────────────────────────
export const selectClientsLoadingStates = (state) =>
  state?.clients?.loadingStates || {};
export const selectClientFetchLoading = (state) =>
  state?.clients?.loadingStates?.fetch || false;
export const selectClientFetchOneLoading = (state) =>
  state?.clients?.loadingStates?.fetchOne || false;
export const selectClientCreateLoading = (state) =>
  state?.clients?.loadingStates?.create || false;
export const selectClientUpdateLoading = (state) =>
  state?.clients?.loadingStates?.update || false;
export const selectClientDeleteLoading = (state) =>
  state?.clients?.loadingStates?.delete || false;
export const selectClientFetchActiveLoading = (state) =>
  state?.clients?.loadingStates?.fetchActive || false;

// Global : true si n'importe quelle opération tourne
export const selectClientsLoading = (state) =>
  Object.values(state?.clients?.loadingStates || {}).some(Boolean);

// ── Error / Success ───────────────────────────────────────────────────────────
export const selectClientsError = (state) => state?.clients?.error || null;
export const selectClientsSuccess = (state) => state?.clients?.success || false;

// ── Utilitaires ───────────────────────────────────────────────────────────────
export const selectClientById = (state, id) =>
  selectClientsData(state).find((c) => c.id === id) || null;

// ✅ Memoized: only returns new array if data changes or filter result changes
export const selectClientsActifs = createSelector([selectClientsData], (data) =>
  data.filter((c) => c.statut === "active"),
);

export const selectClientsInactifs = createSelector(
  [selectClientsData],
  (data) => data.filter((c) => c.statut === "inactive"),
);

// ── Aliases ───────────────────────────────────────────────────────────────────
export const selectClients = selectClientsData;
export const selectClientLoading = selectClientsLoading;
export const selectClientError = selectClientsError;
export const selectClientSuccess = selectClientsSuccess;
