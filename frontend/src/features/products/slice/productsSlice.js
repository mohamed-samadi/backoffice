import { createSlice } from "@reduxjs/toolkit";
import {
  fetchProducts,
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProductsByCategory,
  fetchProductsByFournisseur,
  fetchLowStockProducts,
} from "../thunk/productsThunk";

const initialState = {
  // ── Liste paginée principale (ProductsPage) ──────────────────────────
  data: [],
  meta: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  },
  // Stats retournées par index() — stockées pour éviter de les perdre
  stats: {
    total: 0,
    actifs: 0,
    inactifs: 0,
    stock_total: 0,
    stock_faible: 0,
    prix_moyen: 0,
  },

  // ── Listes secondaires séparées ──────────────────────────────────────
  // Séparés de data pour ne pas écraser la liste paginée principale
  byCategory: [],         // fetchProductsByCategory → vue catégorie
  byCategoryMeta: null,
  byFournisseur: [],      // fetchProductsByFournisseur → vue fournisseur
  byFournisseurMeta: null,
  lowStock: [],           // fetchLowStockProducts → dashboard alertes
  lowStockMeta: null,
  lowStockThreshold: 10,

  // ── Produit courant (show/edit) ───────────────────────────────────────
  current: null,

  // ── Loading granulaire ────────────────────────────────────────────────
  loadingStates: {
    fetch: false,
    fetchOne: false,
    create: false,
    update: false,
    delete: false,
    fetchByCategory: false,
    fetchByFournisseur: false,
    fetchLowStock: false,
  },

  error: null,
  success: false,
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearError:           (state) => { state.error = null; },
    clearSuccess:         (state) => { state.success = false; },
    resetCurrent:         (state) => { state.current = null; },
    // Nettoyer les listes filtrées quand on quitte la vue
    resetByCategory:      (state) => { state.byCategory = []; state.byCategoryMeta = null; },
    resetByFournisseur:   (state) => { state.byFournisseur = []; state.byFournisseurMeta = null; },
    resetLowStock:        (state) => { state.lowStock = []; state.lowStockMeta = null; },
  },
  extraReducers: (builder) => {

    // ── fetchProducts ────────────────────────────────────────────────────
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loadingStates.fetch = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loadingStates.fetch = false;
        state.data = action.payload?.data || [];
        if (action.payload?.meta)  state.meta  = action.payload.meta;
        // Stocker les stats retournées par le controller
        if (action.payload?.stats) state.stats = action.payload.stats;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loadingStates.fetch = false;
        state.error = action.payload;
      });

    // ── fetchProductById ─────────────────────────────────────────────────
    builder
      .addCase(fetchProductById.pending, (state) => {
        state.loadingStates.fetchOne = true;
        state.error = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loadingStates.fetchOne = false;
        state.current = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loadingStates.fetchOne = false;
        state.error = action.payload;
      });

    // ── createProduct ────────────────────────────────────────────────────
    builder
      .addCase(createProduct.pending, (state) => {
        state.loadingStates.create = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state) => {
        state.loadingStates.create = false;
        // Pas de push — incohérent avec la pagination
        // Le composant doit refetch après création
        state.meta.total += 1;
        state.stats.total += 1;
        state.stats.actifs += 1; // nouveau produit est actif par défaut
        state.success = true;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loadingStates.create = false;
        state.error = action.payload;
      });

    // ── updateProduct ────────────────────────────────────────────────────
    builder
      .addCase(updateProduct.pending, (state) => {
        state.loadingStates.update = true;
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loadingStates.update = false;
        // Mettre à jour dans la liste principale si présent
        const index = state.data.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) state.data[index] = action.payload;
        // Mettre à jour dans byCategory si présent
        const catIndex = state.byCategory.findIndex((p) => p.id === action.payload.id);
        if (catIndex !== -1) state.byCategory[catIndex] = action.payload;
        // Mettre à jour dans byFournisseur si présent
        const fouIndex = state.byFournisseur.findIndex((p) => p.id === action.payload.id);
        if (fouIndex !== -1) state.byFournisseur[fouIndex] = action.payload;
        state.current = action.payload;
        state.success = true;
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loadingStates.update = false;
        state.error = action.payload;
      });

    // ── deleteProduct ────────────────────────────────────────────────────
    builder
      .addCase(deleteProduct.pending, (state) => {
        state.loadingStates.delete = true;
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loadingStates.delete = false;
        const removed = state.data.find((p) => p.id === action.payload);
        // Retirer de toutes les listes
        state.data          = state.data.filter((p) => p.id !== action.payload);
        state.byCategory    = state.byCategory.filter((p) => p.id !== action.payload);
        state.byFournisseur = state.byFournisseur.filter((p) => p.id !== action.payload);
        state.lowStock      = state.lowStock.filter((p) => p.id !== action.payload);
        // Mettre à jour les stats selon le statut du produit supprimé
        state.meta.total = Math.max(0, state.meta.total - 1);
        if (removed) {
          state.stats.total  = Math.max(0, state.stats.total - 1);
          state.stats.stock_total = Math.max(0, state.stats.stock_total - (removed.quantite_stock || 0));
          if (removed.actif) state.stats.actifs   = Math.max(0, state.stats.actifs   - 1);
          else               state.stats.inactifs = Math.max(0, state.stats.inactifs - 1);
        }
        state.success = true;
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loadingStates.delete = false;
        state.error = action.payload;
      });

    // ── fetchProductsByCategory ──────────────────────────────────────────
    builder
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loadingStates.fetchByCategory = true;
        state.error = null;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loadingStates.fetchByCategory = false;
        // Ne touche pas state.data
        state.byCategory     = action.payload?.data || [];
        state.byCategoryMeta = action.payload?.meta || null;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loadingStates.fetchByCategory = false;
        state.error = action.payload;
      });

    // ── fetchProductsByFournisseur ───────────────────────────────────────
    builder
      .addCase(fetchProductsByFournisseur.pending, (state) => {
        state.loadingStates.fetchByFournisseur = true;
        state.error = null;
      })
      .addCase(fetchProductsByFournisseur.fulfilled, (state, action) => {
        state.loadingStates.fetchByFournisseur = false;
        // Ne touche pas state.data
        state.byFournisseur     = action.payload?.data || [];
        state.byFournisseurMeta = action.payload?.meta || null;
      })
      .addCase(fetchProductsByFournisseur.rejected, (state, action) => {
        state.loadingStates.fetchByFournisseur = false;
        state.error = action.payload;
      });

    // ── fetchLowStockProducts ────────────────────────────────────────────
    builder
      .addCase(fetchLowStockProducts.pending, (state) => {
        state.loadingStates.fetchLowStock = true;
        state.error = null;
      })
      .addCase(fetchLowStockProducts.fulfilled, (state, action) => {
        state.loadingStates.fetchLowStock = false;
        // Ne touche pas state.data
        state.lowStock          = action.payload?.data      || [];
        state.lowStockMeta      = action.payload?.meta      || null;
        state.lowStockThreshold = action.payload?.threshold ?? 10;
      })
      .addCase(fetchLowStockProducts.rejected, (state, action) => {
        state.loadingStates.fetchLowStock = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError,
  clearSuccess,
  resetCurrent,
  resetByCategory,
  resetByFournisseur,
  resetLowStock,
} = productsSlice.actions;

export default productsSlice.reducer;