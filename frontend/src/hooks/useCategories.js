import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchActiveCategories,
  fetchCategoriesWithProductCount,
  bulkUpdateCategoryStatus,
} from "../features/categories/thunk/categoriesThunk";
import {
  selectCategoriesData,
  selectCurrentCategory,
  selectActiveList,
  selectActiveWithCount,
  selectCategoriesStats,
  selectCategoriesPagination,
  selectCategoriesTotal,
  selectCategoriesLoading,
  selectCategoryFetchLoading,
  selectCategoryCreateLoading,
  selectCategoryUpdateLoading,
  selectCategoryDeleteLoading,
  selectCategoryBulkUpdateLoading,
  selectCategoryFetchActiveLoading,
  selectCategoriesError,
  selectCategoriesSuccess,
} from "../features/categories/selectors/categoriesSelectors";
import {
  clearError,
  clearSuccess,
  resetCurrent,
} from "../features/categories/slice/categoriesSlice";

// ─────────────────────────────────────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────────────────────────────────────
export const useCategories = () => {
  const dispatch = useDispatch();

  // ── State ──────────────────────────────────────────────────────────────────
  const categories      = useSelector(selectCategoriesData);
  const current         = useSelector(selectCurrentCategory);
  const activeList      = useSelector(selectActiveList);
  const activeWithCount = useSelector(selectActiveWithCount);
  const stats           = useSelector(selectCategoriesStats);
  const pagination      = useSelector(selectCategoriesPagination);
  const total           = useSelector(selectCategoriesTotal);
  const error           = useSelector(selectCategoriesError);
  const success         = useSelector(selectCategoriesSuccess);

  // ── Loading granulaire ─────────────────────────────────────────────────────
  const loading             = useSelector(selectCategoriesLoading);
  const fetchLoading        = useSelector(selectCategoryFetchLoading);
  const createLoading       = useSelector(selectCategoryCreateLoading);
  const updateLoading       = useSelector(selectCategoryUpdateLoading);
  const deleteLoading       = useSelector(selectCategoryDeleteLoading);
  const bulkUpdateLoading   = useSelector(selectCategoryBulkUpdateLoading);
  const fetchActiveLoading  = useSelector(selectCategoryFetchActiveLoading);

  return {
    // Data
    categories,
    current,
    activeList,       // pour les <select> dans les formulaires produit
    activeWithCount,  // pour les dashboards
    stats,            // { total, actifs, inactifs } — vient du controller
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
    bulkUpdateLoading,
    fetchActiveLoading,

    // ✅ .unwrap() sur tous les thunks pour avoir de vrais try/catch dans les composants
    fetchCategories:              (params)          => dispatch(fetchCategories(params)).unwrap(),
    fetchCategoryById:            (id)              => dispatch(fetchCategoryById(id)).unwrap(),
    createCategory:               (payload)         => dispatch(createCategory(payload)).unwrap(),
    updateCategory:               (id, data)        => dispatch(updateCategory({ id, data })).unwrap(),
    deleteCategory:               (id)              => dispatch(deleteCategory(id)).unwrap(),
    fetchActiveCategories:        ()                => dispatch(fetchActiveCategories()).unwrap(),
    fetchCategoriesWithProductCount: ()             => dispatch(fetchCategoriesWithProductCount()).unwrap(),
    bulkUpdateCategoryStatus:     (ids, isActive)   => dispatch(bulkUpdateCategoryStatus({ ids, isActive })).unwrap(),

    // Reset helpers
    clearError:   () => dispatch(clearError()),
    clearSuccess: () => dispatch(clearSuccess()),
    resetCurrent: () => dispatch(resetCurrent()),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook utilitaire — cherche dans la page courante
// ─────────────────────────────────────────────────────────────────────────────
export const useCategoryById = (id) =>
  useSelector((state) =>
    (state?.categories?.data || []).find((c) => c.id === id) || null
  );