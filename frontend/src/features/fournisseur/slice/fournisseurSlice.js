import { createSlice } from "@reduxjs/toolkit";
import {
  fetchFournisseurs,
  fetchFournisseurById,
  createFournisseur,
  updateFournisseur,
  deleteFournisseur,
  searchFournisseurs,
  fetchActiveFournisseurs,
} from "../thunk/fournisseurThunk";
const initialState = {
  data: [],
  meta: {
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  },
  globalStats : {
    total: 0,
    active: 0,
    inactive: 0,
    ville: 0,
  },
  current: null,
  loadingStates: {
    fetch: false,
    fetchOne: false,
    create: false,
    update: false,
    delete: false,
    search: false,
  },
  activeList : [],
  error: null,
  success: false,
};

const fournisseurSlice = createSlice({
  name: "fournisseur",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    resetCurrent: (state) => {
      state.current = null;
    },
  },
  extraReducers: (builder) => {
    // ─── Fetch Fournisseurs ───────────────────────────────────────────────
    builder
      .addCase(fetchFournisseurs.pending, (state) => {
        state.loadingStates.fetch = true;
        state.error = null;
      })
      .addCase(fetchFournisseurs.fulfilled, (state, action) => {
        state.loadingStates.fetch = false;
        state.data = action.payload?.data || [];
        if (action.payload?.meta) {
          state.meta = action.payload.meta;
        }
        if (action.payload?.stats) {
          state.globalStats = action.payload.stats;
        }
      })
      .addCase(fetchFournisseurs.rejected, (state, action) => {
        state.loadingStates.fetch = false;
        state.error = action.payload;
      });

    // ─── Fetch Fournisseur By ID ──────────────────────────────────────────
    builder
      .addCase(fetchFournisseurById.pending, (state) => {
        state.loadingStates.fetchOne = true;
        state.error = null;
      })
      .addCase(fetchFournisseurById.fulfilled, (state, action) => {
        state.loadingStates.fetchOne = false;
        state.current = action.payload;
      })
      .addCase(fetchFournisseurById.rejected, (state, action) => {
        state.loadingStates.fetchOne = false;
        state.error = action.payload;
      });

    // ─── Create Fournisseur ───────────────────────────────────────────────
    builder
      .addCase(createFournisseur.pending, (state) => {
        state.loadingStates.create = true;
        state.error = null;
      })
      .addCase(createFournisseur.fulfilled, (state, action) => {
        state.loadingStates.create = false;
        // ✅ On incrémente juste le total; le refetch sera fait par le composant
        // pour respecter la pagination (évite le push hors-ordre)
        state.meta.total += 1;
        state.success = true;
      })
      .addCase(createFournisseur.rejected, (state, action) => {
        state.loadingStates.create = false;
        state.error = action.payload;
      });

    // ─── Update Fournisseur ───────────────────────────────────────────────
    builder
      .addCase(updateFournisseur.pending, (state) => {
        state.loadingStates.update = true;
        state.error = null;
      })
      .addCase(updateFournisseur.fulfilled, (state, action) => {
        state.loadingStates.update = false;
        const index = state.data.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.current = action.payload;
        state.success = true;
      })
      .addCase(updateFournisseur.rejected, (state, action) => {
        state.loadingStates.update = false;
        state.error = action.payload;
      });

    // ─── Delete Fournisseur ───────────────────────────────────────────────
    builder
      .addCase(deleteFournisseur.pending, (state) => {
        state.loadingStates.delete = true;
        state.error = null;
      })
      .addCase(deleteFournisseur.fulfilled, (state, action) => {
        state.loadingStates.delete = false;
        state.data = state.data.filter((f) => f.id !== action.payload);
        // ✅ Décrémenter le total pour rester cohérent avec la pagination
        state.meta.total = Math.max(0, state.meta.total - 1);
        state.success = true;
      })
      .addCase(deleteFournisseur.rejected, (state, action) => {
        state.loadingStates.delete = false;
        state.error = action.payload;
      });

    // ─── Search Fournisseurs ──────────────────────────────────────────────
    builder
      .addCase(searchFournisseurs.pending, (state) => {
        state.loadingStates.search = true;
        state.error = null;
      })
      .addCase(searchFournisseurs.fulfilled, (state, action) => {
        state.loadingStates.search = false;
        state.data = action.payload?.data || [];
        if (action.payload?.meta) {
          state.meta = action.payload.meta;
        }
      })
      .addCase(searchFournisseurs.rejected, (state, action) => {
        state.loadingStates.search = false;
        state.error = action.payload;
      });
    // ─── Fetch Active Fournisseurs ───────────────────────────────────────
    builder
      .addCase(fetchActiveFournisseurs.pending, (state) => {
        state.loadingStates.fetch = true;
        state.error = null;
      })
      .addCase(fetchActiveFournisseurs.fulfilled, (state, action) => {
        state.loadingStates.fetch = false;  
        state.activeList = action.payload || [];
      })
      .addCase(fetchActiveFournisseurs.rejected, (state, action) => {
        state.loadingStates.fetch = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, resetCurrent } =
  fournisseurSlice.actions;
export default fournisseurSlice.reducer;