// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS — cheques
// ─────────────────────────────────────────────────────────────────────────────

// ── Data principale ───────────────────────────────────────────────────────
export const selectChequesData   = (state) => state?.cheques?.data    || [];
export const selectCurrentCheque = (state) => state?.cheques?.current || null;

// ── Échéances proches ─────────────────────────────────────────────────────
export const selectEcheancesProches      = (state) => state?.cheques?.echeancesProches      || [];
export const selectEcheancesProchesCount = (state) => state?.cheques?.echeancesProchesCount ?? 0;

// ── Stats ─────────────────────────────────────────────────────────────────
export const selectChequesStats = (state) => state?.cheques?.stats || {
  total: 0, non_encaisse: 0, encaisse: 0,
  impaye: 0, annule: 0, echeance_proche: 0,
};

// ── Pagination ────────────────────────────────────────────────────────────
export const selectChequesPagination = (state) => ({
  currentPage: state?.cheques?.meta?.current_page || 1,
  lastPage:    state?.cheques?.meta?.last_page    || 1,
  total:       state?.cheques?.meta?.total        || 0,
  perPage:     state?.cheques?.meta?.per_page     || 10,
});

export const selectChequesTotal = (state) => {
  const metaTotal = state?.cheques?.meta?.total;
  return metaTotal !== undefined ? metaTotal : selectChequesData(state).length;
};

// ── Loading granulaire ────────────────────────────────────────────────────
export const selectChequesLoadingStates      = (state) => state?.cheques?.loadingStates || {};
export const selectChequeFetchLoading        = (state) => state?.cheques?.loadingStates?.fetch         || false;
export const selectChequeFetchOneLoading     = (state) => state?.cheques?.loadingStates?.fetchOne      || false;
export const selectChequeCreateLoading       = (state) => state?.cheques?.loadingStates?.create        || false;
export const selectChequeUpdateLoading       = (state) => state?.cheques?.loadingStates?.update        || false;
export const selectChequeDeleteLoading       = (state) => state?.cheques?.loadingStates?.delete        || false;
export const selectChequeEncaisserLoading    = (state) => state?.cheques?.loadingStates?.encaisser     || false;
export const selectChequeMarquerImpayeLoading= (state) => state?.cheques?.loadingStates?.marquerImpaye || false;
export const selectChequeAnnulerLoading      = (state) => state?.cheques?.loadingStates?.annuler       || false;
export const selectChequeEcheancesLoading    = (state) => state?.cheques?.loadingStates?.echeances     || false;

// ── Global loading ────────────────────────────────────────────────────────
export const selectChequesLoading = (state) =>
  Object.values(state?.cheques?.loadingStates || {}).some(Boolean);

// ── Error / Success ───────────────────────────────────────────────────────
export const selectChequesError   = (state) => state?.cheques?.error   || null;
export const selectChequesSuccess = (state) => state?.cheques?.success || false;

// ── Utilitaires ───────────────────────────────────────────────────────────
export const selectChequeById = (state, id) =>
  selectChequesData(state).find((c) => c.id === id) || null;

// ── Sélecteurs filtrés par statut (utiles pour les vues kanban/dashboard) ─
export const selectChequesNonEncaisses = (state) =>
  selectChequesData(state).filter((c) => c.statut === "non_encaisse");

export const selectChequesEncaisses = (state) =>
  selectChequesData(state).filter((c) => c.statut === "encaisse");

export const selectChequesImpayes = (state) =>
  selectChequesData(state).filter((c) => c.statut === "impaye");

export const selectCheques       = selectChequesData;
export const selectChequeLoading = selectChequesLoading;
export const selectChequeError   = selectChequesError;
export const selectChequeSuccess = selectChequesSuccess;
export const selectChequesByClient = (state) =>
  state?.cheques?.databyClient;