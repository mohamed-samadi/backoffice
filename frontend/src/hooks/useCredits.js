// useCredits hook
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCredits,
  fetchCreditById,
  createCredit,
  updateCredit,
  deleteCredit,
  enregistrerPaiement,
  generateNumeroCredit,
  fetchCreditsEnRetard,
} from "../features/credits/thunk/creditsTrunk";
import {
  selectCreditsData,
  selectCurrentCredit,
  selectEnRetardList,
  selectNumeroPreview,
  selectCreditsStats,
  selectCreditsPagination,
  selectCreditsTotal,
  selectCreditsLoading,
  selectCreditFetchLoading,
  selectCreditCreateLoading,
  selectCreditUpdateLoading,
  selectCreditDeleteLoading,
  selectCreditPaiementLoading,
  selectCreditGenNumeroLoading,
  selectCreditsError,
  selectCreditsSuccess,
} from "../features/credits/selectors/creditsSelectors";
import {
  clearError,
  clearSuccess,
  resetCurrent,
  clearNumero,
} from "../features/credits/slice/creditsSlice";

// ─────────────────────────────────────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────────────────────────────────────
export const useCredits = () => {
  const dispatch = useDispatch();

  // ── State ──────────────────────────────────────────────────────────────────
  const credits = useSelector(selectCreditsData);
  const current = useSelector(selectCurrentCredit);
  const enRetardList = useSelector(selectEnRetardList);
  const numeroPreview = useSelector(selectNumeroPreview);
  const stats = useSelector(selectCreditsStats);
  const pagination = useSelector(selectCreditsPagination);
  const total = useSelector(selectCreditsTotal);
  const error = useSelector(selectCreditsError);
  const success = useSelector(selectCreditsSuccess);

  // ── Loading granulaire ─────────────────────────────────────────────────────
  const loading = useSelector(selectCreditsLoading);
  const fetchLoading = useSelector(selectCreditFetchLoading);
  const createLoading = useSelector(selectCreditCreateLoading);
  const updateLoading = useSelector(selectCreditUpdateLoading);
  const deleteLoading = useSelector(selectCreditDeleteLoading);
  const paiementLoading = useSelector(selectCreditPaiementLoading);
  const genNumeroLoading = useSelector(selectCreditGenNumeroLoading);

  return {
    // Data
    credits,
    current,
    enRetardList,
    numeroPreview,
    stats,
    pagination,
    total,
    error,
    success,

    // Loading
    loading,
    fetchLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    paiementLoading,
    genNumeroLoading,

    // ✅ .unwrap() sur tous les thunks — try/catch réel dans les composants
    fetchCredits: (params) => dispatch(fetchCredits(params)).unwrap(),
    fetchCreditById: (id) => dispatch(fetchCreditById(id)).unwrap(),
    createCredit: (payload) => dispatch(createCredit(payload)).unwrap(),
    updateCredit: (id, data) => dispatch(updateCredit({ id, data })).unwrap(),
    deleteCredit: (id) => dispatch(deleteCredit(id)).unwrap(),
    enregistrerPaiement: (id, montant) =>
      dispatch(enregistrerPaiement({ id, montant })).unwrap(),
    generateNumeroCredit: () => dispatch(generateNumeroCredit()).unwrap(),
    fetchCreditsEnRetard: (params) =>
      dispatch(fetchCreditsEnRetard(params)).unwrap(),

    // Reset helpers
    clearError: () => dispatch(clearError()),
    clearSuccess: () => dispatch(clearSuccess()),
    resetCurrent: () => dispatch(resetCurrent()),
    clearNumero: () => dispatch(clearNumero()),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook utilitaire
// ─────────────────────────────────────────────────────────────────────────────
export const useCreditById = (id) =>
  useSelector(
    (state) => (state?.credits?.data || []).find((c) => c.id === id) || null,
  );
