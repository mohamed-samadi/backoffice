import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCategories,
  fetchCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchActiveCategories,
  fetchCategoriesWithProductCount,
  bulkUpdateCategoryStatus,
} from "../thunk/categoriesThunk";

const initialState = {
  // ─── Liste paginée principale (CategoriesPage) ──────────────────────────
  data: [],
  meta: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  },
  // ✅ stats retournées par index() — stockées pour éviter de les perdre
  stats: {
    total: 0,
    actifs: 0,
    inactifs: 0,
  },

  // ─── Listes secondaires séparées ────────────────────────────────────────
  // ✅ Séparés de data pour ne pas écraser la liste paginée principale
  activeList: [],        // fetchActiveCategories → dropdowns/selects
  activeWithCount: [],   // fetchCategoriesWithProductCount → dashboard

  // ─── Catégorie courante (show/edit) ─────────────────────────────────────
  current: null,

  // ─── Loading granulaire ──────────────────────────────────────────────────
  loadingStates: {
    fetch: false,
    fetchOne: false,
    create: false,
    update: false,
    delete: false,
    fetchActive: false,
    fetchWithCount: false,
    bulkUpdate: false,
  },

  error: null,
  success: false,
};

const categoriesSlice = createSlice({
  name: "categories",
  initialState,
  reducers: {
    clearError:   (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = false; },
    resetCurrent: (state) => { state.current = null; },
  },
  extraReducers: (builder) => {

    // ─── fetchCategories ────────────────────────────────────────────────────
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loadingStates.fetch = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loadingStates.fetch = false;
        state.data = action.payload?.data || [];
        if (action.payload?.meta)  state.meta  = action.payload.meta;
        // ✅ Stocker les stats retournées par le controller
        if (action.payload?.stats) state.stats = action.payload.stats;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loadingStates.fetch = false;
        state.error = action.payload;
      });

    // ─── fetchCategoryById ──────────────────────────────────────────────────
    builder
      .addCase(fetchCategoryById.pending, (state) => {
        state.loadingStates.fetchOne = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loadingStates.fetchOne = false;
        state.current = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loadingStates.fetchOne = false;
        state.error = action.payload;
      });

    // ─── createCategory ─────────────────────────────────────────────────────
    builder
      .addCase(createCategory.pending, (state) => {
        state.loadingStates.create = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.loadingStates.create = false;
        // ✅ Pas de push — incohérent avec la pagination
        // Le composant doit refetch après création
        state.meta.total += 1;
        state.stats.total += 1;
        state.stats.actifs += 1; // nouvelle catégorie est active par défaut
        state.success = true;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loadingStates.create = false;
        state.error = action.payload;
      });

    // ─── updateCategory ─────────────────────────────────────────────────────
    builder
      .addCase(updateCategory.pending, (state) => {
        state.loadingStates.update = true;
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loadingStates.update = false;
        const index = state.data.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.data[index] = action.payload;
        state.current  = action.payload;
        state.success  = true;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loadingStates.update = false;
        state.error = action.payload;
      });

    // ─── deleteCategory ─────────────────────────────────────────────────────
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.loadingStates.delete = true;
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loadingStates.delete = false;
        const removed = state.data.find((c) => c.id === action.payload);
        state.data = state.data.filter((c) => c.id !== action.payload);
        state.meta.total = Math.max(0, state.meta.total - 1);
        // ✅ Mettre à jour les stats selon le statut de la catégorie supprimée
        if (removed) {
          state.stats.total = Math.max(0, state.stats.total - 1);
          if (removed.is_active) state.stats.actifs  = Math.max(0, state.stats.actifs  - 1);
          else                   state.stats.inactifs = Math.max(0, state.stats.inactifs - 1);
        }
        state.success = true;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loadingStates.delete = false;
        state.error = action.payload;
      });

    // ─── fetchActiveCategories ──────────────────────────────────────────────
    builder
      .addCase(fetchActiveCategories.pending, (state) => {
        state.loadingStates.fetchActive = true;
        state.error = null;
      })
      .addCase(fetchActiveCategories.fulfilled, (state, action) => {
        state.loadingStates.fetchActive = false;
        state.activeList = action.payload || [];
      })
      .addCase(fetchActiveCategories.rejected, (state, action) => {
        state.loadingStates.fetchActive = false;
        state.error = action.payload;
      });

    // ─── fetchCategoriesWithProductCount ────────────────────────────────────
    builder
      .addCase(fetchCategoriesWithProductCount.pending, (state) => {
        state.loadingStates.fetchWithCount = true;
        state.error = null;
      })
      .addCase(fetchCategoriesWithProductCount.fulfilled, (state, action) => {
        state.loadingStates.fetchWithCount = false;
        // ✅ activeWithCount — ne touche pas state.data
        state.activeWithCount = action.payload || [];
      })
      .addCase(fetchCategoriesWithProductCount.rejected, (state, action) => {
        state.loadingStates.fetchWithCount = false;
        state.error = action.payload;
      });

    // ─── bulkUpdateCategoryStatus ───────────────────────────────────────────
    builder
      .addCase(bulkUpdateCategoryStatus.pending, (state) => {
        state.loadingStates.bulkUpdate = true;
        state.error = null;
      })
      .addCase(bulkUpdateCategoryStatus.fulfilled, (state, action) => {
        state.loadingStates.bulkUpdate = false;
        const { ids, isActive } = action.payload;
        state.data = state.data.map((cat) =>
          ids.includes(cat.id) ? { ...cat, is_active: isActive } : cat
        );
        // ✅ Recalculer les stats après bulk update
        const changed = state.data.filter((c) => ids.includes(c.id)).length;
        if (isActive) {
          state.stats.actifs   = Math.min(state.stats.total, state.stats.actifs   + changed);
          state.stats.inactifs = Math.max(0,                 state.stats.inactifs - changed);
        } else {
          state.stats.inactifs = Math.min(state.stats.total, state.stats.inactifs + changed);
          state.stats.actifs   = Math.max(0,                 state.stats.actifs   - changed);
        }
        state.success = true;
      })
      .addCase(bulkUpdateCategoryStatus.rejected, (state, action) => {
        state.loadingStates.bulkUpdate = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, resetCurrent } = categoriesSlice.actions;
export default categoriesSlice.reducer;