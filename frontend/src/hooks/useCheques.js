import { useDispatch, useSelector } from "react-redux";
import {
  fetchCheques, fetchChequeById,
  createCheque, updateCheque, deleteCheque,
  encaisserCheque, marquerImpayeCheque, annulerCheque,
  fetchEcheancesProches,
  fetchbanques,
} from "../features/cheques/thunk/chequesThunk";
import {
  selectChequesData, selectCurrentCheque,
  selectEcheancesProches, selectEcheancesProchesCount,
  selectChequesStats, selectChequesPagination, selectChequesTotal,
  selectChequesLoading,
  selectChequeFetchLoading, selectChequeFetchOneLoading,
  selectChequeCreateLoading, selectChequeUpdateLoading,
  selectChequeDeleteLoading, selectChequeEncaisserLoading,
  selectChequeMarquerImpayeLoading, selectChequeAnnulerLoading,
  selectChequeEcheancesLoading,
  selectChequesError, selectChequesSuccess,
  selectChequesNonEncaisses, selectChequesEncaisses, selectChequesImpayes,
  selectBanquesOptions,
} from "../features/cheques/selectors/chequesSelectors";
import {
  clearError, clearSuccess, resetCurrent, resetEcheances,
} from "../features/cheques/slice/chequesSlice";

// ─────────────────────────────────────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────────────────────────────────────
export const useCheques = () => {
  const dispatch = useDispatch();

  return {
    // ── Data ────────────────────────────────────────────────────────────
    banques:              useSelector(selectBanquesOptions),
    cheques:               useSelector(selectChequesData),
    current:               useSelector(selectCurrentCheque),
    echeancesProches:      useSelector(selectEcheancesProches),
    echeancesProchesCount: useSelector(selectEcheancesProchesCount),
    stats:                 useSelector(selectChequesStats),
    pagination:            useSelector(selectChequesPagination),
    total:                 useSelector(selectChequesTotal),
    error:                 useSelector(selectChequesError),
    success:               useSelector(selectChequesSuccess),

    // ── Vues filtrées (utiles pour dashboard) ────────────────────────────
    chequesNonEncaisses:   useSelector(selectChequesNonEncaisses),
    chequesEncaisses:      useSelector(selectChequesEncaisses),
    chequesImpayes:        useSelector(selectChequesImpayes),

    // ── Loading ──────────────────────────────────────────────────────────
    loading:               useSelector(selectChequesLoading),
    fetchLoading:          useSelector(selectChequeFetchLoading),
    fetchOneLoading:       useSelector(selectChequeFetchOneLoading),
    createLoading:         useSelector(selectChequeCreateLoading),
    updateLoading:         useSelector(selectChequeUpdateLoading),
    deleteLoading:         useSelector(selectChequeDeleteLoading),
    encaisserLoading:      useSelector(selectChequeEncaisserLoading),
    marquerImpayeLoading:  useSelector(selectChequeMarquerImpayeLoading),
    annulerLoading:        useSelector(selectChequeAnnulerLoading),
    echeancesLoading:      useSelector(selectChequeEcheancesLoading),

    // ── Actions CRUD ─────────────────────────────────────────────────────
    fetchCheques:       (params)       => dispatch(fetchCheques(params)).unwrap(),
    fetchChequeById:    (id)           => dispatch(fetchChequeById(id)).unwrap(),
    createCheque:       (formData)     => dispatch(createCheque(formData)).unwrap(),
    updateCheque:       (id, formData) => dispatch(updateCheque({ id, formData })).unwrap(),
    deleteCheque:       (id)           => dispatch(deleteCheque(id)).unwrap(),

    // ── Actions métier ────────────────────────────────────────────────────
    encaisserCheque:     (id)          => dispatch(encaisserCheque(id)).unwrap(),
    marquerImpayeCheque: (id)          => dispatch(marquerImpayeCheque(id)).unwrap(),
    annulerCheque:       (id)          => dispatch(annulerCheque(id)).unwrap(),

    // ── Route spéciale ────────────────────────────────────────────────────
    fetchEcheancesProches: (jours)     => dispatch(fetchEcheancesProches(jours)).unwrap(),
    fetchBanques:          ()          => dispatch(fetchbanques()).unwrap(),
    fetchbanquesOptions:     ()          => dispatch(fetchbanques()).unwrap(), // alias pour clarté dans les composants
    // ── Reset helpers ─────────────────────────────────────────────────────
    clearError:       () => dispatch(clearError()),
    clearSuccess:     () => dispatch(clearSuccess()),
    resetCurrent:     () => dispatch(resetCurrent()),
    resetEcheances:   () => dispatch(resetEcheances()),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook utilitaire — cherche dans la page courante
// ─────────────────────────────────────────────────────────────────────────────
export const useChequeById = (id) =>
  useSelector((state) =>
    (state?.cheques?.data || []).find((c) => c.id === id) || null
  );