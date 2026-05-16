import { createSelector } from "@reduxjs/toolkit";

// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS — fournisseur
// ─────────────────────────────────────────────────────────────────────────────

// ─── Sélecteurs primitifs (pas de nouvel objet → pas de problème) ─────────────
const selectFournisseurState = (state) => state?.fournisseur;

export const selectFournisseursData = (state) =>
  state?.fournisseur?.data || [];
export const selectCurrentFournisseur = (state) =>
  state?.fournisseur?.current || null;
export const selectActiveFournisseurs = (state) =>
  state?.fournisseur?.activeList || [];
export const selectFournisseurVilles = (state) =>
  state?.fournisseur?.villesfournisseurs || [];

// ─── Stats globales ── MÉMOÏSÉ (retourne un objet) ───────────────────────────
export const selectGlobalStats = createSelector(
  selectFournisseurState,
  (fournisseur) =>
    fournisseur?.globalStats || {
      total: 0,
      active: 0,
      inactive: 0,
      ville: 0,
    }
);

// ─── Pagination ── MÉMOÏSÉ (retourne un objet) ────────────────────────────────
const selectFournisseurMeta = (state) => state?.fournisseur?.meta;

export const selectFournisseurPagination = createSelector(
  selectFournisseurMeta,
  (meta) => ({
    currentPage: meta?.current_page || 1,
    lastPage: meta?.last_page || 1,
    total: meta?.total || 0,
    perPage: meta?.per_page || 10,
  })
);

export const selectFournisseursCount = (state) => {
  const metaTotal = state?.fournisseur?.meta?.total;
  return metaTotal !== undefined
    ? metaTotal
    : selectFournisseursData(state).length;
};

// ─── Loading granulaire ───────────────────────────────────────────────────────

// Fallback stable défini UNE seule fois → même référence à chaque appel
const EMPTY_LOADING_STATES = {};

// Pas de createSelector : on retourne la référence du slice directement
// (ou le fallback stable), donc jamais de nouvelle référence inutile.
export const selectFournisseurLoadingStates = (state) =>
  state?.fournisseur?.loadingStates || EMPTY_LOADING_STATES;

export const selectFournisseurFetchLoading = (state) =>
  state?.fournisseur?.loadingStates?.fetch || false;
export const selectFournisseurFetchOneLoading = (state) =>
  state?.fournisseur?.loadingStates?.fetchOne || false;
export const selectFournisseurCreateLoading = (state) =>
  state?.fournisseur?.loadingStates?.create || false;
export const selectFournisseurUpdateLoading = (state) =>
  state?.fournisseur?.loadingStates?.update || false;
export const selectFournisseurDeleteLoading = (state) =>
  state?.fournisseur?.loadingStates?.delete || false;
export const selectFournisseurActiveLoading = (state) =>
  state?.fournisseur?.loadingStates?.fetchActive || false;
export const selectFournisseurVillesLoading = (state) =>
  state?.fournisseur?.loadingStates?.fetchVilles || false;

// ✅ Gardé pour compatibilité
export const selectFournisseurSearchLoading = (_state) => false;

// Global : true si n'importe quelle opération tourne — MÉMOÏSÉ
export const selectFournisseursLoading = createSelector(
  selectFournisseurLoadingStates,
  (loadingStates) => Object.values(loadingStates).some(Boolean)
);

// ─── Error / Success ──────────────────────────────────────────────────────────
export const selectFournisseursError = (state) =>
  state?.fournisseur?.error || null;
export const selectFournisseursSuccess = (state) =>
  state?.fournisseur?.success || false;

// ─── Utilitaire ── MÉMOÏSÉ (fabriqué via factory pour accéder à l'id) ─────────
export const selectFournisseurById = (id) =>
  createSelector(selectFournisseursData, (data) =>
    data.find((f) => f.id === id) || null
  );

// ─── Aliases ──────────────────────────────────────────────────────────────────
export const selectFournisseurs = selectFournisseursData;
export const selectFournisseurLoading = selectFournisseursLoading;
export const selectFournisseurError = selectFournisseursError;
export const selectFournisseurSuccess = selectFournisseursSuccess;