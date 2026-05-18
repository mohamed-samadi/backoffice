import { createSelector } from "@reduxjs/toolkit";

const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});

const DEFAULT_DOCUMENT_STATS = Object.freeze({
  total: 0,
  factures: 0,
  devis: 0,
  bon_livraison: 0,
  payes: 0,
  impayes: 0,
  total_ttc: 0,
  reste_a_payer: 0,
});

const DEFAULT_GLOBAL_STATS = Object.freeze({
  total: 0,
  by_type: Object.freeze({
    factures: 0,
    devis: 0,
    bon_livraison: 0,
  }),
  by_payment_status: Object.freeze({
    payes: 0,
    partiels: 0,
    impayes: 0,
  }),
  amounts: Object.freeze({
    total_ht: 0,
    total_tva: 0,
    total_ttc: 0,
    montant_paye: 0,
    reste_a_payer: 0,
  }),
});

export const selectDocumentsData = (state) =>
  state?.documents?.data || EMPTY_ARRAY;
export const selectCurrentDocument = (state) =>
  state?.documents?.current || null;

const selectDocumentsState = (state) => state?.documents;

export const selectDocumentsLoadingStates = (state) =>
  state?.documents?.loadingStates || EMPTY_OBJECT;
export const selectDocumentFetchLoading = (state) =>
  state?.documents?.loadingStates?.fetch || false;
export const selectDocumentFetchStatsLoading = (state) =>
  state?.documents?.loadingStates?.fetchStats || false;
export const selectDocumentFetchGlobalStatsLoading = (state) =>
  state?.documents?.loadingStates?.fetchGlobalStats || false;
export const selectDocumentFetchOneLoading = (state) =>
  state?.documents?.loadingStates?.fetchOne || false;
export const selectDocumentCreateLoading = (state) =>
  state?.documents?.loadingStates?.create || false;
export const selectDocumentUpdateLoading = (state) =>
  state?.documents?.loadingStates?.update || false;
export const selectDocumentDeleteLoading = (state) =>
  state?.documents?.loadingStates?.delete || false;

export const selectDocumentsLoading = createSelector(
  [selectDocumentsLoadingStates],
  (loadingStates) => Object.values(loadingStates).some(Boolean),
);

export const selectDocumentsError = (state) => state?.documents?.error || null;
export const selectDocumentsSuccess = (state) =>
  state?.documents?.success || false;

export const selectDocumentById = (state, id) =>
  selectDocumentsData(state).find((document) => document.id === id) || null;

export const selectDocumentsStats = createSelector(
  [selectDocumentsState],
  (documents) => documents?.stats || DEFAULT_DOCUMENT_STATS,
);

export const selectDocumentsGlobalStats = createSelector(
  [selectDocumentsState],
  (documents) => documents?.globalStats || DEFAULT_GLOBAL_STATS,
);

export const selectDocumentsTotal = (state) => selectDocumentsData(state).length;

export const selectDocuments = selectDocumentsData;
export const selectDocumentLoading = selectDocumentsLoading;
export const selectDocumentError = selectDocumentsError;
export const selectDocumentSuccess = selectDocumentsSuccess;

export const selectPaginationData = (state) =>
  state?.documents?.pagination || EMPTY_OBJECT;
export const selectCurrentPage = (state) =>
  selectPaginationData(state).currentPage || 1;
export const selectLastPage = (state) => selectPaginationData(state).lastPage || 1;
export const selectTotalDocuments = (state) =>
  selectPaginationData(state).total || 0;
export const selectPerPage = (state) => selectPaginationData(state).perPage || 10;
