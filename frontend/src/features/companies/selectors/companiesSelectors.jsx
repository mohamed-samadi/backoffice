// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS — companies
// ─────────────────────────────────────────────────────────────────────────────

// ── Data principale ───────────────────────────────────────────────────────
export const selectCompaniesData   = (state) => state?.companies?.data    || [];
export const selectCurrentCompany = (state) => state?.companies?.current || null;

export const selectCompaniesLoadingStates      = (state) => state?.companies?.loadingStates || {};
export const selectCompanyFetchLoading        = (state) => state?.companies?.loadingStates?.fetch         || false;
export const selectCompanyFetchOneLoading     = (state) => state?.companies?.loadingStates?.fetchOne      || false;
export const selectCompanyCreateLoading       = (state) => state?.companies?.loadingStates?.create        || false;
export const selectCompanyUpdateLoading       = (state) => state?.companies?.loadingStates?.update        || false;
export const selectCompanyDeleteLoading       = (state) => state?.companies?.loadingStates?.delete        || false;

export const selectCompaniesLoading = (state) =>
  Object.values(state?.companies?.loadingStates || {}).some(Boolean);

// ── Error / Success ───────────────────────────────────────────────────────   
export const selectCompaniesError   = (state) => state?.companies?.error   || null;
export const selectCompaniesSuccess = (state) => state?.companies?.success || false;

// ── Utilitaires ───────────────────────────────────────────────────────────
export const selectCompanyById = (state, id) =>
  selectCompaniesData(state).find((c) => c.id === id) || null;

export const selectCompanies = selectCompaniesData;
export const selectCompanyLoading = selectCompaniesLoading;
export const selectCompanyError = selectCompaniesError;
export const selectCompanySuccess = selectCompaniesSuccess;


