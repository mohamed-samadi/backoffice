// creditsSlice
import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCredits,
  fetchCreditById,
  createCredit,
  updateCredit,
  deleteCredit,
  enregistrerPaiement,
  generateNumeroCredit,
  fetchCreditsEnRetard,
} from "../thunk/creditsTrunk";

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
  stats: {
    total_credits: 0,
    montant_total: 0,
    montant_paye:  0,
    total_reste:   0,
    en_cours:      0,
    payes:         0,
    en_retard:     0,
  },

  // ─── Listes secondaires ────────────────────────────────────────────────
  enRetardList:   [], // fetchCreditsEnRetard — ne touche pas data
  numeroPreview:  "", // generateNumeroCredit — aperçu dans le formulaire

  // ─── Crédit courant (show/edit) ────────────────────────────────────────
  current: null,

  // ─── Loading granulaire ────────────────────────────────────────────────
  loadingStates: {
    fetch:         false,
    fetchOne:      false,
    create:        false,
    update:        false,
    delete:        false,
    paiement:      false,
    generateNumero:false,
    enRetard:      false,
  },

  error:   null,
  success: false,
};

const creditsSlice = createSlice({
  name: "credits",
  initialState,
  reducers: {
    clearError:   (state) => { state.error = null; },
    clearSuccess: (state) => { state.success = false; },
    resetCurrent: (state) => { state.current = null; },
    clearNumero:  (state) => { state.numeroPreview = ""; },
  },
  extraReducers: (builder) => {

    // ─── fetchCredits ───────────────────────────────────────────────────
    builder
      .addCase(fetchCredits.pending, (state) => {
        state.loadingStates.fetch = true;
        state.error = null;
      })
      .addCase(fetchCredits.fulfilled, (state, action) => {
        state.loadingStates.fetch = false;
        state.data  = action.payload?.data  || [];
        if (action.payload?.meta)  state.meta  = action.payload.meta;
        if (action.payload?.stats) state.stats = action.payload.stats;
      })
      .addCase(fetchCredits.rejected, (state, action) => {
        state.loadingStates.fetch = false;
        state.error = action.payload;
      });

    // ─── fetchCreditById ────────────────────────────────────────────────
    builder
      .addCase(fetchCreditById.pending, (state) => {
        state.loadingStates.fetchOne = true;
        state.error = null;
      })
      .addCase(fetchCreditById.fulfilled, (state, action) => {
        state.loadingStates.fetchOne = false;
        state.current = action.payload;
      })
      .addCase(fetchCreditById.rejected, (state, action) => {
        state.loadingStates.fetchOne = false;
        state.error = action.payload;
      });

    // ─── createCredit ───────────────────────────────────────────────────
    builder
      .addCase(createCredit.pending, (state) => {
        state.loadingStates.create = true;
        state.error = null;
      })
      .addCase(createCredit.fulfilled, (state) => {
        state.loadingStates.create = false;
        // ✅ Pas de push — incohérent avec la pagination
        state.meta.total += 1;
        state.stats.total_credits += 1;
        state.success = true;
      })
      .addCase(createCredit.rejected, (state, action) => {
        state.loadingStates.create = false;
        state.error = action.payload;
      });

    // ─── updateCredit ───────────────────────────────────────────────────
    builder
      .addCase(updateCredit.pending, (state) => {
        state.loadingStates.update = true;
        state.error = null;
      })
      .addCase(updateCredit.fulfilled, (state, action) => {
        state.loadingStates.update = false;
        const index = state.data.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.data[index] = action.payload;
        state.current = action.payload;
        state.success = true;
      })
      .addCase(updateCredit.rejected, (state, action) => {
        state.loadingStates.update = false;
        state.error = action.payload;
      });

    // ─── deleteCredit ───────────────────────────────────────────────────
    builder
      .addCase(deleteCredit.pending, (state) => {
        state.loadingStates.delete = true;
        state.error = null;
      })
      .addCase(deleteCredit.fulfilled, (state, action) => {
        state.loadingStates.delete = false;
        state.data = state.data.filter((c) => c.id !== action.payload);
        state.meta.total        = Math.max(0, state.meta.total - 1);
        state.stats.total_credits = Math.max(0, state.stats.total_credits - 1);
        state.success = true;
      })
      .addCase(deleteCredit.rejected, (state, action) => {
        state.loadingStates.delete = false;
        state.error = action.payload;
      });

    // ─── enregistrerPaiement ────────────────────────────────────────────
    builder
      .addCase(enregistrerPaiement.pending, (state) => {
        state.loadingStates.paiement = true;
        state.error = null;
      })
      .addCase(enregistrerPaiement.fulfilled, (state, action) => {
        state.loadingStates.paiement = false;
        // ✅ Mettre à jour le crédit dans la liste principale
        const index = state.data.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) state.data[index] = action.payload;
        if (state.current?.id === action.payload.id) state.current = action.payload;
        state.success = true;
      })
      .addCase(enregistrerPaiement.rejected, (state, action) => {
        state.loadingStates.paiement = false;
        state.error = action.payload;
      });

    // ─── generateNumeroCredit ───────────────────────────────────────────
    builder
      .addCase(generateNumeroCredit.pending, (state) => {
        state.loadingStates.generateNumero = true;
      })
      .addCase(generateNumeroCredit.fulfilled, (state, action) => {
        state.loadingStates.generateNumero = false;
        state.numeroPreview = action.payload;
      })
      .addCase(generateNumeroCredit.rejected, (state) => {
        state.loadingStates.generateNumero = false;
      });

    // ─── fetchCreditsEnRetard ───────────────────────────────────────────
    builder
      .addCase(fetchCreditsEnRetard.pending, (state) => {
        state.loadingStates.enRetard = true;
        state.error = null;
      })
      .addCase(fetchCreditsEnRetard.fulfilled, (state, action) => {
        state.loadingStates.enRetard = false;
        // ✅ enRetardList — ne touche pas state.data
        state.enRetardList = action.payload?.data || [];
      })
      .addCase(fetchCreditsEnRetard.rejected, (state, action) => {
        state.loadingStates.enRetard = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, resetCurrent, clearNumero } =
  creditsSlice.actions;
export default creditsSlice.reducer;