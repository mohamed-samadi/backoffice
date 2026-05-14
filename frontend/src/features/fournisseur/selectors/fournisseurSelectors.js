// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS — fournisseur
// ─────────────────────────────────────────────────────────────────────────────

// ─── Data principale ──────────────────────────────────────────────────────────
export const selectFournisseursData = (state) => state?.fournisseur?.data || [];
export const selectCurrentFournisseur = (state) =>
  state?.fournisseur?.current || null;
export const selectActiveFournisseurs = (state) =>
  state?.fournisseur?.activeList || [];
export const selectFournisseurVilles = (state) =>
  state?.fournisseur?.villesfournisseurs || [];

// ─── Stats globales ───────────────────────────────────────────────────────────
export const selectGlobalStats = (state) =>
  state?.fournisseur?.globalStats || {
    total: 0,
    active: 0,
    inactive: 0,
    ville: 0,
  };

// ─── Pagination ───────────────────────────────────────────────────────────────
export const selectFournisseurPagination = (state) => ({
  currentPage: state?.fournisseur?.meta?.current_page || 1,
  lastPage: state?.fournisseur?.meta?.last_page || 1,
  total: state?.fournisseur?.meta?.total || 0,
  perPage: state?.fournisseur?.meta?.per_page || 10,
});

export const selectFournisseursCount = (state) => {
  const metaTotal = state?.fournisseur?.meta?.total;
  return metaTotal !== undefined
    ? metaTotal
    : selectFournisseursData(state).length;
};

// ─── Loading granulaire ───────────────────────────────────────────────────────
export const selectFournisseurLoadingStates = (state) =>
  state?.fournisseur?.loadingStates || {};
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

// ✅ Ancien selectFournisseurSearchLoading gardé pour compatibilité
export const selectFournisseurSearchLoading = (state) => false;

// Global : true si n'importe quelle opération tourne
export const selectFournisseursLoading = (state) =>
  Object.values(state?.fournisseur?.loadingStates || {}).some(Boolean);

// ─── Error / Success ──────────────────────────────────────────────────────────
export const selectFournisseursError = (state) =>
  state?.fournisseur?.error || null;
export const selectFournisseursSuccess = (state) =>
  state?.fournisseur?.success || false;

// ─── Utilitaire ───────────────────────────────────────────────────────────────
export const selectFournisseurById = (state, id) =>
  selectFournisseursData(state).find((f) => f.id === id) || null;

// ─── Aliases ──────────────────────────────────────────────────────────────────
export const selectFournisseurs = selectFournisseursData;
export const selectFournisseurLoading = selectFournisseursLoading;
export const selectFournisseurError = selectFournisseursError;
export const selectFournisseurSuccess = selectFournisseursSuccess;
