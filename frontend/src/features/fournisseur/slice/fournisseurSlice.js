import { createSlice } from "@reduxjs/toolkit";
import {
  fetchFournisseurs,
  fetchFournisseurById,
  createFournisseur,
  updateFournisseur,
  deleteFournisseur,
  fetchActiveFournisseurs,
  fetchFournisseurVilles,
} from "../thunk/fournisseurThunk";

// ✅ searchFournisseurs supprimé — la recherche passe par fetchFournisseurs({ search })
//    Le controller n'a pas de route /search séparée

const initialState = {
  // ─── Liste paginée principale ──────────────────────────────────────────
  data: [],
  meta: {
    current_page: 1,
    last_page:    1,
    total:        0,
    per_page:     10,
  },

  // ─── Stats retournées par index() ─────────────────────────────────────
  globalStats: {
    total:    0,
    active:   0,
    inactive: 0,
    ville:    0,
  },

  // ─── Listes secondaires — ne touchent pas state.data ──────────────────
  activeList:          [], // fetchActiveFournisseurs → dropdowns
  villesfournisseurs:  [], // fetchFournisseurVilles  → filtre ville

  // ─── Fournisseur courant ───────────────────────────────────────────────
  current: null,

  // ─── Loading granulaire ────────────────────────────────────────────────
  // ✅ Un flag par opération — évite les conflits entre opérations simultanées
  loadingStates: {
    fetch:         false,
    fetchOne:      false,
    create:        false,
    update:        false,
    delete:        false,
    fetchActive:   false, // ✅ Séparé de fetch — évite le conflit avec fetchFournisseurs
    fetchVilles:   false, // ✅ Séparé de fetch — évite le conflit
  },

  error:   null,
  success: false,
};

const fournisseurSlice = createSlice({
  name: "fournisseur",
  initialState,
  reducers: {
    clearError:   (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = false; },
    resetCurrent: (state) => { state.current = null; },
  },
  extraReducers: (builder) => {

    // ─── fetchFournisseurs ────────────────────────────────────────────────
    builder
      .addCase(fetchFournisseurs.pending, (state) => {
        state.loadingStates.fetch = true;
        state.error = null;
      })
      .addCase(fetchFournisseurs.fulfilled, (state, action) => {
        state.loadingStates.fetch = false;
        state.data = action.payload?.data || [];
        if (action.payload?.meta)  state.meta        = action.payload.meta;
        if (action.payload?.stats) state.globalStats = action.payload.stats;
      })
      .addCase(fetchFournisseurs.rejected, (state, action) => {
        state.loadingStates.fetch = false;
        state.error = action.payload;
      });

    // ─── fetchFournisseurById ─────────────────────────────────────────────
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

    // ─── createFournisseur ────────────────────────────────────────────────
    builder
      .addCase(createFournisseur.pending, (state) => {
        state.loadingStates.create = true;
        state.error = null;
      })
      .addCase(createFournisseur.fulfilled, (state) => {
        state.loadingStates.create = false;
        // ✅ Pas de push — incohérent avec la pagination
        // Le composant refetch après création
        state.meta.total += 1;
        state.globalStats.total  += 1;
        state.globalStats.active += 1;
        state.success = true;
      })
      .addCase(createFournisseur.rejected, (state, action) => {
        state.loadingStates.create = false;
        state.error = action.payload;
      });

    // ─── updateFournisseur ────────────────────────────────────────────────
    builder
      .addCase(updateFournisseur.pending, (state) => {
        state.loadingStates.update = true;
        state.error = null;
      })
      .addCase(updateFournisseur.fulfilled, (state, action) => {
        state.loadingStates.update = false;
        const index = state.data.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) state.data[index] = action.payload;
        state.current = action.payload;
        state.success = true;
      })
      .addCase(updateFournisseur.rejected, (state, action) => {
        state.loadingStates.update = false;
        state.error = action.payload;
      });

    // ─── deleteFournisseur ────────────────────────────────────────────────
    builder
      .addCase(deleteFournisseur.pending, (state) => {
        state.loadingStates.delete = true;
        state.error = null;
      })
      .addCase(deleteFournisseur.fulfilled, (state, action) => {
        state.loadingStates.delete = false;
        const removed = state.data.find((f) => f.id === action.payload);
        state.data = state.data.filter((f) => f.id !== action.payload);
        state.meta.total = Math.max(0, state.meta.total - 1);
        // ✅ Mettre à jour les stats selon le statut du fournisseur supprimé
        if (removed) {
          state.globalStats.total = Math.max(0, state.globalStats.total - 1);
          if (removed.actif) state.globalStats.active   = Math.max(0, state.globalStats.active   - 1);
          else               state.globalStats.inactive = Math.max(0, state.globalStats.inactive - 1);
        }
        state.success = true;
      })
      .addCase(deleteFournisseur.rejected, (state, action) => {
        state.loadingStates.delete = false;
        state.error = action.payload;
      });

    // ─── fetchActiveFournisseurs ──────────────────────────────────────────
    builder
      .addCase(fetchActiveFournisseurs.pending, (state) => {
        // ✅ fetchActive — flag séparé, n'interfère pas avec fetchLoading
        state.loadingStates.fetchActive = true;
        state.error = null;
      })
      .addCase(fetchActiveFournisseurs.fulfilled, (state, action) => {
        state.loadingStates.fetchActive = false;
        // ✅ activeList — ne touche pas state.data
        state.activeList = action.payload || [];
      })
      .addCase(fetchActiveFournisseurs.rejected, (state, action) => {
        state.loadingStates.fetchActive = false;
        state.error = action.payload;
      });

    // ─── fetchFournisseurVilles ───────────────────────────────────────────
    builder
      .addCase(fetchFournisseurVilles.pending, (state) => {
        // ✅ fetchVilles — flag séparé
        state.loadingStates.fetchVilles = true;
        state.error = null;
      })
      .addCase(fetchFournisseurVilles.fulfilled, (state, action) => {
        state.loadingStates.fetchVilles = false;
        // ✅ villesfournisseurs — ne touche pas state.data
        state.villesfournisseurs = action.payload || [];
      })
      .addCase(fetchFournisseurVilles.rejected, (state, action) => {
        state.loadingStates.fetchVilles = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, resetCurrent } =
  fournisseurSlice.actions;
export default fournisseurSlice.reducer;