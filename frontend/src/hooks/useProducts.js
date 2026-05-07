import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProductsByCategory,
  fetchProductsByFournisseur,
  fetchLowStockProducts,
} from "../features/products/thunk/productsThunk";
import {
  selectProductsData,
  selectCurrentProduct,
  selectProductsByCategory,
  selectProductsByFournisseur,
  selectLowStockProducts,
  selectLowStockThreshold,
  selectByCategoryMeta,
  selectByFournisseurMeta,
  selectLowStockMeta,
  selectProductsStats,
  selectProductsPagination,
  selectProductsTotal,
  selectProductsLoading,
  selectProductFetchLoading,
  selectProductCreateLoading,
  selectProductUpdateLoading,
  selectProductDeleteLoading,
  selectProductFetchByCategoryLoading,
  selectProductFetchByFournisseurLoading,
  selectProductFetchLowStockLoading,
  selectProductsError,
  selectProductsSuccess,
} from "../features/products/selectors/productsSelectors";
import {
  clearError,
  clearSuccess,
  resetCurrent,
  resetByCategory,
  resetByFournisseur,
  resetLowStock,
} from "../features/products/slice/productsSlice";

// ─────────────────────────────────────────────────────────────────────────────
// Hook principal
// ─────────────────────────────────────────────────────────────────────────────
export const useProducts = () => {
  const dispatch = useDispatch();

  // ── State ──────────────────────────────────────────────────────────────────
  const products           = useSelector(selectProductsData);
  const current            = useSelector(selectCurrentProduct);
  const byCategory         = useSelector(selectProductsByCategory);
  const byFournisseur      = useSelector(selectProductsByFournisseur);
  const lowStock           = useSelector(selectLowStockProducts);
  const lowStockThreshold  = useSelector(selectLowStockThreshold);
  const byCategoryMeta     = useSelector(selectByCategoryMeta);
  const byFournisseurMeta  = useSelector(selectByFournisseurMeta);
  const lowStockMeta       = useSelector(selectLowStockMeta);
  const stats              = useSelector(selectProductsStats);
  const pagination         = useSelector(selectProductsPagination);
  const total              = useSelector(selectProductsTotal);
  const error              = useSelector(selectProductsError);
  const success            = useSelector(selectProductsSuccess);

  // ── Loading granulaire ─────────────────────────────────────────────────────
  const loading                   = useSelector(selectProductsLoading);
  const fetchLoading              = useSelector(selectProductFetchLoading);
  const createLoading             = useSelector(selectProductCreateLoading);
  const updateLoading             = useSelector(selectProductUpdateLoading);
  const deleteLoading             = useSelector(selectProductDeleteLoading);
  const fetchByCategoryLoading    = useSelector(selectProductFetchByCategoryLoading);
  const fetchByFournisseurLoading = useSelector(selectProductFetchByFournisseurLoading);
  const fetchLowStockLoading      = useSelector(selectProductFetchLowStockLoading);

  return {
    // ── Data ──────────────────────────────────────────────────────────────
    products,
    current,
    byCategory,           // liste filtrée par catégorie
    byFournisseur,        // liste filtrée par fournisseur
    lowStock,             // liste stock faible → dashboard alertes
    lowStockThreshold,
    byCategoryMeta,       // pagination de byCategory
    byFournisseurMeta,    // pagination de byFournisseur
    lowStockMeta,         // pagination de lowStock
    stats,                // { total, actifs, inactifs, stock_total, stock_faible, prix_moyen }
    pagination,
    total,
    error,
    success,

    // ── Loading ───────────────────────────────────────────────────────────
    loading,
    fetchLoading,
    createLoading,
    updateLoading,
    deleteLoading,
    fetchByCategoryLoading,
    fetchByFournisseurLoading,
    fetchLowStockLoading,

    // ── Actions — .unwrap() pour try/catch dans les composants ────────────
    fetchProducts:              (params)                   => dispatch(fetchProducts(params)).unwrap(),
    fetchProductById:           (id)                       => dispatch(fetchProductById(id)).unwrap(),
    createProduct:              (formData)                 => dispatch(createProduct(formData)).unwrap(),
    updateProduct:              (id, formData)             => dispatch(updateProduct({ id, formData })).unwrap(),
    deleteProduct:              (id)                       => dispatch(deleteProduct(id)).unwrap(),
    fetchProductsByCategory:    (categoryId, params)       => dispatch(fetchProductsByCategory({ categoryId, params })).unwrap(),
    fetchProductsByFournisseur: (fournisseurId, params)    => dispatch(fetchProductsByFournisseur({ fournisseurId, params })).unwrap(),
    fetchLowStockProducts:      (params)                   => dispatch(fetchLowStockProducts(params)).unwrap(),

    // ── Reset helpers ─────────────────────────────────────────────────────
    clearError:          () => dispatch(clearError()),
    clearSuccess:        () => dispatch(clearSuccess()),
    resetCurrent:        () => dispatch(resetCurrent()),
    resetByCategory:     () => dispatch(resetByCategory()),
    resetByFournisseur:  () => dispatch(resetByFournisseur()),
    resetLowStock:       () => dispatch(resetLowStock()),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Hook utilitaire — cherche dans la page courante
// ─────────────────────────────────────────────────────────────────────────────
export const useProductById = (id) =>
  useSelector((state) =>
    (state?.products?.data || []).find((p) => p.id === id) || null
  );