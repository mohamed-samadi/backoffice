import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCheques, fetchChequeById,
  createCheque, updateCheque, deleteCheque,
  encaisserCheque, marquerImpayeCheque, annulerCheque,
  fetchEcheancesProches,
  fetchChequesByClient,
} from "../thunk/chequesThunk";



// ── Helper : met à jour un chèque dans une liste par id ───────────────────
const updateInList = (list, updated) =>
  list.map((c) => (c.id === updated.id ? updated : c));

const initialState = {
  // ── Liste principale paginée ──────────────────────────────────────────
  data: [],
  databyClient: [],
  meta: { current_page: 1, last_page: 1, total: 0, per_page: 10 },

  stats: {
    total:           0,
    non_encaisse:    0,
    encaisse:        0,
    impaye:          0,
    annule:          0,
    echeance_proche: 0,
  },

  current: null,
  echeancesProches:      [],
  echeancesProchesCount: 0,

  loadingStates: {
    fetch:         false,
    fetchOne:      false,
    create:        false,
    update:        false,
    delete:        false,
    encaisser:     false,
    marquerImpaye: false,
    annuler:       false,
    echeances:     false,
  },

  error:   null,
  success: false,
};

const chequesSlice = createSlice({
  name: "cheques",
  initialState,
  reducers: {
    clearError:        (state) => { state.error   = null;  },
    clearSuccess:      (state) => { state.success = false; },
    resetCurrent:      (state) => { state.current = null;  },
    resetEcheances:    (state) => { state.echeancesProches = []; state.echeancesProchesCount = 0; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChequesByClient.pending,   (state) => {
        state.loadingStates.fetch = true;
        state.error = null;
        })
        .addCase(fetchChequesByClient.fulfilled, (state, action) => {
            state.loadingStates.fetch = false;
            state.databyClient = action.payload?.data || [];
        })
        .addCase(fetchChequesByClient.rejected,  (state, action) => {
            state.loadingStates.fetch = false;
            state.error = action.payload;
        });
    builder
      .addCase(fetchCheques.pending,   (state) => {
        state.loadingStates.fetch = true;
        state.error = null;
      })
      .addCase(fetchCheques.fulfilled, (state, action) => {
        state.loadingStates.fetch = false;
        state.data  = action.payload?.data  || [];
        if (action.payload?.meta)  state.meta  = action.payload.meta;
        if (action.payload?.stats) state.stats = action.payload.stats;
      })
      .addCase(fetchCheques.rejected,  (state, action) => {
        state.loadingStates.fetch = false;
        state.error = action.payload;
      });

    // ── fetchChequeById ───────────────────────────────────────────────
    builder
      .addCase(fetchChequeById.pending,   (state) => {
        state.loadingStates.fetchOne = true;
        state.error = null;
      })
      .addCase(fetchChequeById.fulfilled, (state, action) => {
        state.loadingStates.fetchOne = false;
        state.current = action.payload;
      })
      .addCase(fetchChequeById.rejected,  (state, action) => {
        state.loadingStates.fetchOne = false;
        state.error = action.payload;
      });

    // ── createCheque ──────────────────────────────────────────────────
    builder
      .addCase(createCheque.pending,   (state) => {
        state.loadingStates.create = true;
        state.error = null;
      })
      .addCase(createCheque.fulfilled, (state) => {
        state.loadingStates.create = false;
        // Pas de push — incohérent avec la pagination → refetch côté composant
        state.meta.total       += 1;
        state.stats.total      += 1;
        state.stats.non_encaisse += 1; // nouveau chèque = non_encaisse par défaut
        state.success = true;
      })
      .addCase(createCheque.rejected,  (state, action) => {
        state.loadingStates.create = false;
        state.error = action.payload;
      });

    // ── updateCheque ──────────────────────────────────────────────────
    builder
      .addCase(updateCheque.pending,   (state) => {
        state.loadingStates.update = true;
        state.error = null;
      })
      .addCase(updateCheque.fulfilled, (state, action) => {
        state.loadingStates.update = false;
        state.data    = updateInList(state.data, action.payload);
        state.current = action.payload;
        state.success = true;
      })
      .addCase(updateCheque.rejected,  (state, action) => {
        state.loadingStates.update = false;
        state.error = action.payload;
      });

    // ── deleteCheque ──────────────────────────────────────────────────
    builder
      .addCase(deleteCheque.pending,   (state) => {
        state.loadingStates.delete = true;
        state.error = null;
      })
      .addCase(deleteCheque.fulfilled, (state, action) => {
        state.loadingStates.delete = false;
        const removed = state.data.find((c) => c.id === action.payload);
        state.data       = state.data.filter((c) => c.id !== action.payload);
        state.meta.total = Math.max(0, state.meta.total - 1);
        // ✅ Décrémenter le bon compteur de stats
        if (removed) {
          state.stats.total = Math.max(0, state.stats.total - 1);
          const key = removed.statut;
          if (state.stats[key] !== undefined) {
            state.stats[key] = Math.max(0, state.stats[key] - 1);
          }
        }
        state.success = true;
      })
      .addCase(deleteCheque.rejected,  (state, action) => {
        state.loadingStates.delete = false;
        state.error = action.payload;
      });

    // ── encaisserCheque ───────────────────────────────────────────────
    builder
      .addCase(encaisserCheque.pending,   (state) => {
        state.loadingStates.encaisser = true;
        state.error = null;
      })
      .addCase(encaisserCheque.fulfilled, (state, action) => {
        state.loadingStates.encaisser = false;
        state.data    = updateInList(state.data, action.payload);
        if (state.current?.id === action.payload.id) state.current = action.payload;
        // ✅ Mettre à jour les stats : non_encaisse → encaisse
        state.stats.non_encaisse = Math.max(0, state.stats.non_encaisse - 1);
        state.stats.encaisse    += 1;
        state.success = true;
      })
      .addCase(encaisserCheque.rejected,  (state, action) => {
        state.loadingStates.encaisser = false;
        state.error = action.payload;
      });

    // ── marquerImpayeCheque ───────────────────────────────────────────
    builder
      .addCase(marquerImpayeCheque.pending,   (state) => {
        state.loadingStates.marquerImpaye = true;
        state.error = null;
      })
      .addCase(marquerImpayeCheque.fulfilled, (state, action) => {
        state.loadingStates.marquerImpaye = false;
        const previous = state.data.find((c) => c.id === action.payload.id);
        state.data    = updateInList(state.data, action.payload);
        if (state.current?.id === action.payload.id) state.current = action.payload;
        // ✅ Décrémenter l'ancien statut, incrémenter impaye
        if (previous?.statut && state.stats[previous.statut] !== undefined) {
          state.stats[previous.statut] = Math.max(0, state.stats[previous.statut] - 1);
        }
        state.stats.impaye += 1;
        state.success = true;
      })
      .addCase(marquerImpayeCheque.rejected,  (state, action) => {
        state.loadingStates.marquerImpaye = false;
        state.error = action.payload;
      });

    // ── annulerCheque ─────────────────────────────────────────────────
    builder
      .addCase(annulerCheque.pending,   (state) => {
        state.loadingStates.annuler = true;
        state.error = null;
      })
      .addCase(annulerCheque.fulfilled, (state, action) => {
        state.loadingStates.annuler = false;
        const previous = state.data.find((c) => c.id === action.payload.id);
        state.data    = updateInList(state.data, action.payload);
        if (state.current?.id === action.payload.id) state.current = action.payload;
        // ✅ Décrémenter l'ancien statut, incrémenter annule
        if (previous?.statut && state.stats[previous.statut] !== undefined) {
          state.stats[previous.statut] = Math.max(0, state.stats[previous.statut] - 1);
        }
        state.stats.annule += 1;
        state.success = true;
      })
      .addCase(annulerCheque.rejected,  (state, action) => {
        state.loadingStates.annuler = false;
        state.error = action.payload;
      });

    // ── fetchEcheancesProches ─────────────────────────────────────────
    builder
      .addCase(fetchEcheancesProches.pending,   (state) => {
        state.loadingStates.echeances = true;
        state.error = null;
      })
      .addCase(fetchEcheancesProches.fulfilled, (state, action) => {
        state.loadingStates.echeances      = false;
        state.echeancesProches             = action.payload?.data  || [];
        state.echeancesProchesCount        = action.payload?.count ?? 0;
      })
      .addCase(fetchEcheancesProches.rejected,  (state, action) => {
        state.loadingStates.echeances = false;
        state.error = action.payload;
      });
  },
});

export const {
  clearError, clearSuccess, resetCurrent, resetEcheances,
} = chequesSlice.actions;

export default chequesSlice.reducer;