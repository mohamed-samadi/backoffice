import { createSelector } from '@reduxjs/toolkit';
export const selectFournisseursData = (state) =>
  state?.fournisseur?.data || [];

export const selectCurrentFournisseur = (state) =>
  state?.fournisseur?.current || null;

// ─── Loading granulaire ───────────────────────────────────────────────────────
export const selectFournisseurLoadingStates = (state) =>
  state?.fournisseur?.loadingStates || {};
export const selectActiveFournisseurs = (state) =>
  state?.fournisseur?.activeList || [];
export const selectFournisseurFetchLoading = (state) =>
  state?.fournisseur?.loadingStates?.fetch || false;

export const selectFournisseurCreateLoading = (state) =>
  state?.fournisseur?.loadingStates?.create || false;

export const selectFournisseurUpdateLoading = (state) =>
  state?.fournisseur?.loadingStates?.update || false;

export const selectFournisseurDeleteLoading = (state) =>
  state?.fournisseur?.loadingStates?.delete || false;

export const selectFournisseurSearchLoading = (state) =>
  state?.fournisseur?.loadingStates?.search || false;
export const selectGlobalStats = (state) =>
  state?.fournisseur?.globalStats || { total: 0, active: 0, inactive: 0 ,ville : 0};
// ✅ Selector global : true si N'IMPORTE QUELLE opération est en cours
export const selectFournisseursLoading = (state) =>
  Object.values(state?.fournisseur?.loadingStates || {}).some(Boolean);

// ─── Status ──────────────────────────────────────────────────────────────────
export const selectFournisseursError = (state) =>
  state?.fournisseur?.error || null;

export const selectFournisseursSuccess = (state) =>
  state?.fournisseur?.success || false;

// ─── Pagination ───────────────────────────────────────────────────────────────
const selectFournisseurMetaRaw = (state) => state?.fournisseur?.meta;
export const selectFournisseurPagination = createSelector(
  [selectFournisseurMetaRaw],
  (meta) => ({
    currentPage: meta?.current_page || 1,
    lastPage:    meta?.last_page    || 1,
    total:       meta?.total        || 0,
    perPage:     meta?.per_page     || 10,
  })
);

export const selectFournisseursCount = (state) => {
  const metaTotal = state?.fournisseur?.meta?.total;
  return metaTotal !== undefined
    ? metaTotal
    : selectFournisseursData(state).length;
};

// ─── Utilitaire ───────────────────────────────────────────────────────────────
// Cherche dans les données actuellement chargées (page courante)
export const selectFournisseurById = (state, id) =>
  selectFournisseursData(state).find((f) => f.id === id) || null;

// ─────────────────────────────────────────────────────────────────────────────
// ALIASES — rétrocompatibilité (noms courts pratiques)
// ─────────────────────────────────────────────────────────────────────────────
export const selectFournisseurs      = selectFournisseursData;
export const selectFournisseurLoading = selectFournisseursLoading;
export const selectFournisseurError   = selectFournisseursError;
export const selectFournisseurSuccess = selectFournisseursSuccess;