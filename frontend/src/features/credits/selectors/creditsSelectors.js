// creditsSelectors
// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS — credits
// ─────────────────────────────────────────────────────────────────────────────

// ─── Data ─────────────────────────────────────────────────────────────────────
export const selectCreditsData = (state) => state?.credits?.data || [];
export const selectCurrentCredit = (state) => state?.credits?.current || null;
export const selectEnRetardList = (state) => state?.credits?.enRetardList || [];
export const selectNumeroPreview = (state) =>
  state?.credits?.numeroPreview || "";

// ─── Stats ────────────────────────────────────────────────────────────────────
export const selectCreditsStats = (state) =>
  state?.credits?.stats || {
    total_credits: 0,
    montant_total: 0,
    montant_paye: 0,
    total_reste: 0,
    en_cours: 0,
    payes: 0,
    en_retard: 0,
  };

// ─── Pagination ───────────────────────────────────────────────────────────────
export const selectCreditsPagination = (state) => ({
  currentPage: state?.credits?.meta?.current_page || 1,
  lastPage: state?.credits?.meta?.last_page || 1,
  total: state?.credits?.meta?.total || 0,
  perPage: state?.credits?.meta?.per_page || 10,
});

export const selectCreditsTotal = (state) => {
  const metaTotal = state?.credits?.meta?.total;
  return metaTotal !== undefined ? metaTotal : selectCreditsData(state).length;
};

// ─── Loading granulaire ───────────────────────────────────────────────────────
export const selectCreditsLoadingStates = (state) =>
  state?.credits?.loadingStates || {};
export const selectCreditFetchLoading = (state) =>
  state?.credits?.loadingStates?.fetch || false;
export const selectCreditFetchOneLoading = (state) =>
  state?.credits?.loadingStates?.fetchOne || false;
export const selectCreditCreateLoading = (state) =>
  state?.credits?.loadingStates?.create || false;
export const selectCreditUpdateLoading = (state) =>
  state?.credits?.loadingStates?.update || false;
export const selectCreditDeleteLoading = (state) =>
  state?.credits?.loadingStates?.delete || false;
export const selectCreditPaiementLoading = (state) =>
  state?.credits?.loadingStates?.paiement || false;
export const selectCreditGenNumeroLoading = (state) =>
  state?.credits?.loadingStates?.generateNumero || false;
export const selectCreditEnRetardLoading = (state) =>
  state?.credits?.loadingStates?.enRetard || false;

// Global — true si n'importe quelle opération tourne
export const selectCreditsLoading = (state) =>
  Object.values(state?.credits?.loadingStates || {}).some(Boolean);

// ─── Error / Success ──────────────────────────────────────────────────────────
export const selectCreditsError = (state) => state?.credits?.error || null;
export const selectCreditsSuccess = (state) => state?.credits?.success || false;

// ─── Utilitaire ───────────────────────────────────────────────────────────────
export const selectCreditById = (state, id) =>
  selectCreditsData(state).find((c) => c.id === id) || null;

// ─── Aliases ──────────────────────────────────────────────────────────────────
export const selectCredits = selectCreditsData;
export const selectCreditLoading = selectCreditsLoading;
export const selectCreditError = selectCreditsError;
export const selectCreditSuccess = selectCreditsSuccess;
