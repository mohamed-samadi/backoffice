import { createSelector } from "@reduxjs/toolkit";

const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_LOADING_STATES = Object.freeze({});
const DEFAULT_STATS = Object.freeze({ total: 0, actifs: 0, inactifs: 0 });

export const selectClientsData = (state) =>
  state?.clients?.data ?? EMPTY_ARRAY;
export const selectCurrentClient = (state) => state?.clients?.current ?? null;
export const selectActiveClients = (state) =>
  state?.clients?.activeClients ?? EMPTY_ARRAY;
export const selectClientsError = (state) => state?.clients?.error ?? null;
export const selectClientsSuccess = (state) => state?.clients?.success ?? false;

export const selectClientFetchLoading = (state) =>
  state?.clients?.loadingStates?.fetch ?? false;
export const selectClientFetchOneLoading = (state) =>
  state?.clients?.loadingStates?.fetchOne ?? false;
export const selectClientCreateLoading = (state) =>
  state?.clients?.loadingStates?.create ?? false;
export const selectClientUpdateLoading = (state) =>
  state?.clients?.loadingStates?.update ?? false;
export const selectClientDeleteLoading = (state) =>
  state?.clients?.loadingStates?.delete ?? false;
export const selectClientFetchActiveLoading = (state) =>
  state?.clients?.loadingStates?.fetchActive ?? false;

export const selectClientsStats = createSelector(
  [(state) => state?.clients?.stats],
  (stats) => stats ?? DEFAULT_STATS,
);

export const selectClientsPagination = createSelector(
  [(state) => state?.clients?.meta],
  (meta) => ({
    currentPage: meta?.current_page ?? 1,
    lastPage: meta?.last_page ?? 1,
    total: meta?.total ?? 0,
    perPage: meta?.per_page ?? 10,
  }),
);

export const selectClientsTotal = createSelector(
  [(state) => state?.clients?.meta?.total, (state) => state?.clients?.data],
  (metaTotal, data) => metaTotal ?? (data?.length ?? 0),
);

export const selectClientsLoading = createSelector(
  [(state) => state?.clients?.loadingStates],
  (loadingStates) =>
    Object.values(loadingStates ?? EMPTY_LOADING_STATES).some(Boolean),
);

export const selectClientsActifs = createSelector(
  [selectClientsData],
  (data) => data.filter((client) => client.statut === "active"),
);

export const selectClientsInactifs = createSelector(
  [selectClientsData],
  (data) => data.filter((client) => client.statut === "inactive"),
);

export const makeSelectClientById = (id) =>
  createSelector(
    [selectClientsData],
    (data) => data.find((client) => client.id === id) ?? null,
  );

export const selectClientById = (state, id) =>
  selectClientsData(state).find((client) => client.id === id) ?? null;

export const selectClients = selectClientsData;
export const selectClientLoading = selectClientsLoading;
export const selectClientError = selectClientsError;
export const selectClientSuccess = selectClientsSuccess;
