import { createSelector } from "@reduxjs/toolkit";

// Fallbacks stables
const EMPTY_ARRAY   = [];
const EMPTY_LOADING = {};
const DEFAULT_STATS = {
  total: 0, non_encaisse: 0, encaisse: 0,
  impaye: 0, annule: 0, echeance_proche: 0,
};

// Data principale
export const selectChequesData       = (state) => state?.cheques?.data    || EMPTY_ARRAY;
export const selectCurrentCheque     = (state) => state?.cheques?.current || null;

// Echeances
export const selectEcheancesProches      = (state) => state?.cheques?.echeancesProches      || EMPTY_ARRAY;
export const selectEcheancesProchesCount = (state) => state?.cheques?.echeancesProchesCount ?? 0;

// Stats - fallback constant, pas de createSelector
export const selectChequesStats   = (state) => state?.cheques?.stats   || DEFAULT_STATS;
export const selectBanquesOptions = (state) => state?.cheques?.banques || EMPTY_ARRAY;

// Pagination - MEMOÏSE
const selectChequesMeta = (state) => state?.cheques?.meta;

export const selectChequesPagination = createSelector(
  selectChequesMeta,
  (meta) => ({
    currentPage: meta?.current_page || 1,
    lastPage:    meta?.last_page    || 1,
    total:       meta?.total        || 0,
    perPage:     meta?.per_page     || 10,
  })
);

export const selectChequesTotal = (state) => {
  const metaTotal = state?.cheques?.meta?.total;
  return metaTotal !== undefined ? metaTotal : selectChequesData(state).length;
};

// Loading granulaire
export const selectChequesLoadingStates       = (state) => state?.cheques?.loadingStates || EMPTY_LOADING;
export const selectChequeFetchLoading         = (state) => state?.cheques?.loadingStates?.fetch          || false;
export const selectChequeFetchOneLoading      = (state) => state?.cheques?.loadingStates?.fetchOne       || false;
export const selectChequeCreateLoading        = (state) => state?.cheques?.loadingStates?.create         || false;
export const selectChequeUpdateLoading        = (state) => state?.cheques?.loadingStates?.update         || false;
export const selectChequeDeleteLoading        = (state) => state?.cheques?.loadingStates?.delete         || false;
export const selectChequeEncaisserLoading     = (state) => state?.cheques?.loadingStates?.encaisser      || false;
export const selectChequeMarquerImpayeLoading = (state) => state?.cheques?.loadingStates?.marquerImpaye  || false;
export const selectChequeAnnulerLoading       = (state) => state?.cheques?.loadingStates?.annuler        || false;
export const selectChequeEcheancesLoading     = (state) => state?.cheques?.loadingStates?.echeances      || false;

// Global - MEMOÏSE
export const selectChequesLoading = createSelector(
  selectChequesLoadingStates,
  (loadingStates) => Object.values(loadingStates).some(Boolean)
);

// Error / Success
export const selectChequesError   = (state) => state?.cheques?.error   || null;
export const selectChequesSuccess = (state) => state?.cheques?.success  || false;

// Utilitaire - factory pattern
export const selectChequeById = (id) =>
  createSelector(selectChequesData, (data) => data.find((c) => c.id === id) || null);

// Filtres par statut - MEMOÏSES (filter() retourne toujours un nouveau tableau)
export const selectChequesNonEncaisses = createSelector(
  selectChequesData,
  (data) => data.filter((c) => c.statut === "non_encaisse")
);

export const selectChequesEncaisses = createSelector(
  selectChequesData,
  (data) => data.filter((c) => c.statut === "encaisse")
);

export const selectChequesImpayes = createSelector(
  selectChequesData,
  (data) => data.filter((c) => c.statut === "impaye")
);

export const selectChequesByClient = (state) => state?.cheques?.databyClient;

// Aliases
export const selectCheques       = selectChequesData;
export const selectChequeLoading = selectChequesLoading;
export const selectChequeError   = selectChequesError;
export const selectChequeSuccess = selectChequesSuccess;