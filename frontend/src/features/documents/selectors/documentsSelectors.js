


export const selectDocumentsData = (state) => state?.documents?.data || [];
export const selectCurrentDocument = (state) =>
  state?.documents?.current || null;

export const selectDocumentsLoadingStates = (state) =>
  state?.documents?.loadingStates || {};
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

export const selectDocumentsLoading = (state) =>
  Object.values(state?.documents?.loadingStates || {}).some(Boolean);

export const selectDocumentsError = (state) => state?.documents?.error || null;
export const selectDocumentsSuccess = (state) =>
  state?.documents?.success || false;

export const selectDocumentById = (state, id) =>
  selectDocumentsData(state).find((document) => document.id === id) || null;

export const selectDocumentsStats = (state) =>
  state?.documents?.stats || {
    total: 0,
    factures: 0,
    devis: 0,
    bon_livraison: 0,
    payes: 0,
    impayes: 0,
    total_ttc: 0,
    reste_a_payer: 0,
  };

export const selectDocumentsGlobalStats = (state) =>
  state?.documents?.globalStats || {
    total: 0,
    by_type: {
      factures: 0,
      devis: 0,
      bon_livraison: 0,
    },
    by_payment_status: {
      payes: 0,
      partiels: 0,
      impayes: 0,
    },
    amounts: {
      total_ht: 0,
      total_tva: 0,
      total_ttc: 0,
      montant_paye: 0,
      reste_a_payer: 0,
    },
  };

export const selectDocumentsTotal = (state) =>
  selectDocumentsData(state).length;

export const selectDocuments = selectDocumentsData;
export const selectDocumentLoading = selectDocumentsLoading;
export const selectDocumentError = selectDocumentsError;
export const selectDocumentSuccess = selectDocumentsSuccess;

// Pagination selectors
export const selectPaginationData = (state) =>
  state?.documents?.pagination || {};
export const selectCurrentPage = (state) =>
  selectPaginationData(state).currentPage || 1;
export const selectLastPage = (state) =>
  selectPaginationData(state).lastPage || 1;
export const selectTotalDocuments = (state) =>
  selectPaginationData(state).total || 0;
export const selectPerPage = (state) =>
  selectPaginationData(state).perPage || 10;
