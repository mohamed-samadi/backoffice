import { useDispatch, useSelector } from "react-redux";
import {
  fetchFournisseurs,
  fetchFournisseurById,
  createFournisseur,
  updateFournisseur,
  deleteFournisseur,
  searchFournisseurs,
  fetchActiveFournisseurs,
} from "../features/fournisseur/thunk/fournisseurThunk";
import {
  selectFournisseursData,
  selectFournisseursLoading,
  selectFournisseurFetchLoading,
  selectFournisseurCreateLoading,
  selectFournisseurUpdateLoading,
  selectFournisseurDeleteLoading,
  selectFournisseurSearchLoading,
  selectFournisseursError,
  selectFournisseursSuccess,
  selectFournisseurPagination,
  selectFournisseursCount,
  selectCurrentFournisseur,
  selectGlobalStats,
  selectActiveFournisseurs,
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
  const fournisseurs = useSelector(selectFournisseursData);
  const current      = useSelector(selectCurrentFournisseur);
  const pagination   = useSelector(selectFournisseurPagination);
  const total        = useSelector(selectFournisseursCount);
  const error        = useSelector(selectFournisseursError);
  const success      = useSelector(selectFournisseursSuccess);
  const activeList    = useSelector(selectActiveFournisseurs);
  // ── Loading granulaire ─────────────────────────────────────────────────────
  const loading       = useSelector(selectFournisseursLoading);
  const fetchLoading  = useSelector(selectFournisseurFetchLoading);
  const createLoading = useSelector(selectFournisseurCreateLoading);
  const updateLoading = useSelector(selectFournisseurUpdateLoading);
  const deleteLoading = useSelector(selectFournisseurDeleteLoading);
  const searchLoading = useSelector(selectFournisseurSearchLoading);
const globalstats = useSelector(selectGlobalStats);
  return {
    // Data
    globalstats,
    fournisseurs,
    current,
    pagination,
    total,
    error,
    success,
    activeList,
    // Loading
    loading,
    fetchLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    searchLoading,

    // ✅ .unwrap() : expose la vraie Promise du thunk
    //    resolve  → retourne la data de fulfilled
    //    reject   → throw l'erreur de rejected (catchable en try/catch)
    //    Sans unwrap, dispatch retourne toujours une Promise résolue,
    //    donc les erreurs sont silencieuses et await ne bloque pas correctement.
    fetchFournisseurs:    (params)      => dispatch(fetchFournisseurs(params)).unwrap(),
    fetchFournisseurById: (id)          => dispatch(fetchFournisseurById(id)).unwrap(),
    createFournisseur:    (payload)     => dispatch(createFournisseur(payload)).unwrap(),
    updateFournisseur:    (id, payload) => dispatch(updateFournisseur({ id, data: payload })).unwrap(),
    deleteFournisseur:    (id)          => dispatch(deleteFournisseur(id)).unwrap(),
    searchFournisseurs:   (query)       => dispatch(searchFournisseurs(query)).unwrap(),
    fetchActiveFournisseurs: () => dispatch(fetchActiveFournisseurs()).unwrap(),
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