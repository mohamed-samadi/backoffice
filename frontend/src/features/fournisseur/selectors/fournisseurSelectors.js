import { createSelector } from "@reduxjs/toolkit";

const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_LOADING_STATES = Object.freeze({});
const DEFAULT_GLOBAL_STATS = Object.freeze({
  total: 0,
  active: 0,
  inactive: 0,
  ville: 0,
});

const selectFournisseurState = (state) => state?.fournisseur;

export const selectFournisseursData = (state) =>
  state?.fournisseur?.data || EMPTY_ARRAY;
export const selectCurrentFournisseur = (state) =>
  state?.fournisseur?.current || null;
export const selectActiveFournisseurs = (state) =>
  state?.fournisseur?.activeList || EMPTY_ARRAY;
export const selectFournisseurVilles = (state) =>
  state?.fournisseur?.villesfournisseurs || EMPTY_ARRAY;

export const selectGlobalStats = createSelector(
  [selectFournisseurState],
  (fournisseur) => fournisseur?.globalStats || DEFAULT_GLOBAL_STATS,
);

const selectFournisseurMeta = (state) => state?.fournisseur?.meta;

export const selectFournisseurPagination = createSelector(
  [selectFournisseurMeta],
  (meta) => ({
    currentPage: meta?.current_page || 1,
    lastPage: meta?.last_page || 1,
    total: meta?.total || 0,
    perPage: meta?.per_page || 10,
  }),
);

export const selectFournisseursCount = (state) => {
  const metaTotal = state?.fournisseur?.meta?.total;
  return metaTotal !== undefined ? metaTotal : selectFournisseursData(state).length;
};

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
export const selectFournisseurSearchLoading = (_state) => false;

export const selectFournisseursLoading = createSelector(
  [selectFournisseurLoadingStates],
  (loadingStates) => Object.values(loadingStates).some(Boolean),
);

export const selectFournisseursError = (state) =>
  state?.fournisseur?.error || null;
export const selectFournisseursSuccess = (state) =>
  state?.fournisseur?.success || false;

export const selectFournisseurById = (id) =>
  createSelector(
    [selectFournisseursData],
    (data) => data.find((fournisseur) => fournisseur.id === id) || null,
  );

export const selectFournisseurs = selectFournisseursData;
export const selectFournisseurLoading = selectFournisseursLoading;
export const selectFournisseurError = selectFournisseursError;
export const selectFournisseurSuccess = selectFournisseursSuccess;
