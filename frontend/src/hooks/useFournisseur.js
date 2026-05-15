import { useDispatch, useSelector } from "react-redux";
import {
  fetchFournisseurs,
  fetchFournisseurById,
  createFournisseur,
  updateFournisseur,
  deleteFournisseur,
  fetchActiveFournisseurs,
  fetchFournisseurVilles,
} from "../features/fournisseur/thunk/fournisseurThunk";
import {
  selectFournisseursData,
  selectFournisseursLoading,
  selectFournisseurFetchLoading,
  selectFournisseurCreateLoading,
  selectFournisseurUpdateLoading,
  selectFournisseurDeleteLoading,
  selectFournisseurActiveLoading,
  selectFournisseurVillesLoading,
  selectFournisseursError,
  selectFournisseursSuccess,
  selectFournisseurPagination,
  selectFournisseursCount,
  selectCurrentFournisseur,
  selectGlobalStats,
  selectActiveFournisseurs,
  selectFournisseurVilles,
} from "../features/fournisseur/selectors/fournisseurSelectors";
import {
  clearError,
  clearSuccess,
  resetCurrent,
} from "../features/fournisseur/slice/fournisseurSlice";

// ─────────────────────────────────────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────────────────────────────────────
export const useFournisseur = () => {
  const dispatch = useDispatch();

  // ── State ──────────────────────────────────────────────────────────────────
  const fournisseurs  = useSelector(selectFournisseursData);
  const current       = useSelector(selectCurrentFournisseur);
  const pagination    = useSelector(selectFournisseurPagination);
  const total         = useSelector(selectFournisseursCount);
  const error         = useSelector(selectFournisseursError);
  const success       = useSelector(selectFournisseursSuccess);
  const activeList    = useSelector(selectActiveFournisseurs);
  const villes        = useSelector(selectFournisseurVilles);
  const globalstats   = useSelector(selectGlobalStats);

  // ── Loading granulaire ─────────────────────────────────────────────────────
  const loading             = useSelector(selectFournisseursLoading);
  const fetchLoading        = useSelector(selectFournisseurFetchLoading);
  const createLoading       = useSelector(selectFournisseurCreateLoading);
  const updateLoading       = useSelector(selectFournisseurUpdateLoading);
  const deleteLoading       = useSelector(selectFournisseurDeleteLoading);
  const fetchActiveLoading  = useSelector(selectFournisseurActiveLoading);
  const fetchVillesLoading  = useSelector(selectFournisseurVillesLoading);

  return {
    // Data
    fournisseurs,
    current,
    pagination,
    total,
    error,
    success,
    activeList,
    villes,
    globalstats,

    // Loading
    loading,
    fetchLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    fetchActiveLoading,
    fetchVillesLoading,

    // ✅ .unwrap() sur tous les thunks — try/catch réel dans les composants
    fetchFournisseurs:       (params)      => dispatch(fetchFournisseurs(params)).unwrap(),
    fetchFournisseurById:    (id)          => dispatch(fetchFournisseurById(id)).unwrap(),
    createFournisseur:       (payload)     => dispatch(createFournisseur(payload)).unwrap(),
    updateFournisseur:       (id, payload) => dispatch(updateFournisseur({ id, data: payload })).unwrap(),
    deleteFournisseur:       (id)          => dispatch(deleteFournisseur(id)).unwrap(),
    fetchActiveFournisseurs: ()            => dispatch(fetchActiveFournisseurs()).unwrap(),
    fetchFournisseurVilles:  ()            => dispatch(fetchFournisseurVilles()).unwrap(),

    // Reset helpers
    clearError:   () => dispatch(clearError()),
    clearSuccess: () => dispatch(clearSuccess()),
    resetCurrent: () => dispatch(resetCurrent()),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook utilitaire — cherche dans la page courante chargée en mémoire
// ─────────────────────────────────────────────────────────────────────────────
export const useFournisseurById = (id) =>
  useSelector((state) =>
    (state?.fournisseur?.data || []).find((f) => f.id === id) || null
  );