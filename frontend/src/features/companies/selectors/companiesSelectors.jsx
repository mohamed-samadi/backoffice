import { createSelector } from "@reduxjs/toolkit";

const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});

export const selectCompaniesData = (state) =>
  state?.companies?.data || EMPTY_ARRAY;
export const selectCurrentCompany = (state) => state?.companies?.current || null;

export const selectCompaniesLoadingStates = (state) =>
  state?.companies?.loadingStates || EMPTY_OBJECT;
export const selectCompanyFetchLoading = (state) =>
  state?.companies?.loadingStates?.fetch || false;
export const selectCompanyFetchOneLoading = (state) =>
  state?.companies?.loadingStates?.fetchOne || false;
export const selectCompanyCreateLoading = (state) =>
  state?.companies?.loadingStates?.create || false;
export const selectCompanyUpdateLoading = (state) =>
  state?.companies?.loadingStates?.update || false;
export const selectCompanyDeleteLoading = (state) =>
  state?.companies?.loadingStates?.delete || false;

export const selectCompaniesLoading = createSelector(
  [selectCompaniesLoadingStates],
  (loadingStates) => Object.values(loadingStates).some(Boolean),
);

export const selectCompaniesError = (state) => state?.companies?.error || null;
export const selectCompaniesSuccess = (state) =>
  state?.companies?.success || false;

export const selectCompanyById = (state, id) =>
  selectCompaniesData(state).find((company) => company.id === id) || null;

export const selectCompanies = selectCompaniesData;
export const selectCompanyLoading = selectCompaniesLoading;
export const selectCompanyError = selectCompaniesError;
export const selectCompanySuccess = selectCompaniesSuccess;
