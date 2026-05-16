// ─────────────────────────────────────────────────────────────────────────────
// SELECTORS — clients
// Règle appliquée :
//   • Extraction simple  → selector basique  (state) => state.x
//   • Transformation     → createSelector    (nouvel objet / array / logique)
// ─────────────────────────────────────────────────────────────────────────────
import { createSelector } from "@reduxjs/toolkit";

// ── Extraction simple (scalaires / références directes) ──────────────────────
// Pas de createSelector : retourne directement la valeur du store.

export const selectClientsData    = (state) => state?.clients?.data          ?? [];
export const selectCurrentClient  = (state) => state?.clients?.current       ?? null;
export const selectActiveClients  = (state) => state?.clients?.activeClients ?? [];
export const selectClientsError   = (state) => state?.clients?.error         ?? null;
export const selectClientsSuccess = (state) => state?.clients?.success       ?? false;

// ── Loading granulaire (scalaires booléens) ───────────────────────────────────
export const selectClientFetchLoading       = (state) => state?.clients?.loadingStates?.fetch        ?? false;
export const selectClientFetchOneLoading    = (state) => state?.clients?.loadingStates?.fetchOne     ?? false;
export const selectClientCreateLoading      = (state) => state?.clients?.loadingStates?.create       ?? false;
export const selectClientUpdateLoading      = (state) => state?.clients?.loadingStates?.update       ?? false;
export const selectClientDeleteLoading      = (state) => state?.clients?.loadingStates?.delete       ?? false;
export const selectClientFetchActiveLoading = (state) => state?.clients?.loadingStates?.fetchActive  ?? false;

// ── Transformation → createSelector ──────────────────────────────────────────

// Stats : retourne un objet fallback si stats est undefined → doit être memoizé
export const selectClientsStats = createSelector(
  [(state) => state?.clients?.stats],
  (stats) => stats ?? { total: 0, actifs: 0, inactifs: 0 },
);

// Pagination : construit un nouvel objet à partir de meta → doit être memoizé
export const selectClientsPagination = createSelector(
  [(state) => state?.clients?.meta],
  (meta) => ({
    currentPage: meta?.current_page ?? 1,
    lastPage:    meta?.last_page    ?? 1,
    total:       meta?.total        ?? 0,
    perPage:     meta?.per_page     ?? 10,
  }),
);

// Total : combine deux sources → doit être memoizé
export const selectClientsTotal = createSelector(
  [
    (state) => state?.clients?.meta?.total,
    (state) => state?.clients?.data,
  ],
  (metaTotal, data) => metaTotal ?? (data?.length ?? 0),
);

// Loading global : .some() dérive une valeur booléenne → doit être memoizé
export const selectClientsLoading = createSelector(
  [(state) => state?.clients?.loadingStates],
  (ls) => Object.values(ls ?? {}).some(Boolean),
);

// Filtres dérivés : .filter() retourne un nouveau tableau → doit être memoizé
export const selectClientsActifs = createSelector(
  [selectClientsData],
  (data) => data.filter((c) => c.statut === "active"),
);

export const selectClientsInactifs = createSelector(
  [selectClientsData],
  (data) => data.filter((c) => c.statut === "inactive"),
);

// ── Utilitaires ───────────────────────────────────────────────────────────────

// Selector factory : une instance memoizée par id (évite le cache partagé)
// Usage dans un composant :
//   const selectClient = useMemo(() => makeSelectClientById(id), [id]);
//   const client = useSelector(selectClient);
export const makeSelectClientById = (id) =>
  createSelector(
    [selectClientsData],
    (data) => data.find((c) => c.id === id) ?? null,
  );

// Version simple pour les usages ponctuels hors useSelector
export const selectClientById = (state, id) =>
  selectClientsData(state).find((c) => c.id === id) ?? null;

// ── Aliases (rétrocompatibilité) ──────────────────────────────────────────────
export const selectClients       = selectClientsData;
export const selectClientLoading = selectClientsLoading;
export const selectClientError   = selectClientsError;
export const selectClientSuccess = selectClientsSuccess;